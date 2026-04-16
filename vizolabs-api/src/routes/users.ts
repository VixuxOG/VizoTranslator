import { Router, Request, Response } from 'express'
import { SupabaseClient } from '@supabase/supabase-js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { auditLog } from '../middleware/auditLog.js'

const router = Router()
const supabase = new SupabaseClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

router.get('/organizations', authMiddleware, async (req: Request, res: Response) => {
  const { data: orgs } = await supabase
    .from('organization_members')
    .select('organizations(*)')
    .eq('user_id', req.user!.id)

  res.json({ organizations: orgs?.map((o) => o.organizations) || [] })
})

router.post('/organizations', authMiddleware, async (req: Request, res: Response) => {
  const { name, slug, description } = req.body

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      description,
      created_by: req.user!.id,
    })
    .select()
    .single()

  if (error) throw error

  await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: req.user!.id,
    role: 'owner',
  })

  await auditLog(req.user!.id, 'create_organization', 'organization', org)
  res.status(201).json({ organization: org })
})

router.get('/organizations/:id', authMiddleware, async (req: Request, res: Response) => {
  const { data: org } = await supabase
    .from('organizations')
    .select('*, organization_members(*, users(*))')
    .eq('id', req.params.id)
    .single()

  if (!org) {
    return res.status(404).json({ error: 'Organization not found' })
  }

  res.json({ organization: org })
})

router.post('/organizations/:id/members', authMiddleware, async (req: Request, res: Response) => {
  const { user_id, role } = req.body

  const { data: member, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: req.params.id,
      user_id,
      role: role || 'member',
    })
    .select()
    .single()

  if (error) throw error

  await auditLog(req.user!.id, 'add_member', 'organization_member', member)
  res.status(201).json({ member })
})

router.delete(
  '/organizations/:id/members/:userId',
  authMiddleware,
  async (req: Request, res: Response) => {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', req.params.id)
      .eq('user_id', req.params.userId)

    if (error) throw error

    await auditLog(req.user!.id, 'remove_member', 'organization_member', {
      user_id: req.params.userId,
    })
    res.json({ message: 'Member removed' })
  }
)

router.get('/organizations/:id/members', authMiddleware, async (req: Request, res: Response) => {
  const { data: members } = await supabase
    .from('organization_members')
    .select('*, users(id, email, full_name, avatar_url)')
    .eq('organization_id', req.params.id)

  res.json({ members: members || [] })
})

router.patch(
  '/organizations/:id/roles/:userId',
  authMiddleware,
  requireRole('owner'),
  async (req: Request, res: Response) => {
    const { role } = req.body

    const { data: member, error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', req.params.id)
      .eq('user_id', req.params.userId)
      .select()
      .single()

    if (error) throw error

    await auditLog(req.user!.id, 'update_role', 'organization_member', member)
    res.json({ member })
  }
)

export { router as userRouter }
