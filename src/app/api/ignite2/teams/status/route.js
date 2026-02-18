import dbConnect from '@/lib/db';
import Team from '@/models/Team';

const VALID_STATUS_TRANSITIONS = {
    'pending': ['arrived', 'removed'],
    'arrived': ['removed', 'disqualified', 'eliminated'],
    'removed': ['arrived'],  // Restore
    'disqualified': ['arrived'],  // Restore
    'eliminated': []  // Cannot restore eliminated teams
};

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { team_id, new_status, reason, admin = 'admin' } = body;

        // Validation
        if (!team_id || !new_status) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'team_id and new_status are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const validStatuses = ['pending', 'arrived', 'removed', 'disqualified', 'eliminated'];
        if (!validStatuses.includes(new_status)) {
            return new Response(JSON.stringify({ 
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
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

        const previousStatus = team.status;

        // Validate status transition
        const allowedTransitions = VALID_STATUS_TRANSITIONS[previousStatus] || [];
        if (!allowedTransitions.includes(new_status) && previousStatus !== new_status) {
            return new Response(JSON.stringify({ 
                success: false,
                error: `Cannot transition from ${previousStatus} to ${new_status}` 
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update team status
        team.status = new_status;
        team.checked_in = (new_status === 'arrived');

        // Handle specific status changes
        if (new_status === 'removed') {
            team.removal_reason = reason || 'No reason provided';
        } else if (new_status === 'disqualified') {
            team.disqualification_reason = reason || 'No reason provided';
        } else if (new_status === 'arrived' && (previousStatus === 'removed' || previousStatus === 'disqualified')) {
            // Restore operation - clear reasons
            team.removal_reason = null;
            team.disqualification_reason = null;
            team.arrival_timestamp = new Date();
        }

        // Add to status history
        team.status_history.push({
            status: new_status,
            reason: reason || `Status changed to ${new_status}`,
            timestamp: new Date(),
            admin: admin,
            previous_status: previousStatus
        });

        await team.save();

        return new Response(JSON.stringify({ 
            success: true,
            team,
            message: `Team status updated to ${new_status}`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Status update error:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to update team status' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
