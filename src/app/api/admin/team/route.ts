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

export async function GET(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current user info
    const { data: currentUser, error: userError } = await supabase
      .from('admins')
      .select('*, organizations(*)')
      .eq('id', decoded.adminId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in the same organization
    const { data: members, error: membersError } = await supabase
      .from('admins')
      .select(`
        *,
        invited_by_admin:invited_by(name)
      `)
      .eq('organization_id', currentUser.organization_id)
      .order('created_at', { ascending: true })

    if (membersError) {
      throw membersError
    }

    // Format members data
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      admin_id: member.admin_id,
      name: member.name,
      role: member.role,
      is_active: member.is_active,
      created_at: member.created_at,
      invited_by_name: member.invited_by_admin?.name
    }))

    return NextResponse.json({
      members: formattedMembers,
      organization: currentUser.organizations,
      currentUserRole: currentUser.role
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}