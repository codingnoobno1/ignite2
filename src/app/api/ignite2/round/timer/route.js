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
        const now = new Date();
        // Update lastReset for EVERY action to trigger clients
        timer.lastReset = now.getTime();

        switch (action) {
            case 'start':
                if (!timer.is_running) {
                    timer.is_running = true;
                    timer.started_at = now;
                    // If resuming from pause, use remaining, else use duration
                    const timeToRun = timer.remaining > 0 ? timer.remaining : timer.duration;
                    timer.end_time = new Date(now.getTime() + timeToRun * 1000);
                    timer.paused_at = null;
                }
                break;

            case 'pause':
                if (timer.is_running) {
                    timer.is_running = false;
                    timer.paused_at = now;
                    // Calculate remaining based on end_time
                    if (timer.end_time) {
                        const remainingMs = timer.end_time.getTime() - now.getTime();
                        timer.remaining = Math.max(0, Math.floor(remainingMs / 1000));
                    }
                    timer.end_time = null; // Clear end_time when paused
                }
                break;

            case 'reset':
                timer.remaining = timer.duration;
                timer.is_running = false;
                timer.started_at = null;
                timer.paused_at = null;
                timer.end_time = null;
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
                timer.end_time = null;
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
