# VizoTranslator

> AI-powered translation tool by VizoLabs

## Features

- **AI-Powered Translation** - Advanced neural machine translation powered by Claude AI
- **Multi-Language Support** - Translate between 50+ languages
- **Real-time Translation** - Fast and accurate translations in milliseconds
- **Batch Translation** - Translate multiple texts at once
- **API Access** - RESTful API for seamless integration

## Tech Stack

- **Backend**: Supabase, Node.js
- **AI**: Anthropic Claude API
- **Desktop**: Electron
- **Web**: Next.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/VixuxOG/VizoTranslator.git
cd VizoTranslator

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start the development server
npm run dev
```

### Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Project Structure

```
VizoTranslator/
├── vizolabs-web/        # Web application
├── vizolabs-desktop/    # Desktop application
├── vizolabs-api/        # API services
├── supabase/           # Database migrations
└── docs/               # Documentation
```

## Usage

### Web App

1. Open `vizolabs-web`
2. Select source and target languages
3. Enter text to translate
4. Get instant AI-powered translation

### API

```bash
curl -X POST https://api.vizotranslator.com/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "source": "en", "target": "es"}'
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: https://github.com/VixuxOG/VizoTranslator/issues
- **Email**: support@vizolabs.com

## Authors

**VixuxOG** - _Initial work_ - [GitHub](https://github.com/VixuxOG)

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/VixuxOG">VixuxOG</a> and <a href="https://github.com/VizoLabs">VizoLabs</a>
</p>
