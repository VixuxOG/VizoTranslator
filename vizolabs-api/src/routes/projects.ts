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
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', req.user!.id)
    .order('created_at', { ascending: false })

  res.json({ projects: projects || [] })
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
      industry: z.string().optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      deadline: z.string().optional(),
    })
  ),
  async (req: Request, res: Response) => {
    const { name, description, source_lang, target_lang, industry, priority, deadline } = req.body

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        source_lang,
        target_lang,
        industry,
        priority: priority || 'normal',
        deadline,
        created_by: req.user!.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    await auditLog(req.user!.id, 'create_project', 'project', project)
    res.status(201).json({ project })
  }
)

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: project } = await supabase
    .from('projects')
    .select('*, project_files(*, translation_segments(*))')
    .eq('id', req.params.id)
    .single()

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  res.json({ project })
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: project, error } = await supabase
    .from('projects')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('created_by', req.user!.id)
    .select()
    .single()

  if (error) throw error

  await auditLog(req.user!.id, 'update_project', 'project', project)
  res.json({ project })
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id)
    .eq('created_by', req.user!.id)

  if (error) throw error

  await auditLog(req.user!.id, 'delete_project', 'project', { id: req.params.id })
  res.json({ message: 'Project deleted' })
})

router.post('/:id/files', authMiddleware, async (req: Request, res: Response) => {
  const { filename, file_type, file_size, storage_path, word_count } = req.body

  const { data: file, error } = await supabase
    .from('project_files')
    .insert({
      project_id: req.params.id,
      filename,
      original_filename: filename,
      file_type,
      file_size,
      storage_path,
      word_count,
      created_by: req.user!.id,
    })
    .select()
    .single()

  if (error) throw error

  res.status(201).json({ file })
})

router.get('/:id/stats', authMiddleware, async (req: Request, res: Response) => {
  const { data: files } = await supabase
    .from('project_files')
    .select('word_count, translated_word_count')
    .eq('project_id', req.params.id)

  const totalWords = files?.reduce((sum, f) => sum + (f.word_count || 0), 0) || 0
  const translatedWords = files?.reduce((sum, f) => sum + (f.translated_word_count || 0), 0) || 0

  res.json({
    stats: {
      total_files: files?.length || 0,
      total_words: totalWords,
      translated_words: translatedWords,
      progress: totalWords > 0 ? (translatedWords / totalWords) * 100 : 0,
    },
  })
})

export { router as projectRouter }
