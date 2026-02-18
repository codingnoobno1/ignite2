'use client';
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, glowEffects } from '@/lib/theme';

const MotionAlert = motion(Alert);

export default function Toast({ 
    open, 
    message, 
    severity = 'success', 
    onClose, 
    duration = 3000,
    position = { vertical: 'bottom', horizontal: 'center' }
}) {
    const severityColors = {
        success: colors.neonGreen,
        error: colors.neonPink,
        warning: colors.neonOrange,
        info: colors.neonCyan,
    };

    const severityGlows = {
        success: glowEffects.green,
        error: glowEffects.pink,
        warning: glowEffects.orange,
        info: glowEffects.cyan,
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={onClose}
            anchorOrigin={position}
        >
            <MotionAlert
                onClose={onClose}
                severity={severity}
                variant="filled"
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                sx={{
                    backgroundColor: `${severityColors[severity]}20`,
                    color: severityColors[severity],
                    border: `2px solid ${severityColors[severity]}`,
                    boxShadow: severityGlows[severity],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    '& .MuiAlert-icon': {
                        color: severityColors[severity],
                    },
                }}
            >
                {message}
            </MotionAlert>
        </Snackbar>
    );
}

// Hook for using toast notifications
export function useToast() {
    const [toast, setToast] = React.useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, open: false }));
    };

    return {
        toast,
        showToast,
        hideToast,
        ToastComponent: () => (
            <Toast
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={hideToast}
            />
        ),
    };
}
