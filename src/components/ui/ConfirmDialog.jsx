'use client';
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import { colors, glowEffects } from '@/lib/theme';
import { AlertTriangle } from 'lucide-react';

const MotionDialog = motion(Dialog);

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning', // 'warning', 'danger', 'info'
}) {
    const variantColors = {
        warning: colors.neonOrange,
        danger: colors.neonPink,
        info: colors.neonCyan,
    };

    const variantGlows = {
        warning: glowEffects.orange,
        danger: glowEffects.pink,
        info: glowEffects.cyan,
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onCancel}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        component: motion.div,
                        initial: { opacity: 0, scale: 0.8, y: -50 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.8, y: 50 },
                        transition: { type: 'spring', stiffness: 300, damping: 25 },
                        sx: {
                            backgroundColor: colors.dark.card,
                            border: `2px solid ${variantColors[variant]}`,
                            boxShadow: variantGlows[variant],
                            borderRadius: 0,
                        },
                    }}
                >
                    <DialogTitle sx={{
                        borderBottom: `1px solid ${colors.dark.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        <AlertTriangle
                            size={24}
                            color={variantColors[variant]}
                            style={{ filter: `drop-shadow(${variantGlows[variant]})` }}
                        />
                        <Typography
                            variant="h6"
                            component="span"
                            sx={{
                                color: variantColors[variant],
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 700,
                            }}
                        >
                            {title}
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ py: 3 }}>
                        <Typography variant="body1" sx={{ color: '#fff' }}>
                            {message}
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{
                        borderTop: `1px solid ${colors.dark.border}`,
                        p: 2,
                        gap: 2,
                    }}>
                        <AnimatedButton
                            variant="secondary"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </AnimatedButton>
                        <AnimatedButton
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </AnimatedButton>
                    </DialogActions>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

// Hook for using confirm dialogs
export function useConfirmDialog() {
    const [dialog, setDialog] = React.useState({
        open: false,
        title: '',
        message: '',
        variant: 'warning',
        onConfirm: () => { },
    });

    const showConfirm = ({ title, message, variant = 'warning', onConfirm }) => {
        setDialog({
            open: true,
            title,
            message,
            variant,
            onConfirm,
        });
    };

    const hideConfirm = () => {
        setDialog(prev => ({ ...prev, open: false }));
    };

    const handleConfirm = () => {
        dialog.onConfirm();
        hideConfirm();
    };

    return {
        dialog,
        showConfirm,
        hideConfirm,
        ConfirmDialogComponent: () => (
            <ConfirmDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                variant={dialog.variant}
                onConfirm={handleConfirm}
                onCancel={hideConfirm}
            />
        ),
    };
}
