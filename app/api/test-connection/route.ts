import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export async function GET() {
  if (!supabase) {
    console.error('Missing Supabase environment variables');
    return NextResponse.json(
      { 
        error: 'Server configuration error',
        details: 'Missing Supabase environment variables'
      },
      { status: 500 }
    );
  }

  try {
    // Test 1: Basic Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('stream_requests')
      .select('*')
      .limit(1);

    if (testError) {
      return NextResponse.json(
        { 
          status: 'error',
          test: 'basic_query',
          error: testError.message,
          hint: testError.hint || 'No hint available',
          code: testError.code || 'UNKNOWN_ERROR',
          details: 'Failed to query stream_requests table'
        },
        { status: 200 } // Still return 200 to see the error details
      );
    }

    // Test 2: Check if table exists using information_schema
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'stream_requests')
      .single();

    if (tableError || !tableCheck) {
      return NextResponse.json(
        { 
          status: 'error',
          test: 'table_exists',
          error: tableError?.message || 'Table not found',
          details: 'The stream_requests table does not exist or is not accessible',
          suggestion: 'Run the SQL to create the stream_requests table'
        },
        { status: 200 }
      );
    }

    // If we got here, everything is working
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      tableExists: true,
      rowCount: testData?.length || 0
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        test: 'unexpected_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while testing the connection'
      },
      { status: 200 }
    );
  }
}
