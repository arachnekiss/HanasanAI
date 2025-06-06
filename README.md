# HanasanAI - Advanced AI Chatbot with VRM Character

An advanced multilingual AI chatbot mobile web application with immersive 3D VRM character interactions, featuring sophisticated character animation and internationalization technologies powered by GPT-4o.

## Features

- **3D VRM Character Interaction**: Real-time animated AI characters with facial expressions and gestures
- **ChatVRM-style Animations**: Natural blinking, lip sync, and emotion-based character responses
- **Multiple Interface Modes**:
  - Main chat interface with VRM character
  - Messenger-style interface
  - Video call mode with AI character
- **Advanced AI Integration**: Powered by OpenAI GPT-4o with custom instructions support
- **Multilingual Support**: English interface with internationalization framework
- **Voice Features**: Speech-to-text input and voice language preferences
- **Chat Management**: Session history, conversation export, and proactive messaging
- **Responsive Design**: Mobile-first responsive interface

## Technology Stack

- **Backend**: Python Flask with SQLAlchemy ORM
- **Frontend**: HTML5, CSS3, JavaScript with Three.js for 3D rendering
- **3D Graphics**: Three.js with VRM character support
- **Database**: PostgreSQL with automatic migrations
- **AI Integration**: OpenAI GPT-4o API
- **Authentication**: Google OAuth integration
- **Deployment**: Gunicorn WSGI server

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arachnekiss/HanasanAI.git
   cd HanasanAI
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost/hanasanai"
   export SESSION_SECRET="your-session-secret-key"
   ```

4. **Run the application**:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```

## Configuration

### OpenAI API Key

This is an open source application where users provide their own OpenAI API keys:

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Enter your API key in the application settings

### Google Authentication (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add your domain to authorized redirect URIs
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables

## VRM Character Setup

Place VRM character files in the `public/character/` directory. The application supports:
- VRM 0.x and VRM 1.0 formats
- Facial expressions and animations
- Custom character backgrounds in `public/wallpaper/`

## Project Structure

```
HanasanAI/
├── app.py              # Flask application setup
├── main.py             # Application entry point
├── models.py           # Database models
├── routes.py           # Application routes
├── openai_service.py   # OpenAI API integration
├── rate_limiter.py     # API rate limiting
├── templates/          # HTML templates
├── static/             # CSS, JavaScript, assets
├── public/             # VRM characters and backgrounds
├── ChatVRM-main/       # ChatVRM reference implementation
└── ChatVRM-animate-main/ # Animation extensions
```

## Features in Detail

### VRM Character System
- Real-time 3D character rendering using Three.js
- ChatVRM-compatible animation system
- Emotion-based facial expressions
- Natural blinking and idle animations
- Waist-up character framing

### AI Chat Features
- GPT-4o powered conversations
- Custom instruction support
- Conversation history management
- Emotion analysis for character animation
- Message suggestions and proactive messaging

### Interface Modes
- **Main Chat**: Full VRM character interaction
- **Messenger**: Clean text-based interface
- **Video Call**: AI character video call simulation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source. See the license file for details.

## Support

For support and questions, please open an issue on GitHub.

## Acknowledgments

- ChatVRM project for VRM character implementation
- Three.js community for 3D rendering capabilities
- OpenAI for GPT-4o API access
- VRM Consortium for VRM character format standards