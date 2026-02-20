import mongoose from 'mongoose';

const CompetitionStateSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: true,
        unique: true,
        default: 'ignite2',
    },
    current_round: {
        type: Number,
        enum: [1, 2],
        default: 1,
    },
    pixelDisplay: {
        type: {
            type: String,
            enum: ['text', 'team', 'qr'],
            default: 'text',
        },
        payload: {
            type: String,
            default: '',
        },
        timestamp: {
            type: Number,
            default: 0,
        },
    },
    round_1_timer: {
        duration: {
            type: Number,
            default: 0,
        },
        remaining: {
            type: Number,
            default: 0,
        },
        is_running: {
            type: Boolean,
            default: false,
        },
        started_at: {
            type: Date,
            default: null,
        },
        end_time: {
            type: Date,
            default: null,
        },
        lastReset: {
            type: Number,
            default: 0,
        },
        paused_at: {
            type: Date,
            default: null,
        },
    },
    round_2_timer: {
        duration: {
            type: Number,
            default: 0,
        },
        remaining: {
            type: Number,
            default: 0,
        },
        is_running: {
            type: Boolean,
            default: false,
        },
        started_at: {
            type: Date,
            default: null,
        },
        end_time: {
            type: Date,
            default: null,
        },
        lastReset: {
            type: Number,
            default: 0,
        },
        paused_at: {
            type: Date,
            default: null,
        },
    },
    round_1_end_time: {
        type: Date,
        default: null,
    },
    round_2_start_time: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.models.CompetitionState || mongoose.model('CompetitionState', CompetitionStateSchema);
