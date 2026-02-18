import dbConnect from '@/lib/db';
import CompetitionState from '@/models/CompetitionState';

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { round, admin = 'admin' } = body;

        // Validation
        if (!round || (round !== 1 && round !== 2)) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'round must be 1 or 2' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get competition state
        let competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });

        if (!competitionState) {
            competitionState = await CompetitionState.create({
                event_id: 'ignite2',
                current_round: round
            });
        } else {
            // Update round
            competitionState.current_round = round;

            // Set timestamps
            if (round === 2 && !competitionState.round_2_start_time) {
                competitionState.round_2_start_time = new Date();
                if (!competitionState.round_1_end_time) {
                    competitionState.round_1_end_time = new Date();
                }
            }

            await competitionState.save();
        }

        return new Response(JSON.stringify({ 
            success: true,
            competition_state: competitionState,
            message: `Round set to ${round}`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Set round error:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to set round' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
