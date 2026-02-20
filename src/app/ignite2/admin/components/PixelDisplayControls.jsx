'use client';
import React from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField } from '@mui/material';
import { MessageSquare } from 'lucide-react';
import { colors } from '@/lib/theme';
import AnimatedButton from '@/components/ui/AnimatedButton';

const PixelDisplayControls = ({
    displayMode,
    setDisplayMode,
    adminMessage,
    setAdminMessage,
    onUpdateDisplay
}) => {
    return (
        <Card sx={{
            mb: 3,
            bgcolor: 'rgba(10,10,22,0.65)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${colors.dark.border}`,
        }}>
            <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <MessageSquare size={20} color={colors.neonCyan} />
                    <Typography variant="h6" sx={{ color: colors.neonCyan, letterSpacing: 2 }}>
                        LOBBY DISPLAY (PIXEL PHONE)
                    </Typography>
                </Box>

                <Tabs
                    value={displayMode}
                    onChange={(e, val) => setDisplayMode(val)}
                    sx={{ mb: 3, borderBottom: `1px solid ${colors.dark.border}` }}
                    indicatorColor="primary"
                >
                    <Tab label="TEXT MODE" value="text" sx={{ color: '#fff' }} />
                    <Tab label="TEAM WELCOME" value="team" sx={{ color: '#fff' }} />
                    <Tab label="QR CODE" value="qr" sx={{ color: '#fff' }} />
                </Tabs>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <TextField
                        fullWidth
                        placeholder={
                            displayMode === 'text' ? "Enter hype text (e.g. GET READY)" :
                                displayMode === 'team' ? "Enter Team Name" :
                                    "Enter URL for QR"
                        }
                        variant="outlined"
                        size="small"
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        sx={{
                            flex: 1,
                            input: { color: '#fff' },
                            fieldSet: { borderColor: 'rgba(255,255,255,0.2)' }
                        }}
                    />
                    <AnimatedButton variant="primary" onClick={() => onUpdateDisplay()}>
                        PUSH TO LOBBY
                    </AnimatedButton>
                </Box>

                {/* PRESETS FOR TEXT MODE */}
                {displayMode === 'text' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {['GET READY', 'SET', 'GO', 'ROUND 1', 'ROUND 2', 'TIME UP'].map(text => (
                            <AnimatedButton
                                key={text}
                                variant="secondary"
                                size="small"
                                onClick={() => onUpdateDisplay('text', text)}
                                sx={{ fontSize: 10, py: 0.5 }}
                            >
                                {text}
                            </AnimatedButton>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default PixelDisplayControls;
