"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNote = generateNote;
// chrome-ext/src/api.ts
function generateNote(name, headline) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name && !headline) {
            return "Could not fetch profile info. Please reload the LinkedIn profile.";
        }
        // Try to keep it warm, human, and < 300 chars
        return `Hi ${name}, I came across your profile${headline ? ` (${headline})` : ""} and am genuinely interested in your background. Would love to connect and learn more!`;
    });
}
