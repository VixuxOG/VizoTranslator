import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { SupabaseClient } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: string
  organization_id?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
      req.user = decoded
    }
    next()
  } catch {
    next()
  }
}

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export const requireOrganization = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const supabase = new SupabaseClient(supabaseUrl, supabaseServiceKey)
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', req.user.id)
    .limit(1)
    .single()

  if (data) {
    req.user.organization_id = data.organization_id
  }
  next()
}

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}
