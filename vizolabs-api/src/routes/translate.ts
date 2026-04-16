import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { translationService } from '../services/translation.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { auditLog } from '../middleware/auditLog.js'

const router = Router()

const translateSchema = z.object({
  text: z.string().min(1).max(50000),
  source: z.string().min(2).max(10),
  target: z.string().min(2).max(10),
  context: z.string().optional(),
  industry: z.string().optional(),
  preserveFormat: z.boolean().optional(),
  tone: z.enum(['formal', 'casual', 'technical']).optional(),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
})

router.post(
  '/translate',
  authMiddleware,
  validateRequest(translateSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await translationService.translate(req.body)
      await auditLog(req.user!.id, 'translate', 'translation', result, {
        characters: req.body.text.length,
      })
      res.json(result)
    } catch (error) {
      console.error('Translation error:', error)
      res.status(500).json({ error: 'Translation failed' })
    }
  }
)

router.post(
  '/batch',
  authMiddleware,
  validateRequest(
    z.object({
      texts: z.array(z.string()).min(1).max(100),
      source: z.string().min(2).max(10),
      target: z.string().min(2).max(10),
      context: z.string().optional(),
      industry: z.string().optional(),
    })
  ),
  async (req: Request, res: Response) => {
    try {
      const { texts, source, target, context, industry } = req.body
      const results = await translationService.batchTranslate(texts, source, target, {
        context,
        industry,
      })
      res.json({ translations: results })
    } catch (error) {
      console.error('Batch translation error:', error)
      res.status(500).json({ error: 'Batch translation failed' })
    }
  }
)

router.post(
  '/detect',
  authMiddleware,
  validateRequest(z.object({ text: z.string().min(1).max(5000) })),
  async (req: Request, res: Response) => {
    try {
      const { text } = req.body
      const result = await translationService.detectLanguage(text)
      res.json(result)
    } catch (error) {
      console.error('Language detection error:', error)
      res.status(500).json({ error: 'Language detection failed' })
    }
  }
)

router.get('/languages', optionalAuth, async (req: Request, res: Response) => {
  const languages = [
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
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'cs', name: 'Czech' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'fa', name: 'Persian' },
    { code: 'sw', name: 'Swahili' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'kn', name: 'Kannada' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ne', name: 'Nepali' },
    { code: 'si', name: 'Sinhala' },
  ]
  res.json({ languages })
})

export { router as translateRouter }
