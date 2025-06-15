// API endpoint to view job history
import { NextRequest, NextResponse } from 'next/server';
import { JobLogger } from '@/lib/job-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskName = searchParams.get('task');
    const status = searchParams.get('status') as 'started' | 'completed' | 'failed' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const hours = parseInt(searchParams.get('hours') || '24');
      const jobStats = await JobLogger.getJobStats(hours);
      return NextResponse.json({ stats: jobStats });
    }

    const history = await JobLogger.getJobHistory(
      taskName || undefined,
      status || undefined,
      limit,
      offset
    );

    return NextResponse.json({ 
      jobs: history,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit
      }
    });

  } catch (error) {
    console.error('Failed to get job history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job history' },
      { status: 500 }
    );
  }
}