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

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('admin_id', decoded.adminId)
      .single()

    if (examError || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Get student results with student details
    const { data: results, error: resultsError } = await supabase
      .from('student_results')
      .select(`
        *,
        students!inner(
          student_id,
          name
        )
      `)
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false })

    if (resultsError) {
      throw resultsError
    }

    // Get total number of registered students
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('exam_id', examId)

    if (studentsError) {
      throw studentsError
    }

    // Format results
    const formattedResults = (results || []).map((result: any) => ({
      id: result.id,
      student_id: result.students.student_id,
      student_name: result.students.name,
      score: result.score,
      total_questions: result.total_questions,
      percentage: Math.round((result.score / result.total_questions) * 100),
      time_taken_minutes: result.time_taken_minutes,
      submitted_at: result.submitted_at
    }))

    // Calculate statistics
    const totalStudents = allStudents?.length || 0
    const completedStudents = formattedResults.length
    
    let stats = {
      total_students: totalStudents,
      completed_students: completedStudents,
      average_score: 0,
      highest_score: 0,
      lowest_score: 0,
      average_time: 0
    }

    if (completedStudents > 0) {
      const percentages = formattedResults.map(r => r.percentage)
      const times = formattedResults.map(r => r.time_taken_minutes)
      
      stats.average_score = percentages.reduce((a, b) => a + b, 0) / percentages.length
      stats.highest_score = Math.max(...percentages)
      stats.lowest_score = Math.min(...percentages)
      stats.average_time = times.reduce((a, b) => a + b, 0) / times.length
    }

    return NextResponse.json({
      exam,
      results: formattedResults,
      stats
    })
  } catch (error) {
    console.error('Error fetching exam results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam results' },
      { status: 500 }
    )
  }
}