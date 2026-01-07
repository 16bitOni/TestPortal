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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const examId = params.id
    const { is_active } = await request.json()

    // Update exam status
    const { data: exam, error } = await supabase
      .from('exams')
      .update({ is_active })
      .eq('id', examId)
      .eq('admin_id', decoded.adminId)
      .select()
      .single()

    if (error || !exam) {
      return NextResponse.json(
        { error: 'Exam not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exam })
  } catch (error) {
    console.error('Error toggling exam status:', error)
    return NextResponse.json(
      { error: 'Failed to update exam status' },
      { status: 500 }
    )
  }
}