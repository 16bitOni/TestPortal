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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const examId = params.id

    console.log('Fetching exam:', { examId, decoded })

    // First, get the exam without restrictions to see if it exists
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    console.log('Exam query result:', { exam, examError })

    if (examError || !exam) {
      console.log('Exam not found in database')
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Check ownership - handle both old and new systems
    const hasAccess = 
      (decoded.organizationId && exam.organization_id === decoded.organizationId) ||
      (!decoded.organizationId && exam.admin_id === decoded.adminId) ||
      (exam.admin_id === decoded.adminId) // Always allow if user created the exam

    console.log('Access check:', { 
      hasAccess, 
      userOrgId: decoded.organizationId, 
      examOrgId: exam.organization_id,
      userAdminId: decoded.adminId,
      examAdminId: exam.admin_id
    })

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get students for this exam
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })

    if (studentsError) {
      throw studentsError
    }

    return NextResponse.json({
      exam,
      students: students || []
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    )
  }
}