import axios, { AxiosInstance } from 'axios'

export interface TranslateOptions {
  text: string
  source: string
  target: string
  context?: string
  industry?: string
  tone?: 'formal' | 'casual' | 'technical'
  preserveFormat?: boolean
}

export interface TranslateResult {
  translation: string
  source: string
  target: string
  confidence: number
  provider: string
  tokens?: number
  cached?: boolean
}

export interface BatchTranslateOptions extends Omit<TranslateOptions, 'text'> {
  texts: string[]
}

export interface Language {
  code: string
  name: string
  native_name?: string
  rtl?: boolean
}

export interface DetectLanguageResult {
  language: string
  confidence: number
}

export class VizoTranslator {
  private client: AxiosInstance
  private apiKey: string

  constructor(apiKey: string, baseUrl = 'https://api.vizotranslator.com') {
    this.apiKey = apiKey
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async translate(options: TranslateOptions): Promise<TranslateResult> {
    const response = await this.client.post<TranslateResult>('/translate/translate', options)
    return response.data
  }

  async batchTranslate(options: BatchTranslateOptions): Promise<TranslateResult[]> {
    const response = await this.client.post<{ translations: TranslateResult[] }>(
      '/translate/batch',
      {
        texts: options.texts,
        source: options.source,
        target: options.target,
        context: options.context,
        industry: options.industry,
      }
    )
    return response.data.translations
  }

  async detectLanguage(text: string): Promise<DetectLanguageResult> {
    const response = await this.client.post<DetectLanguageResult>('/translate/detect', { text })
    return response.data
  }

  async getLanguages(): Promise<Language[]> {
    const response = await this.client.get<{ languages: Language[] }>('/translate/languages')
    return response.data.languages
  }

  async createProject(data: {
    name: string
    source_lang: string
    target_lang: string
    description?: string
  }): Promise<unknown> {
    const response = await this.client.post('/projects', data)
    return response.data.project
  }

  async getProjects(): Promise<unknown[]> {
    const response = await this.client.get('/projects')
    return response.data.projects
  }

  async addGlossaryTerm(
    glossaryId: string,
    sourceTerm: string,
    targetTerm: string
  ): Promise<unknown> {
    const response = await this.client.post(`/glossaries/${glossaryId}/terms`, {
      source_term: sourceTerm,
      target_term: targetTerm,
    })
    return response.data.term
  }

  async addToMemory(
    sourceText: string,
    targetText: string,
    sourceLang: string,
    targetLang: string
  ): Promise<unknown> {
    const response = await this.client.post('/memory', {
      source_text: sourceText,
      target_text: targetText,
      source_lang: sourceLang,
      target_lang: targetLang,
    })
    return response.data.entry
  }

  async findMatches(
    text: string,
    sourceLang: string,
    targetLang: string,
    minScore = 0.7
  ): Promise<unknown[]> {
    const response = await this.client.get('/memory/match', {
      params: { text, source_lang: sourceLang, target_lang: targetLang, min_score: minScore },
    })
    return response.data.matches
  }
}

export default VizoTranslator
export { VizoTranslator as Client }
