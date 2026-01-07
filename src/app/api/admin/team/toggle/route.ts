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

export async function PATCH(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { memberId, isActive } = await request.json()

    // Get current user info to check permissions
    const { data: currentUser, error: userError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.adminId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to manage members
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the member to be updated
    const { data: targetMember, error: memberError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', memberId)
      .eq('organization_id', currentUser.organization_id)
      .single()

    if (memberError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent deactivating owners
    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Cannot deactivate owner' }, { status: 403 })
    }

    // Update member status
    const { data: updatedMember, error: updateError } = await supabase
      .from('admins')
      .update({ is_active: isActive })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true, 
      member: updatedMember 
    })
  } catch (error) {
    console.error('Error toggling member status:', error)
    return NextResponse.json(
      { error: 'Failed to update member status' },
      { status: 500 }
    )
  }
}