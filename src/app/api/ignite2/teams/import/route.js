'use server';

import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '@/lib/db';
import Team from '@/models/Team';

// Helper: capitalize name
const capitalize = (str) => {
    if (!str) return '';
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
};

export async function POST(req) {
    try {
        console.log("Starting CSV Import...");
        const { admin } = await req.json();

        // Basic admin check (can be enhanced)
        if (admin !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Path to the CSV file in public folder
        const csvFilePath = path.join(process.cwd(), 'public', 'Re-Ignite 2.0 (Responses) - Form Responses 1.csv');

        if (!fs.existsSync(csvFilePath)) {
            return NextResponse.json({ success: false, error: 'CSV File not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(csvFilePath, 'utf8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Parsed ${records.length} records.`);

        let updatedCount = 0;
        let createdCount = 0;

        for (const record of records) {
            const teamName = record['Team Name'];
            const idea = record['Initial Idea / Prospectus (400–500 words)'] || record['Prospectus'] || '';
            const leaderName = record['Team Leader Name'];
            const leaderEnrollment = record['Enrollment Number'];

            // Collect members
            const members = [];
            // Leader as first member
            if (leaderName) {
                members.push({
                    name: capitalize(leaderName),
                    enrollment: leaderEnrollment,
                    role: 'Leader'
                });
            }

            // Other members
            for (let i = 1; i <= 3; i++) {
                const memberName = record[`Team Member ${i} Name`];
                const memberEnrollment = record[`Team Member ${i} Enrollment number`] || record[`Team Member ${i} Enrollment Number`]; // CSV header variation check

                if (memberName) {
                    members.push({
                        name: capitalize(memberName),
                        enrollment: memberEnrollment || '',
                        role: 'Member'
                    });
                }
            }

            // Upsert Team
            // We use teamName as the unique identifier.
            // If team exists, we update members and idea to ensure they are current.
            // We preserve existing status if possible, or default to 'pending' for new teams.

            const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } });

            if (existingTeam) {
                existingTeam.members = members;
                existingTeam.idea = idea;
                // Preserve existing fields like 'track' if not empty, otherwise could try to infer (not doing here)
                await existingTeam.save();
                updatedCount++;
            } else {
                await Team.create({
                    name: teamName,
                    members: members,
                    idea: idea,
                    status: 'pending', // Default status for new imports
                    track: 'General', // Default track
                    round_1_score: 0,
                    round_2_score: 0,
                });
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import complete. Created: ${createdCount}, Updated: ${updatedCount}`,
            stats: { created: createdCount, updated: updatedCount }
        });

    } catch (error) {
        console.error('CSV Import Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
