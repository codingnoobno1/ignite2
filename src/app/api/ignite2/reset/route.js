import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import CompetitionState from '@/models/CompetitionState';

/**
 * POST /api/ignite2/reset
 * Resets all teams to pending and resets competition state.
 */
export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { confirm, admin = 'admin' } = body;

        if (confirm !== 'RESET') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Send { confirm: "RESET" } to confirm this action'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Reset all teams to pending
        const teamResult = await Team.updateMany({}, {
            $set: {
                status: 'pending',
                arrival_timestamp: null,
                current_round: 1,
                promoted_to_round_2: false,
                eliminated_round: null,
                removal_reason: null,
                disqualification_reason: null,
                submission: '',
                submission_timestamp: null,
                submission_round: null,
                votes_received: 0,
            },
            $push: {
                status_history: {
                    status: 'pending',
                    reason: 'Lobby reset by admin',
                    timestamp: new Date(),
                    admin,
                    previous_status: 'reset',
                }
            }
        });

        // Reset competition state
        await CompetitionState.findOneAndUpdate(
            { event_id: 'ignite2' },
            {
                $set: {
                    current_round: 1,
                    round_1_timer: {
                        duration: 3600,
                        remaining: 3600,
                        is_running: false,
                        started_at: null,
                        paused_at: null,
                    },
                    round_2_timer: {
                        duration: 3600,
                        remaining: 3600,
                        is_running: false,
                        started_at: null,
                        paused_at: null,
                    },
                    round_1_end_time: null,
                    round_2_start_time: null,
                }
            },
            { upsert: true }
        );

        return new Response(JSON.stringify({
            success: true,
            message: `Lobby reset complete. ${teamResult.modifiedCount} teams set to pending.`,
            teams_reset: teamResult.modifiedCount,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Reset error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to reset lobby'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
