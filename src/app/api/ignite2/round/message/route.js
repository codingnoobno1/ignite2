import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompetitionState from '@/models/CompetitionState';

export async function POST(req) {
    try {
        await dbConnect();
        const { type, payload, admin } = await req.json();

        if (admin !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let state = await CompetitionState.findOne({ event_id: 'ignite2' });
        if (!state) {
            state = new CompetitionState({ event_id: 'ignite2' });
        }

        state.pixelDisplay = {
            type: type || 'text',
            payload: payload || '',
            timestamp: Date.now()
        };

        await state.save();

        return NextResponse.json({ success: true, message: 'Pixel Display updated' });
    } catch (error) {
        console.error('Error updating display:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
