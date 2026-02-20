import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '@/lib/db';
import Team from '@/models/Team';

export async function POST(req) {
    try {
        await connectToDatabase();

        // 1. Read teams.json
        const jsonFilePath = path.join(process.cwd(), 'public', 'teams.json');
        if (!fs.existsSync(jsonFilePath)) {
            return NextResponse.json({ success: false, error: 'teams.json not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
        const teamsData = JSON.parse(fileContent);

        // 2. Clear existing teams
        await Team.deleteMany({});
        console.log('Cleared existing teams.');

        // 3. Prepare new teams
        const newTeams = teamsData.map(t => {
            // Generate a simple ID from name if not present
            const id = t.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            return {
                id: id + '-' + Math.floor(Math.random() * 1000), // Ensure uniqueness
                name: t.name,
                track: 'General', // Default track
                members: t.members,
                status: 'pending',
                round_1_score: 0,
                round_2_score: 0,
                // Add leader info to members if needed or keep separately if schema supports. 
                // Schema has members array. Leader is usually in members with role 'Leader'.
            };
        });

        // 4. Insert new teams
        await Team.insertMany(newTeams);

        return NextResponse.json({
            success: true,
            message: `Database seeded with ${newTeams.length} teams.`,
            count: newTeams.length
        });

    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
