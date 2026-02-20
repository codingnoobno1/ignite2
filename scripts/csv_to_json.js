const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFilePath = path.join(__dirname, '../public', 'Re-Ignite 2.0 (Responses) - Form Responses 1.csv');
const jsonFilePath = path.join(__dirname, '../public', 'teams.json');

const fileContent = fs.readFileSync(csvFilePath, 'utf8');

const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
});

const cleanedTeams = records.map(record => {
    const teamName = record['Team Name'];
    const teamSize = record['Team Size'];
    const leaderName = record['Team Leader Name'];
    const leaderEnrollment = record['Enrollment Number'];
    const leaderEmail = record['Email ID (Gmail) '];
    const leaderPhone = record['Phone Number'];

    const members = [];
    if (leaderName) {
        members.push({ name: leaderName, enrollment: leaderEnrollment, role: 'Leader' });
    }

    for (let i = 1; i <= 3; i++) {
        const name = record[`Team Member ${i} Name`];
        const enrollment = record[`Team Member ${i} Enrollment number`] || record[`Team Member ${i} Enrollment Number`];
        if (name) {
            members.push({ name, enrollment, role: 'Member' });
        }
    }

    return {
        name: teamName,
        size: teamSize,
        leader: {
            name: leaderName,
            email: leaderEmail,
            phone: leaderPhone
        },
        members: members
    };
});

fs.writeFileSync(jsonFilePath, JSON.stringify(cleanedTeams, null, 2));
console.log(`Converted ${cleanedTeams.length} teams to JSON. Saved to ${jsonFilePath}`);
