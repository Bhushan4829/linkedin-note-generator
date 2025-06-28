# 🚀 LinkedIn Note Generator

<div align="center">

![LinkedIn Note Generator](icon/linkedin-note-generator-icon.png)

**AI-Powered LinkedIn Message Generation Tool**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.15.2-green?logo=supabase)](https://supabase.com/)

</div>

## 📖 Overview

LinkedIn Note Generator is a comprehensive AI-powered tool that helps professionals create personalized LinkedIn connection notes, cold emails, and InMail messages. The platform consists of a Chrome extension for seamless LinkedIn integration, a web dashboard for customization, and a robust backend API powered by OpenAI's GPT models.

### ✨ Key Features

- **🎯 One-Click Generation**: Generate personalized LinkedIn notes directly from any LinkedIn profile
- **📧 Multi-Format Support**: Create connection notes, cold emails, and InMail messages
- **🤖 AI-Powered**: Leverages OpenAI's GPT models for intelligent message generation
- **🔧 Customizable Templates**: Build and manage your own message templates
- **📁 Context Integration**: Upload resumes, job descriptions, and context files for better personalization
- **🔐 Secure Authentication**: User authentication with Supabase and encrypted API key storage
- **💾 Message History**: Save and manage your generated messages
- **🎨 Modern UI**: Clean, intuitive interface across all components

## 🏗️ Architecture

The project is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chrome        │    │   Dashboard     │    │   Backend API   │
│   Extension     │◄──►│   (React Web)   │◄──►│   (FastAPI)     │
│   (React/TS)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LinkedIn      │    │   Supabase      │    │   OpenAI API    │
│   Platform      │    │   Database      │    │   (GPT Models)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Chrome browser
- OpenAI API key
- Supabase account

### 1. Chrome Extension Setup

```bash
# Navigate to the Chrome extension directory
cd linkedin-message-generator

# Install dependencies
npm install

# Build the extension
npm run build

# Load the extension in Chrome
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the 'dist' folder
```

### 2. Dashboard Setup

```bash
# Navigate to the dashboard directory
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### 3. Backend API Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv vgenerator

# Activate virtual environment
# Windows:
vgenerator\Scripts\activate
# macOS/Linux:
source vgenerator/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your OpenAI API key and Supabase credentials

# Start the server
uvicorn main:app --reload
```

## 📱 Usage

### Chrome Extension

1. **Install the Extension**: Follow the setup instructions above
2. **Navigate to LinkedIn**: Go to any LinkedIn profile page
3. **Click the Extension**: Click the LinkedIn Note Generator icon in your browser toolbar
4. **Generate Messages**: 
   - Add optional job description or custom prompts
   - Click "Generate LinkedIn Note", "Generate Cold Email", or "Generate LinkedIn InMail"
   - Copy and use the generated message

### Dashboard

1. **Access the Dashboard**: Open the web application
2. **Sign Up/Login**: Create an account or sign in with Google
3. **Configure Settings**:
   - Add your OpenAI API key
   - Upload resume and job description files
   - Customize message templates and prompts
4. **Manage Templates**: Create and edit custom message templates
5. **View History**: Access your generated messages and usage history

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration
BACKEND_URL=http://localhost:8000
```

### Supabase Database Setup

The application requires the following Supabase tables:

- `user_preferences`: User settings and API keys
- `user_context_files`: Uploaded files (resumes, job descriptions)
- `templates`: Custom message templates
- `generated_messages`: Message history

## 📁 Project Structure

```
linkedin-note-generator/
├── 📁 backend/                 # FastAPI backend server
│   ├── main.py                # Main API endpoints
│   ├── services.py            # Business logic
│   ├── supabase_service.py    # Database operations
│   └── requirements.txt       # Python dependencies
├── 📁 linkedin-message-generator/  # Chrome extension
│   ├── src/
│   │   ├── popup.tsx          # Extension popup UI
│   │   ├── templateManager.tsx # Template management
│   │   └── supabaseClient.ts  # Supabase client
│   └── manifest.json          # Extension manifest
├── 📁 dashboard/              # Web dashboard
│   ├── src/
│   │   ├── App.tsx            # Main dashboard component
│   │   └── supabaseClients.ts # Supabase configuration
│   └── package.json           # Node.js dependencies
├── 📁 icon/                   # Extension icons
└── 📄 README.md               # This file
```

## 🛠️ Development

### Running in Development Mode

1. **Backend**: `uvicorn main:app --reload` (runs on http://localhost:8000)
2. **Dashboard**: `npm run dev` (runs on http://localhost:5173)
3. **Chrome Extension**: `npm run build && npm run watch`

### Building for Production

```bash
# Build Chrome extension
cd linkedin-message-generator
npm run build

# Build dashboard
cd dashboard
npm run build

# Deploy backend (configure your hosting platform)
cd backend
# Follow your hosting platform's deployment guide
```

## 🔐 Security Features

- **Encrypted API Keys**: User API keys are encrypted using AES encryption
- **Secure Authentication**: Supabase handles user authentication and session management
- **CORS Protection**: Backend includes proper CORS configuration
- **Input Validation**: All user inputs are validated and sanitized

## 📊 API Endpoints

### Message Generation
- `POST /generate_note` - Generate LinkedIn connection note
- `POST /generate_email` - Generate cold email
- `POST /generate_inmail` - Generate LinkedIn InMail

### User Management
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /user/preferences` - Get user preferences
- `PUT /user/preferences` - Update user preferences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all builds pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join our GitHub Discussions for questions and community support

## 🚀 Roadmap

- [ ] Mobile app version
- [ ] Advanced AI personalization features
- [ ] Integration with CRM systems
- [ ] Analytics and performance tracking
- [ ] Team collaboration features
- [ ] Multi-language support

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Supabase for the backend infrastructure
- React and TypeScript communities
- All contributors and users of this project

---

<div align="center">

**Made with ❤️ for the LinkedIn community**

[⭐ Star this repo](https://github.com/yourusername/linkedin-note-generator) | [🐛 Report Bug](https://github.com/yourusername/linkedin-note-generator/issues) | [💡 Request Feature](https://github.com/yourusername/linkedin-note-generator/issues)

</div>