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
    const { answers, timeTaken } = await request.json()

    // Get questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', decoded.examId)
      .order('order_number')

    if (questionsError || !questions) {
      throw new Error('Failed to fetch questions')
    }

    // Calculate score
    let score = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_option) {
        score++
      }
    })

    // Save result
    const { error: resultError } = await supabase
      .from('student_results')
      .insert({
        student_id: decoded.studentId,
        exam_id: decoded.examId,
        score,
        total_questions: questions.length,
        time_taken_minutes: Math.ceil(timeTaken / 60)
      })

    if (resultError) {
      throw resultError
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100)
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json(
      { error: 'Failed to submit exam' },
      { status: 500 }
    )
  }
}