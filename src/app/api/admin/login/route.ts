import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = await request.json()

    console.log('Login attempt:', { adminId, password })

    // Query admin from database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', adminId)
      .single()

    console.log('Database query result:', { admin, error })

    if (error || !admin) {
      console.log('Admin not found or database error')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Simple password comparison (in production, use bcrypt to hash passwords)
    console.log('Password comparison:', { provided: password, stored: admin.password })
    if (admin.password !== password) {
      console.log('Password mismatch')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        admin_id: admin.admin_id,
        organizationId: admin.organization_id || null,
        role: admin.role || 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        admin_id: admin.admin_id,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}