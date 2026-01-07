import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check admins table structure
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .limit(5)

    // Check exams table structure  
    const { data: exams, error: examError } = await supabase
      .from('exams')
      .select('*')
      .limit(5)

    // Check students table
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .limit(5)

    // Try organizations table (might not exist)
    let orgs = null
    let orgError = null
    try {
      const result = await supabase
        .from('organizations')
        .select('*')
        .limit(5)
      orgs = result.data
      orgError = result.error
    } catch (e) {
      orgError = 'Table does not exist'
    }

    return NextResponse.json({
      organizations: {
        data: orgs,
        error: orgError?.message || orgError
      },
      admins: {
        data: admins,
        error: adminError?.message,
        count: admins?.length || 0
      },
      exams: {
        data: exams,
        error: examError?.message,
        count: exams?.length || 0
      },
      students: {
        data: students,
        error: studentError?.message,
        count: students?.length || 0
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    )
  }
}