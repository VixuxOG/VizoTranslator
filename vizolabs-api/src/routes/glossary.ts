import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { authMiddleware } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { auditLog } from '../middleware/auditLog.js'

const router = Router()
const supabase = new SupabaseClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { data: glossaries } = await supabase
    .from('glossaries')
    .select('*')
    .or(`created_by.eq.${req.user!.id},is_shared.eq.true`)

  res.json({ glossaries: glossaries || [] })
})

router.post(
  '/',
  authMiddleware,
  validateRequest(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      source_lang: z.string().min(2).max(10),
      target_lang: z.string().min(2).max(10),
      organization_id: z.string().uuid().optional(),
      is_shared: z.boolean().optional(),
    })
  ),
  async (req: Request, res: Response) => {
    const { name, description, source_lang, target_lang, organization_id, is_shared } = req.body

    const { data: glossary, error } = await supabase
      .from('glossaries')
      .insert({
        name,
        description,
        source_lang,
        target_lang,
        organization_id,
        is_shared: is_shared || false,
        created_by: req.user!.id,
      })
      .select()
      .single()

    if (error) throw error

    await auditLog(req.user!.id, 'create_glossary', 'glossary', glossary)
    res.status(201).json({ glossary })
  }
)

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: glossary } = await supabase
    .from('glossaries')
    .select('*, glossary_terms(*)')
    .eq('id', req.params.id)
    .single()

  if (!glossary) {
    return res.status(404).json({ error: 'Glossary not found' })
  }

  res.json({ glossary })
})

router.post(
  '/:id/terms',
  authMiddleware,
  validateRequest(
    z.object({
      source_term: z.string().min(1),
      target_term: z.string().min(1),
      part_of_speech: z.string().optional(),
      notes: z.string().optional(),
      usage_examples: z.array(z.string()).optional(),
    })
  ),
  async (req: Request, res: Response) => {
    const { data: term, error } = await supabase
      .from('glossary_terms')
      .insert({
        glossary_id: req.params.id,
        ...req.body,
      })
      .select()
      .single()

    if (error) throw error

    await auditLog(req.user!.id, 'add_term', 'glossary_term', term)
    res.status(201).json({ term })
  }
)

router.post('/:id/terms/bulk', authMiddleware, async (req: Request, res: Response) => {
  const terms = req.body.terms.map((t: unknown) => ({
    glossary_id: req.params.id,
    ...(t as object),
  }))

  const { data: inserted, error } = await supabase.from('glossary_terms').insert(terms).select()

  if (error) throw error

  res.status(201).json({ terms: inserted })
})

router.patch('/:id/terms/:termId', authMiddleware, async (req: Request, res: Response) => {
  const { data: term, error } = await supabase
    .from('glossary_terms')
    .update(req.body)
    .eq('id', req.params.termId)
    .eq('glossary_id', req.params.id)
    .select()
    .single()

  if (error) throw error

  res.json({ term })
})

router.delete('/:id/terms/:termId', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('glossary_terms')
    .delete()
    .eq('id', req.params.termId)
    .eq('glossary_id', req.params.id)

  if (error) throw error

  res.json({ message: 'Term deleted' })
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('glossaries')
    .delete()
    .eq('id', req.params.id)
    .eq('created_by', req.user!.id)

  if (error) throw error

  res.json({ message: 'Glossary deleted' })
})

export { router as glossaryRouter }
