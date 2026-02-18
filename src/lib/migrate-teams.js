import dbConnect from './db.js';
import Team from '../models/Team.js';
import CompetitionState from '../models/CompetitionState.js';

/**
 * Migration script to update existing teams with new schema fields
 * This ensures backward compatibility with existing data
 */
export async function migrateTeams() {
    await dbConnect();
    
    try {
        console.log('Starting team migration...');
        
        // Get all teams
        const teams = await Team.find({});
        
        let updatedCount = 0;
        
        for (const team of teams) {
            let needsUpdate = false;
            const updates = {};
            
            // Set status based on checked_in field
            if (!team.status) {
                updates.status = team.checked_in ? 'arrived' : 'pending';
                needsUpdate = true;
            }
            
            // Set arrival_timestamp for checked-in teams
            if (team.checked_in && !team.arrival_timestamp) {
                updates.arrival_timestamp = team.updatedAt || new Date();
                needsUpdate = true;
            }
            
            // Initialize round fields if missing
            if (team.current_round === undefined) {
                updates.current_round = 1;
                needsUpdate = true;
            }
            
            if (team.promoted_to_round_2 === undefined) {
                updates.promoted_to_round_2 = false;
                needsUpdate = true;
            }
            
            // Initialize status_history if empty
            if (!team.status_history || team.status_history.length === 0) {
                updates.status_history = [{
                    status: updates.status || team.status || 'pending',
                    reason: 'Initial migration',
                    timestamp: team.createdAt || new Date(),
                    admin: 'system',
                    previous_status: 'pending'
                }];
                needsUpdate = true;
            }
            
            // Apply updates if needed
            if (needsUpdate) {
                await Team.findByIdAndUpdate(team._id, updates);
                updatedCount++;
            }
        }
        
        console.log(`Migration complete. Updated ${updatedCount} teams.`);
        
        // Initialize competition state if it doesn't exist
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
            console.log('Competition state initialized.');
        } else {
            console.log('Competition state already exists.');
        }
        
        return {
            success: true,
            teamsUpdated: updatedCount,
            totalTeams: teams.length
        };
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateTeams()
        .then(result => {
            console.log('Migration result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration error:', error);
            process.exit(1);
        });
}
