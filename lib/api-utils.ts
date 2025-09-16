import { NextResponse } from 'next/server'
import { APIError } from './types'

export function createErrorResponse(message: string, statusCode: number): NextResponse<APIError> {
  return NextResponse.json(
    { 
      error: 'Request failed', 
      message, 
      statusCode 
    },
    { status: statusCode }
  )
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode })
}

export async function handleApiError(error: unknown): Promise<NextResponse<APIError>> {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500)
  }
  
  return createErrorResponse('An unexpected error occurred', 500)
}