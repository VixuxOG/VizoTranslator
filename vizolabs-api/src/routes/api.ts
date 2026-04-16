import { Router, Request, Response } from 'express'
import crypto from 'crypto'
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

router.get('/keys', authMiddleware, async (req: Request, res: Response) => {
  const { data: keys } = await supabase
    .from('api_keys')
    .select(
      'id, name, key_prefix, permissions, rate_limit, usage_count, is_active, expires_at, created_at'
    )
    .eq('user_id', req.user!.id)

  res.json({ keys: keys || [] })
})

router.post(
  '/keys',
  authMiddleware,
  validateRequest(
    z.object({
      name: z.string().min(1),
      permissions: z.array(z.string()).optional(),
      rate_limit: z.number().optional(),
      expires_at: z.string().optional(),
    })
  ),
  async (req: Request, res: Response) => {
    const { name, permissions, rate_limit, expires_at } = req.body

    const key = `vzt_${crypto.randomBytes(24).toString('hex')}`
    const keyPrefix = key.substring(0, 10)
    const keyHash = crypto.createHash('sha256').update(key).digest('hex')

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: req.user!.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions: permissions || ['translate'],
        rate_limit: rate_limit || 100,
        expires_at,
      })
      .select()
      .single()

    if (error) throw error

    await auditLog(req.user!.id, 'create_api_key', 'api_key', { name, key_prefix: keyPrefix })

    res.status(201).json({
      api_key: {
        ...apiKey,
        key,
      },
    })
  }
)

router.delete('/keys/:id', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) throw error

  await auditLog(req.user!.id, 'delete_api_key', 'api_key', { id: req.params.id })
  res.json({ message: 'API key deleted' })
})

router.get('/keys/:id/usage', authMiddleware, async (req: Request, res: Response) => {
  const { data: usage } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('api_key_id', req.params.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: total } = await supabase
    .from('api_keys')
    .select('usage_count')
    .eq('id', req.params.id)
    .single()

  res.json({
    usage: usage || [],
    total_requests: total?.usage_count || 0,
  })
})

export { router as apiRouter }
