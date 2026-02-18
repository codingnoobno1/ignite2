import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import CompetitionState from '@/models/CompetitionState';

export async function GET(request) {
    await dbConnect();

    try {
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status') || 'all';
        const searchQuery = searchParams.get('search') || '';
        const trackFilter = searchParams.get('track') || '';

        let teams = await Team.find({});

        // Ensure competition state exists
        const existing = await CompetitionState.findOne({ event_id: 'ignite2' });
        if (!existing) {
            await CompetitionState.create({
                event_id: 'ignite2',
                current_round: 1,
                round_1_timer: { duration: 3600, remaining: 3600, is_running: false },
                round_2_timer: { duration: 3600, remaining: 3600, is_running: false },
            });
        }

        // Apply status filter
        let filteredTeams = teams;
        if (statusFilter !== 'all') {
            filteredTeams = teams.filter(team => team.status === statusFilter);
        }

        // Apply search filter (team name, track, or member names)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredTeams = filteredTeams.filter(team =>
                team.name.toLowerCase().includes(query) ||
                team.track.toLowerCase().includes(query) ||
                team.members.some(member =>
                    member.name.toLowerCase().includes(query) ||
                    member.roll.toLowerCase().includes(query)
                )
            );
        }

        // Apply track filter
        if (trackFilter) {
            filteredTeams = filteredTeams.filter(team => team.track === trackFilter);
        }

        // Calculate status counts
        const statusCounts = {
            all: teams.length,
            pending: teams.filter(t => t.status === 'pending').length,
            arrived: teams.filter(t => t.status === 'arrived').length,
            removed: teams.filter(t => t.status === 'removed').length,
            disqualified: teams.filter(t => t.status === 'disqualified').length,
            eliminated: teams.filter(t => t.status === 'eliminated').length
        };

        return new Response(JSON.stringify({
            teams: filteredTeams,
            total: filteredTeams.length,
            by_status: statusCounts
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch teams' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { teamId, checkedIn } = body;

        // Update team with new status field
        const updateData = {
            checked_in: checkedIn,
            status: checkedIn ? 'arrived' : 'pending'
        };

        // Add arrival timestamp if checking in
        if (checkedIn) {
            updateData.arrival_timestamp = new Date();
        }

        const team = await Team.findOneAndUpdate(
            { id: teamId },
            updateData,
            { returnDocument: 'after' }
        );

        if (!team) {
            return new Response(JSON.stringify({ error: 'Team not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure status_history exists
        if (!team.status_history) {
            team.status_history = [];
        }

        // Add to status history
        team.status_history.push({
            status: checkedIn ? 'arrived' : 'pending',
            reason: checkedIn ? 'Checked in' : 'Check-in reverted',
            timestamp: new Date(),
            admin: 'entry-system',
            previous_status: team.status_history.length > 0
                ? team.status_history[team.status_history.length - 1].status
                : 'pending'
        });

        await team.save();

        return new Response(JSON.stringify({ success: true, team }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Check-in error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
