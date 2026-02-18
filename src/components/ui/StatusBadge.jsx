'use client';
import React from 'react';
import { Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { getStatusColor, getStatusGlow } from '@/lib/theme';
import { 
    CheckCircle, 
    Clock, 
    XCircle, 
    AlertTriangle, 
    MinusCircle 
} from 'lucide-react';

const MotionChip = motion(Chip);

const statusIcons = {
    pending: Clock,
    arrived: CheckCircle,
    removed: XCircle,
    disqualified: AlertTriangle,
    eliminated: MinusCircle,
};

const statusLabels = {
    pending: 'Pending',
    arrived: 'Arrived',
    removed: 'Removed',
    disqualified: 'Disqualified',
    eliminated: 'Eliminated',
};

export default function StatusBadge({ status, size = 'medium', animated = true }) {
    const Icon = statusIcons[status] || Clock;
    const label = statusLabels[status] || status;
    const color = getStatusColor(status);
    const glow = getStatusGlow(status);

    const chipProps = {
        label: label,
        icon: <Icon size={size === 'small' ? 14 : 16} />,
        size: size,
        sx: {
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}`,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: glow,
            '& .MuiChip-icon': {
                color: color,
            },
        },
    };

    if (animated) {
        return (
            <MotionChip
                {...chipProps}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                whileHover={{ scale: 1.1 }}
            />
        );
    }

    return <Chip {...chipProps} />;
}
