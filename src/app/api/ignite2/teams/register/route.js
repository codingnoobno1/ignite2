import dbConnect from '@/lib/db';
import Team from '@/models/Team';

/**
 * POST /api/ignite2/teams/register
 * Register a new team with name, track, and members.
 * Body: { name, track, members: [{ name, roll?, phone?, email? }] }
 */
export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { name, track, members } = body;

        // Validation
        if (!name || !name.trim()) {
            return Response.json({ success: false, error: 'Team name is required' }, { status: 400 });
        }
        if (!track || !track.trim()) {
            return Response.json({ success: false, error: 'Track is required' }, { status: 400 });
        }
        if (!members || !Array.isArray(members) || members.length === 0) {
            return Response.json({ success: false, error: 'At least one member is required' }, { status: 400 });
        }

        // Check for valid member names
        const validMembers = members.filter(m => m.name && m.name.trim());
        if (validMembers.length === 0) {
            return Response.json({ success: false, error: 'At least one member must have a name' }, { status: 400 });
        }

        // Check duplicate team name
        const existing = await Team.findOne({ name: name.trim() });
        if (existing) {
            return Response.json({ success: false, error: 'A team with this name already exists' }, { status: 409 });
        }

        // Generate a unique team ID
        const count = await Team.countDocuments();
        const teamId = `team-${String(count + 1).padStart(3, '0')}`;

        // Create team
        const team = await Team.create({
            id: teamId,
            name: name.trim(),
            track: track.trim(),
            members: validMembers.map(m => ({
                name: m.name.trim(),
                roll: m.roll?.trim() || '',
                phone: m.phone?.trim() || '',
                email: m.email?.trim() || '',
            })),
            status: 'pending',
            status_history: [{
                status: 'pending',
                reason: 'Team registered',
                timestamp: new Date(),
                admin: 'registration',
                previous_status: 'new',
            }],
        });

        return Response.json({
            success: true,
            team,
            message: `Team "${team.name}" registered as ${teamId}`,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ success: false, error: 'Failed to register team' }, { status: 500 });
    }
}
