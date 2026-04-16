import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { authMiddleware } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'

const router = Router()
const supabase = new SupabaseClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { source, target, query } = req.query

  let q = supabase
    .from('translation_memory')
    .select('*')
    .or(`user_id.eq.${req.user!.id},organization_id.is.null,is_shared.eq.true`)

  if (source && target) {
    q = q.eq('source_lang', source).eq('target_lang', target)
  }

  if (query) {
    q = q.or(`source_text.ilike.%${query}%,target_text.ilike.%${query}%`)
  }

  const { data: entries, error } = await q.limit(100)

  if (error) throw error
  res.json({ entries: entries || [] })
})

router.post(
  '/',
  authMiddleware,
  validateRequest(
    z.object({
      source_text: z.string().min(1),
      target_text: z.string().min(1),
      source_lang: z.string().min(2).max(10),
      target_lang: z.string().min(2).max(10),
      context: z.string().optional(),
      industry: z.string().optional(),
    })
  ),
  async (req: Request, res: Response) => {
    const { data: entry, error } = await supabase
      .from('translation_memory')
      .insert({
        ...req.body,
        user_id: req.user!.id,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ entry })
  }
)

router.post('/batch', authMiddleware, async (req: Request, res: Response) => {
  const entries = req.body.entries.map((e: unknown) => ({
    ...(e as object),
    user_id: req.user!.id,
  }))

  const { data: inserted, error } = await supabase
    .from('translation_memory')
    .insert(entries)
    .select()

  if (error) throw error
  res.status(201).json({ entries: inserted })
})

router.get('/match', authMiddleware, async (req: Request, res: Response) => {
  const { text, source_lang, target_lang, min_score } = req.query

  const { data: matches } = await supabase
    .from('translation_memory')
    .select('*')
    .eq('source_lang', source_lang)
    .eq('target_lang', target_lang)
    .gte('quality_score', parseFloat(min_score as string) || 0.7)
    .or(`source_text.ilike.%${text}%,target_text.ilike.%${text}%`)
    .order('quality_score', { ascending: false })
    .limit(10)

  res.json({ matches: matches || [] })
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: entry, error } = await supabase
    .from('translation_memory')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single()

  if (error) throw error
  res.json({ entry })
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('translation_memory')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) throw error
  res.json({ message: 'Entry deleted' })
})

export { router as memoryRouter }
