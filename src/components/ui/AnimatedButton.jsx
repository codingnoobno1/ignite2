'use client';
import React from 'react';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { colors, glowEffects } from '@/lib/theme';

const MotionButton = motion(Button);

export default function AnimatedButton({ 
    children, 
    variant = 'primary',
    onClick,
    disabled = false,
    fullWidth = false,
    size = 'medium',
    ...props 
}) {
    const variantStyles = {
        primary: {
            background: `linear-gradient(135deg, ${colors.neonCyan} 0%, ${colors.neonPurple} 100%)`,
            color: '#000',
            '&:hover': {
                background: `linear-gradient(135deg, ${colors.neonPurple} 0%, ${colors.neonPink} 100%)`,
                boxShadow: glowEffects.cyan,
            },
        },
        secondary: {
            background: `linear-gradient(135deg, ${colors.neonPink} 0%, ${colors.neonOrange} 100%)`,
            color: '#fff',
            '&:hover': {
                background: `linear-gradient(135deg, ${colors.neonOrange} 0%, ${colors.neonPink} 100%)`,
                boxShadow: glowEffects.pink,
            },
        },
        danger: {
            background: colors.neonPink,
            color: '#fff',
            '&:hover': {
                background: '#ff1a8c',
                boxShadow: glowEffects.pink,
            },
        },
        success: {
            background: colors.neonGreen,
            color: '#000',
            '&:hover': {
                background: '#4dff2a',
                boxShadow: glowEffects.green,
            },
        },
    };

    return (
        <MotionButton
            onClick={onClick}
            disabled={disabled}
            fullWidth={fullWidth}
            size={size}
            whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            sx={{
                ...variantStyles[variant],
                borderRadius: 0,
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.1em',
                px: 3,
                py: 1.5,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.5s',
                },
                '&:hover::before': {
                    left: '100%',
                },
                '&:disabled': {
                    background: colors.dark.border,
                    color: '#666',
                },
            }}
            {...props}
        >
            {children}
        </MotionButton>
    );
}
