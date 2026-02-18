import dbConnect from '@/lib/db';
import CompetitionState from '@/models/CompetitionState';

export async function GET() {
    await dbConnect();

    try {
        // Get or create competition state
        let competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });

        if (!competitionState) {
            competitionState = await CompetitionState.create({
                event_id: 'ignite2',
                current_round: 1,
                round_1_timer: {
                    duration: 3600,
                    remaining: 3600,
                    is_running: false
                },
                round_2_timer: {
                    duration: 3600,
                    remaining: 3600,
                    is_running: false
                }
            });
        }

        return new Response(JSON.stringify({
            current_round: competitionState.current_round,
            competition_state: competitionState
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Get round error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch round information' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
