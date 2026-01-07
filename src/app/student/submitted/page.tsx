'use client'

import Link from 'next/link'

export default function ExamSubmitted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your exam has been successfully submitted. You will be notified of your results soon.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              Thank you for taking the exam. You may now close this window.
            </p>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}