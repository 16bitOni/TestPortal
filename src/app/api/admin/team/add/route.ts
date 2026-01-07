import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, admin_id, password, role } = await request.json()

    // Get current user info to check permissions and get organization
    const { data: currentUser, error: userError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.adminId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to add members
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Only owners can create admins
    if (role === 'admin' && currentUser.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can create admin members' }, { status: 403 })
    }

    // Check if admin_id already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('admin_id', admin_id)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin ID already exists' },
        { status: 400 }
      )
    }

    // Create new team member
    const { data: newMember, error: createError } = await supabase
      .from('admins')
      .insert({
        admin_id,
        password,
        name,
        organization_id: currentUser.organization_id,
        role,
        invited_by: currentUser.id,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({ 
      success: true, 
      member: newMember 
    })
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
}