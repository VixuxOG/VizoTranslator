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

const plans = {
  free: { price: 0, requests: 100, translate_chars: 5000 },
  starter: { price: 9.99, requests: 1000, translate_chars: 50000 },
  pro: { price: 29.99, requests: 10000, translate_chars: 500000 },
  enterprise: { price: 99.99, requests: -1, translate_chars: -1 },
}

router.get('/plans', (req: Request, res: Response) => {
  res.json({ plans })
})

router.get('/subscription', authMiddleware, async (req: Request, res: Response) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', req.user!.id)
    .eq('status', 'active')
    .single()

  const { data: usage } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', req.user!.id)
    .gte('created_at', subscription?.current_period_start || new Date())

  res.json({
    subscription: subscription || { plan: 'free' },
    usage: {
      requests: usage?.length || 0,
      plan_limits: plans[subscription?.plan as keyof typeof plans] || plans.free,
    },
  })
})

router.post(
  '/subscribe',
  authMiddleware,
  validateRequest(
    z.object({
      plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
    })
  ),
  async (req: Request, res: Response) => {
    const { plan } = req.body

    if (plan === 'free') {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: req.user!.id,
          plan: 'free',
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .select()
        .single()

      if (error) throw error
      return res.json({ subscription })
    }

    res.json({
      message: 'Redirect to payment gateway',
      stripe_link: `https://stripe.com/checkout?plan=${plan}`,
    })
  }
)

router.post('/cancel', authMiddleware, async (req: Request, res: Response) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('user_id', req.user!.id)
    .eq('status', 'active')
    .select()
    .single()

  if (error) throw error
  res.json({ subscription })
})

router.get('/invoices', authMiddleware, async (req: Request, res: Response) => {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  res.json({ invoices: invoices || [] })
})

export { router as billingRouter }
