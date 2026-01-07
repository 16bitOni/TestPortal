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
    const { title, description, duration_minutes, questions } = await request.json()

    // Create exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title,
        description,
        duration_minutes,
        admin_id: decoded.adminId
      })
      .select()
      .single()

    if (examError) {
      throw examError
    }

    // Create questions
    const questionsWithExamId = questions.map((q: any, index: number) => ({
      ...q,
      exam_id: exam.id,
      order_number: index + 1
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsWithExamId)

    if (questionsError) {
      throw questionsError
    }

    return NextResponse.json({ 
      success: true, 
      examId: exam.id,
      exam 
    })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}