import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { SupabaseClient } from '@supabase/supabase-js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const supabase = new SupabaseClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('organization_id', req.user!.organization_id)

  res.json({ webhooks: webhooks || [] })
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, url, events, headers } = req.body
  const secret = crypto.randomBytes(32).toString('hex')

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .insert({
      organization_id: req.user!.organization_id,
      name,
      url,
      events,
      secret,
      headers: headers || {},
      created_by: req.user!.id,
    })
    .select()
    .single()

  if (error) throw error

  res.status(201).json({ webhook: { ...webhook, secret } })
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: webhook, error } = await supabase
    .from('webhooks')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('organization_id', req.user!.organization_id)
    .select()
    .single()

  if (error) throw error
  res.json({ webhook })
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', req.params.id)
    .eq('organization_id', req.user!.organization_id)

  if (error) throw error
  res.json({ message: 'Webhook deleted' })
})

export { router as webhookRouter }
