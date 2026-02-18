import dbConnect from '@/lib/db';
import Team from '@/models/Team';

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { team_ids, admin = 'admin' } = body;

        // Validation
        if (!team_ids || !Array.isArray(team_ids) || team_ids.length === 0) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'team_ids must be a non-empty array' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get all arrived teams in round 1
        const allTeams = await Team.find({ 
            status: 'arrived',
            current_round: 1
        });

        if (allTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'No teams available for promotion' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const promotedTeams = [];
        const eliminatedTeams = [];

        // Process each team
        for (const team of allTeams) {
            if (team_ids.includes(team.id)) {
                // Promote team
                team.promoted_to_round_2 = true;
                team.current_round = 2;
                
                team.status_history.push({
                    status: 'arrived',
                    reason: 'Promoted to Round 2',
                    timestamp: new Date(),
                    admin: admin,
                    previous_status: 'arrived'
                });
                
                await team.save();
                promotedTeams.push(team);
            } else {
                // Eliminate team
                team.status = 'eliminated';
                team.eliminated_round = 1;
                team.checked_in = false;
                
                team.status_history.push({
                    status: 'eliminated',
                    reason: 'Not promoted to Round 2',
                    timestamp: new Date(),
                    admin: admin,
                    previous_status: 'arrived'
                });
                
                await team.save();
                eliminatedTeams.push(team);
            }
        }

        return new Response(JSON.stringify({ 
            success: true,
            promoted_teams: promotedTeams,
            eliminated_teams: eliminatedTeams,
            message: `Promoted ${promotedTeams.length} teams to Round 2, eliminated ${eliminatedTeams.length} teams`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Promotion error:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to promote teams' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
