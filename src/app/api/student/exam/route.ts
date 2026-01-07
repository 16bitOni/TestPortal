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
    // Get exam with questions
    const { data: exam, error } = await supabase
      .from('exams')
      .select(`
        *,
        questions(*)
      `)
      .eq('id', decoded.examId)
      .single()

    if (error || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Sort questions by order
    exam.questions.sort((a: any, b: any) => a.order_number - b.order_number)

    // Remove correct answers from questions
    const questionsWithoutAnswers = exam.questions.map((q: any) => {
      const { correct_option, ...questionWithoutAnswer } = q
      return questionWithoutAnswer
    })

    return NextResponse.json({
      exam: {
        ...exam,
        questions: questionsWithoutAnswers
      }
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    )
  }
}