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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const examId = params.id
    const { name, student_id, password } = await request.json()

    // Verify exam belongs to admin
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id')
      .eq('id', examId)
      .eq('admin_id', decoded.adminId)
      .single()

    if (examError || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Check if student_id already exists for this exam
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('student_id', student_id)
      .eq('exam_id', examId)
      .single()

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student ID already exists for this exam' },
        { status: 400 }
      )
    }

    // Create student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        name,
        student_id,
        password,
        exam_id: examId
      })
      .select()
      .single()

    if (studentError) {
      throw studentError
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error adding student:', error)
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    )
  }
}