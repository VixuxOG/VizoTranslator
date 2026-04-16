# VizoTranslator Documentation

## Overview

VizoTranslator is an AI-powered translation tool developed by VizoLabs.

## Architecture

```
┌─────────────────────────────────────────────┐
│              VizoTranslator                 │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Web    │  │ Desktop  │  │   API    │  │
│  │  (Next)  │  │(Electron)│  │ (Node.js)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │        │
│       └─────────────┼─────────────┘        │
│                     ▼                      │
│              ┌──────────────┐               │
│              │   Supabase   │               │
│              │  (Database)  │               │
│              └──────────────┘               │
│                     │                       │
│                     ▼                       │
│              ┌──────────────┐               │
│              │  Anthropic   │               │
│              │   Claude     │               │
│              └──────────────┘               │
└─────────────────────────────────────────────┘
```

## Components

### Web Application

- **Framework**: Next.js
- **Location**: `vizolabs-web/`
- **Purpose**: Browser-based translation interface

### Desktop Application

- **Framework**: Electron
- **Location**: `vizolabs-desktop/`
- **Purpose**: Native desktop experience

### API Services

- **Framework**: Node.js
- **Location**: `vizolabs-api/`
- **Purpose**: Backend translation API

## API Reference

### POST /translate

Translate text between languages.

**Request:**

```json
{
  "text": "Hello, world!",
  "source": "en",
  "target": "es"
}
```

**Response:**

```json
{
  "translation": "¡Hola, mundo!",
  "source": "en",
  "target": "es",
  "confidence": 0.95
}
```

### GET /languages

Get list of supported languages.

**Response:**

```json
{
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    { "code": "fr", "name": "French" }
  ]
}
```

## Security

- All API requests require authentication
- Rate limiting: 100 requests per minute
- API keys are never exposed client-side

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
