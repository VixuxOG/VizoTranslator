import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { SupabaseClient } from '@supabase/supabase-js'
import type { TranslationRequest, TranslationResponse } from '../types/index.js'

export class TranslationService {
  private anthropic: Anthropic
  private openai: OpenAI
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string, anthropicKey: string, openaiKey: string) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey })
    this.openai = new OpenAI({ apiKey: openaiKey })
    this.supabase = new SupabaseClient(supabaseUrl, supabaseKey)
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, source, target, context, industry, preserveFormat, tone } = request
    const provider = request.provider || 'anthropic'

    const cachedResult = await this.checkCache(text, source, target)
    if (cachedResult) {
      return {
        ...cachedResult,
        cached: true,
      }
    }

    const glossaryTerms = await this.getGlossaryTerms(source, target)
    const prompt = this.buildPrompt(text, source, target, context, industry, tone, glossaryTerms)

    let translation: string
    let tokens = 0

    if (provider === 'anthropic') {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })
      translation = response.content[0].type === 'text' ? response.content[0].text : ''
      tokens = response.usage.input_tokens + response.usage.output_tokens
    } else {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
      })
      translation = response.choices[0].message.content || ''
      tokens = response.usage.total_tokens
    }

    const confidence = this.calculateConfidence(translation, text)

    await this.saveToHistory(text, translation, source, target, confidence, provider, tokens)
    await this.addToCache(text, translation, source, target)

    return {
      translation,
      source,
      target,
      confidence,
      provider,
      tokens,
      cached: false,
    }
  }

  async batchTranslate(
    texts: string[],
    source: string,
    target: string,
    options?: Partial<TranslationRequest>
  ): Promise<TranslationResponse[]> {
    const results = []
    for (const text of texts) {
      const result = await this.translate({ text, source, target, ...options })
      results.push(result)
    }
    return results
  }

  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Detect the language of this text and respond with only the ISO 639-1 language code: "${text.substring(0, 500)}"`,
        },
      ],
    })

    const detectedLang =
      response.content[0].type === 'text' ? response.content[0].text.trim() : 'en'
    return { language: detectedLang, confidence: 0.95 }
  }

  private buildPrompt(
    text: string,
    source: string,
    target: string,
    context?: string,
    industry?: string,
    tone?: string,
    glossary?: { source_term: string; target_term: string }[]
  ): string {
    let prompt = `Translate the following text from ${source} to ${target}.`

    if (context) {
      prompt += `\n\nContext: ${context}`
    }

    if (industry) {
      prompt += `\n\nIndustry/Terminology domain: ${industry}`
    }

    if (tone) {
      prompt += `\n\nTone: ${tone}`
    }

    if (glossary && glossary.length > 0) {
      prompt += `\n\nUse these glossary terms consistently:\n`
      glossary.forEach((g) => {
        prompt += `- "${g.source_term}" → "${g.target_term}"\n`
      })
    }

    prompt += `\n\nText to translate:\n${text}`

    prompt += `\n\nProvide only the translation, without explanations or notes.`

    return prompt
  }

  private async checkCache(
    text: string,
    source: string,
    target: string
  ): Promise<Omit<TranslationResponse, 'cached'> | null> {
    const { data } = await this.supabase
      .from('translation_memory')
      .select('target_text, quality_score')
      .eq('source_text', text)
      .eq('source_lang', source)
      .eq('target_lang', target)
      .order('usage_count', { ascending: false })
      .limit(1)
      .single()

    return data
      ? {
          translation: data.target_text,
          source,
          target,
          confidence: data.quality_score || 0.9,
          provider: 'cache',
        }
      : null
  }

  private async saveToHistory(
    sourceText: string,
    targetText: string,
    source: string,
    target: string,
    confidence: number,
    provider: string,
    tokens: number
  ): Promise<void> {
    await this.supabase.from('translation_history').insert({
      source_text: sourceText,
      target_text: targetText,
      source_lang: source,
      target_lang: target,
      confidence_score: confidence,
      ai_provider: provider,
      ai_model: `model-${Date.now()}`,
    })
  }

  private async addToCache(
    text: string,
    translation: string,
    source: string,
    target: string
  ): Promise<void> {
    await this.supabase.from('translation_memory').insert({
      source_text: text,
      target_text: translation,
      source_lang: source,
      target_lang: target,
      quality_score: 0.9,
    })
  }

  private async getGlossaryTerms(
    source: string,
    target: string
  ): Promise<{ source_term: string; target_term: string }[]> {
    const { data } = await this.supabase
      .from('glossary_terms')
      .select('source_term, target_term')
      .eq(
        'glossary_id',
        this.supabase
          .from('glossaries')
          .select('id')
          .eq('source_lang', source)
          .eq('target_lang', target)
          .limit(1)
      )

    return data || []
  }

  private calculateConfidence(translation: string, original: string): number {
    if (!translation || translation.length === 0) return 0
    const lengthRatio = Math.min(translation.length / original.length, 1.5)
    return Math.min(lengthRatio * 0.9, 0.99)
  }
}

export const translationService = new TranslationService(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  process.env.ANTHROPIC_API_KEY || '',
  process.env.OPENAI_API_KEY || ''
)
