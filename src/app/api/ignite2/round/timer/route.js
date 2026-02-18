import dbConnect from '@/lib/db';
import CompetitionState from '@/models/CompetitionState';

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { round, action, duration } = body;

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

        const validActions = ['start', 'pause', 'reset', 'set'];
        if (!action || !validActions.includes(action)) {
            return new Response(JSON.stringify({ 
                success: false,
                error: `action must be one of: ${validActions.join(', ')}` 
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
                current_round: 1
            });
        }

        const timerKey = round === 1 ? 'round_1_timer' : 'round_2_timer';
        const timer = competitionState[timerKey];

        // Handle timer actions
        switch (action) {
            case 'start':
                if (!timer.is_running) {
                    timer.is_running = true;
                    timer.started_at = new Date();
                    timer.paused_at = null;
                }
                break;

            case 'pause':
                if (timer.is_running) {
                    timer.is_running = false;
                    timer.paused_at = new Date();
                }
                break;

            case 'reset':
                timer.remaining = timer.duration;
                timer.is_running = false;
                timer.started_at = null;
                timer.paused_at = null;
                break;

            case 'set':
                if (duration === undefined || duration < 0) {
                    return new Response(JSON.stringify({ 
                        success: false,
                        error: 'duration must be a non-negative number for set action' 
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
                timer.duration = duration;
                timer.remaining = duration;
                timer.is_running = false;
                timer.started_at = null;
                timer.paused_at = null;
                break;
        }

        competitionState[timerKey] = timer;
        await competitionState.save();

        return new Response(JSON.stringify({ 
            success: true,
            timer_state: timer,
            message: `Timer ${action} successful for round ${round}`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Timer update error:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to update timer' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
