import dbConnect from '@/lib/db';
import Team from '@/models/Team';

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { team_id } = body;

        if (!team_id) {
            return new Response(JSON.stringify({
                success: false,
                error: 'team_id is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Find the team
        const team = await Team.findOne({ id: team_id });

        if (!team) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Team not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if already checked in
        if (team.status === 'arrived') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Team already checked in',
                team
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get previous status for history
        const previousStatus = team.status;

        // Update team status
        team.status = 'arrived';
        team.checked_in = true;
        team.arrival_timestamp = new Date();

        // Ensure status_history exists
        if (!team.status_history) {
            team.status_history = [];
        }

        // Add to status history
        team.status_history.push({
            status: 'arrived',
            reason: 'Team checked in',
            timestamp: new Date(),
            admin: 'entry-system',
            previous_status: previousStatus
        });

        await team.save();

        return new Response(JSON.stringify({
            success: true,
            team,
            message: `${team.name} checked in successfully!`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Check-in error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to check in team'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
