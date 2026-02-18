import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Team ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
    },
    track: {
        type: String,
        required: [true, 'Track is required'],
    },
    members: [{
        name: String,
        roll: String,
        phone: String,
        email: String,
    }],
    status: {
        type: String,
        enum: ['pending', 'arrived', 'removed', 'disqualified', 'eliminated'],
        default: 'pending',
    },
    arrival_timestamp: {
        type: Date,
        default: null,
    },
    current_round: {
        type: Number,
        enum: [1, 2],
        default: 1,
    },
    promoted_to_round_2: {
        type: Boolean,
        default: false,
    },
    eliminated_round: {
        type: Number,
        enum: [1, null],
        default: null,
    },
    status_history: [{
        status: String,
        reason: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
        admin: String,
        previous_status: String,
    }],
    removal_reason: {
        type: String,
        default: null,
    },
    disqualification_reason: {
        type: String,
        default: null,
    },
    submission: {
        type: String,
        default: '',
    },
    submission_timestamp: {
        type: Date,
        default: null,
    },
    submission_round: {
        type: Number,
        enum: [1, 2, null],
        default: null,
    },
    votes_received: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Virtual for backward compatibility
TeamSchema.virtual('checked_in').get(function () {
    return this.status === 'arrived';
});

// Ensure virtuals are included in JSON output
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
