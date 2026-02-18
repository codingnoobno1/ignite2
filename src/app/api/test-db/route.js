import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import CompetitionState from '@/models/CompetitionState';

export async function GET() {
    try {
        await dbConnect();

        // Create a dummy team to verify model
        const testId = 'verify-db-' + Date.now();
        const testTeamData = {
            id: testId,
            name: 'Verification Team',
            track: 'System',
            members: [{ name: 'Tester', roll: '000', phone: '0000000000', email: 'test@example.com' }]
        };

        const team = await Team.create(testTeamData);

        // Verify CompetitionState model
        const stateCount = await CompetitionState.countDocuments();

        // Cleanup
        await Team.deleteOne({ id: testId });

        return NextResponse.json({
            success: true,
            message: 'Database initialization verified',
            createdTeam: team,
            stateCount
        });
    } catch (error) {
        console.error('Database verification error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
