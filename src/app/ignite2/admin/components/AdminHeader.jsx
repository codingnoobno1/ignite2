'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Zap, RotateCcw } from 'lucide-react';
import { colors, glowEffects } from '@/lib/theme';
import AnimatedButton from '@/components/ui/AnimatedButton';

const AdminHeader = ({ onReset, isResetting, onImport, isImporting }) => {
    return (
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Zap size={28} color={colors.neonCyan} />
                    <Typography variant="h3" sx={{ color: colors.neonCyan, textShadow: glowEffects.cyan, fontWeight: 900, letterSpacing: 3, fontSize: { xs: '1.4rem', md: '2rem' } }}>
                        IGNITE 2.0 CONTROL PANEL
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <AnimatedButton
                        variant="secondary"
                        size="small"
                        onClick={onImport}
                        disabled={isImporting}
                    >
                        {isImporting ? 'Importing...' : 'Import CSV'}
                    </AnimatedButton>
                    <AnimatedButton
                        variant="danger"
                        size="small"
                        onClick={onReset}
                        disabled={isResetting}
                    >
                        <RotateCcw size={16} style={{ marginRight: 6 }} />
                        {isResetting ? 'Resetting...' : 'Reset Lobby'}
                    </AnimatedButton>
                </Box>
            </Box>
        </motion.div>
    );
};

export default AdminHeader;
