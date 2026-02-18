'use client';
import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { colors, glowEffects } from '@/lib/theme';

export default function LoadingSpinner({ size = 60, message = 'Loading...' }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: '200px',
            }}
        >
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-flex',
                    }}
                >
                    <CircularProgress
                        size={size}
                        thickness={4}
                        sx={{
                            color: colors.neonCyan,
                            filter: `drop-shadow(${glowEffects.cyan})`,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: size * 0.6,
                            height: size * 0.6,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${colors.neonCyan}40 0%, transparent 70%)`,
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    />
                </Box>
            </motion.div>

            {message && (
                <motion.div
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Box
                        sx={{
                            color: colors.neonCyan,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            textShadow: glowEffects.cyan,
                        }}
                    >
                        {message}
                    </Box>
                </motion.div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                }
            `}</style>
        </Box>
    );
}
