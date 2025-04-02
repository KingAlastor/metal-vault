import { NextResponse } from 'next/server'

interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': string;
    'blocked-uri': string;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'status-code'?: number;
    'script-sample'?: string;
  }
}

export async function POST(request: Request) {
  try {
    const report = await request.json() as CSPViolationReport;
    
    // Log the violation report with additional context
    console.error('CSP Violation:', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...report['csp-report']
    });

    // Here you could:
    // 1. Store in a database
    // 2. Send to a monitoring service (e.g., Sentry, DataDog)
    // 3. Alert your team
    // 4. Analyze patterns of violations

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json(
      { error: 'Failed to process report' },
      { status: 500 }
    );
  }
} 