import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { SupabaseClient } from '@supabase/supabase-js'
import { authMiddleware, generateToken } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { auditLog } from '../middleware/auditLog.js'

const router = Router()
const supabase = new SupabaseClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        auth_provider: 'email',
      })
      .select()
      .single()

    if (error) throw error

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    await auditLog(user.id, 'register', 'user')

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    await auditLog(user.id, 'login', 'user')

    res.json({ user, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  await auditLog(req.user!.id, 'logout', 'user')
  res.json({ message: 'Logged out successfully' })
})

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user!.id).single()

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({ user })
})

router.post('/oauth/google', async (req: Request, res: Response) => {
  const { token } = req.body

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_provider_id', `google:${token}`)
    .single()

  if (!user) {
    const newUser = {
      email: `${token}@placeholder.com`,
      auth_provider: 'google',
      auth_provider_id: `google:${token}`,
    }

    const { data: created } = await supabase.from('users').insert(newUser).select().single()

    const authToken = generateToken({ id: created!.id, email: created!.email, role: created!.role })
    return res.json({ user: created, token: authToken })
  }

  const authToken = generateToken({ id: user.id, email: user.email, role: user.role })
  res.json({ user, token: authToken })
})

export { router as authRouter }
