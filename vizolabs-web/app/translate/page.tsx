'use client'

import { useState } from 'react'
import { Languages, Copy, Volume2, Star, Bookmark, Settings, ArrowRightLeft } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('es')
  const [isTranslating, setIsTranslating] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)

    setTimeout(() => {
      setTargetText(`[Translation of "${sourceText}" to ${targetLang}]`)
      setIsTranslating(false)
    }, 1500)
  }

  const handleSwap = () => {
    const tempLang = sourceLang
    setSourceLang(targetLang)
    setTargetLang(tempLang)
    setSourceText(targetText)
    setTargetText(sourceText)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(targetText)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Languages className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold">VizoTranslator</span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-primary-600 font-medium">Translate</button>
              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Projects
              </button>
              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Glossaries
              </button>
              <Settings className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="input-field w-48"
          >
            <option value="auto">Auto-detect</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="input-field w-48"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Translation Area */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Source */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                {detectedLang
                  ? `Detected: ${LANGUAGES.find((l) => l.code === detectedLang)?.name}`
                  : 'Source'}
              </span>
              <span className="text-sm text-gray-400">{sourceText.length} / 50,000</span>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-64 p-4 border-0 resize-none focus:ring-0 text-lg bg-transparent dark:text-white"
            />
          </div>

          {/* Target */}
          <div className="card relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                {LANGUAGES.find((l) => l.code === targetLang)?.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Text to speech"
                >
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Save to favorites"
                >
                  <Star className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Save"
                >
                  <Bookmark className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <textarea
              value={targetText}
              readOnly
              placeholder="Translation will appear here..."
              className="w-full h-64 p-4 border-0 resize-none focus:ring-0 text-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {sourceText.length > 0 && <span>≈ {Math.ceil(sourceText.length / 1000)} credits</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSourceText('')
                setTargetText('')
              }}
              className="btn-secondary"
            >
              Clear
            </button>
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="btn-primary flex items-center gap-2"
            >
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Translating...
                </>
              ) : (
                <>Translate</>
              )}
            </button>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <FeatureCard
            title="File Translation"
            description="Upload PDF, DOCX, or TXT files"
            icon="📄"
          />
          <FeatureCard
            title="Batch Translation"
            description="Translate multiple texts at once"
            icon="📚"
          />
          <FeatureCard
            title="Website Translation"
            description="Enter a URL to translate any webpage"
            icon="🌐"
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="card flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow">
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
