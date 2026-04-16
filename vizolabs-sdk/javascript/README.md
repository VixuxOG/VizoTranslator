# VizoTranslator JavaScript SDK

Official JavaScript/TypeScript SDK for VizoTranslator API.

## Installation

```bash
npm install @vizotranslator/sdk
```

## Usage

```javascript
import { VizoTranslator } from '@vizotranslator/sdk'

const client = new VizoTranslator('your-api-key')

// Single translation
const result = await client.translate({
  text: 'Hello, world!',
  source: 'en',
  target: 'es',
  tone: 'formal',
})

console.log(result.translation) // "¡Hola, mundo!"

// Batch translation
const results = await client.batchTranslate({
  texts: ['Hello', 'Goodbye', 'Thank you'],
  source: 'en',
  target: 'fr',
})

// Detect language
const detected = await client.detectLanguage('Bonjour')
console.log(detected.language) // 'fr'

// Get supported languages
const languages = await client.getLanguages()

// Add to translation memory
await client.addToMemory('Hello', 'Bonjour', 'en', 'fr')

// Find matches in translation memory
const matches = await client.findMatches('Hello', 'en', 'fr')
```

## API Reference

### `translate(options)`

Translate text between languages.

**Options:**

- `text` (string, required) - Text to translate
- `source` (string, required) - Source language code
- `target` (string, required) - Target language code
- `context` (string, optional) - Context for better translation
- `industry` (string, optional) - Industry domain
- `tone` (string, optional) - 'formal', 'casual', or 'technical'
- `preserveFormat` (boolean, optional) - Preserve formatting

**Returns:**

```typescript
{
  translation: string;
  source: string;
  target: string;
  confidence: number;
  provider: string;
  tokens?: number;
  cached?: boolean;
}
```

### `batchTranslate(options)`

Translate multiple texts at once.

### `detectLanguage(text)`

Auto-detect the language of text.

### `getLanguages()`

Get list of supported languages.

### `createProject(data)`

Create a new translation project.

### `addGlossaryTerm(glossaryId, sourceTerm, targetTerm)`

Add a term to a glossary.

### `addToMemory(sourceText, targetText, sourceLang, targetLang)`

Add a translation to memory.

### `findMatches(text, sourceLang, targetLang, minScore)`

Find similar translations in memory.
