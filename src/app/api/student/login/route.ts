import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json()

    // Query student from database
    const { data: student, error } = await supabase
      .from('students')
      .select('*, exams(*)')
      .eq('student_id', studentId)
      .single()

    if (error || !student) {
      return NextResponse.json(
        { error: 'Invalid student ID or password' },
        { status: 401 }
      )
    }

    // Simple password check (in production, use bcrypt)
    if (student.password !== password) {
      return NextResponse.json(
        { error: 'Invalid student ID or password' },
        { status: 401 }
      )
    }

    // Check if exam is active
    if (!student.exams?.is_active) {
      return NextResponse.json(
        { error: 'This exam is not currently active' },
        { status: 403 }
      )
    }

    // Check if student has already submitted
    const { data: existingResult } = await supabase
      .from('student_results')
      .select('id')
      .eq('student_id', student.id)
      .eq('exam_id', student.exam_id)
      .single()

    if (existingResult) {
      return NextResponse.json(
        { error: 'You have already completed this exam' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id, 
        student_id: student.student_id,
        examId: student.exam_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '4h' }
    )

    return NextResponse.json({
      success: true,
      token,
      examId: student.exam_id,
      student: {
        id: student.id,
        student_id: student.student_id,
        name: student.name
      }
    })
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}