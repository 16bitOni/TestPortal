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
    console.log('Fetching exams for user:', decoded)

    // Simplified approach: get all exams for this admin, regardless of organization
    const { data: exams, error } = await supabase
      .from('exams')
      .select(`
        *,
        students(count)
      `)
      .eq('admin_id', decoded.adminId)
      .order('created_at', { ascending: false })

    console.log('Exams query result:', { exams, error })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Get student counts separately to avoid complex join issues
    const examsWithCount = await Promise.all(
      (exams || []).map(async (exam) => {
        const { data: students, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('exam_id', exam.id)

        return {
          ...exam,
          student_count: studentError ? 0 : (students?.length || 0)
        }
      })
    )

    console.log('Final exams with counts:', examsWithCount)
    return NextResponse.json({ exams: examsWithCount })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, duration_minutes } = await request.json()

    const examData: any = {
      title,
      description,
      duration_minutes,
      admin_id: decoded.adminId
    }

    // Add organization_id if available
    if (decoded.organizationId) {
      examData.organization_id = decoded.organizationId
    }

    const { data: exam, error } = await supabase
      .from('exams')
      .insert(examData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ exam })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}