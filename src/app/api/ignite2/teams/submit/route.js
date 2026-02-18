import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import CompetitionState from '@/models/CompetitionState';

// Simple URL validation
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { team_id, submission_url, round } = body;

        // Validation
        if (!team_id || !submission_url) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'team_id and submission_url are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!isValidUrl(submission_url)) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'submission_url must be a valid URL' 
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

        // Get competition state to check timer
        const competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });
        const currentRound = round || competitionState?.current_round || 1;
        
        // Check deadline
        const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
        const timer = competitionState?.[timerKey];
        
        if (timer && timer.remaining <= 0 && timer.is_running === false && timer.started_at) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'Submission deadline has expired' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update team submission
        team.submission = submission_url;
        team.submission_timestamp = new Date();
        team.submission_round = currentRound;

        await team.save();

        return new Response(JSON.stringify({ 
            success: true,
            team,
            message: 'Submission successful!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Submission error:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to submit project' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
