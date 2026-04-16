import { Request, Response, NextFunction } from 'express'
import { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

export const auditLog = async (
  userId: string,
  action: string,
  resourceType: string,
  newValue?: unknown,
  metadata?: Record<string, unknown>
) => {
  try {
    const supabase = new SupabaseClient(supabaseUrl, supabaseServiceKey)
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      new_value: newValue,
      metadata: metadata || {},
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
}
