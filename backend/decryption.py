import base64
import json
from Crypto.Cipher import AES
import hashlib

def decrypt_api_key(encrypted_api_key, secret):
    # CryptoJS AES output is base64, but with OpenSSL salt prefix
    # Copied from https://stackoverflow.com/a/63346349/3760486 and adapted for your needs
    encrypted = base64.b64decode(encrypted_api_key)
    if encrypted[:8] != b'Salted__':
        raise ValueError("Invalid encrypted data (no OpenSSL salt header)")
    salt = encrypted[8:16]
    key, iv = _evp_bytes_to_key(secret.encode('utf-8'), salt, key_len=32, iv_len=16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(encrypted[16:])
    # Remove PKCS#7 padding
    pad_len = decrypted[-1]
    return decrypted[:-pad_len].decode('utf-8')

def _evp_bytes_to_key(password, salt, key_len, iv_len):
    # CryptoJS compatible key/iv derivation
    dtot = b''
    d = b''
    while len(dtot) < (key_len + iv_len):
        d = hashlib.md5(d + password + salt).digest()
        dtot += d
    return dtot[:key_len], dtot[key_len:key_len+iv_len]