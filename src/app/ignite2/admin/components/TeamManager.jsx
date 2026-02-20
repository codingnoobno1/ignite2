'use client';
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Tabs, Tab, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Clock, XCircle, AlertTriangle, MinusCircle, Award } from 'lucide-react';
import { colors, glowEffects } from '@/lib/theme';
import StatusBadge from '@/components/ui/StatusBadge';
import AnimatedButton from '@/components/ui/AnimatedButton';

const iconMap = {
    all: Users,
    arrived: Users,
    pending: Clock,
    removed: XCircle,
    disqualified: AlertTriangle,
    eliminated: MinusCircle,
};

const TeamManager = ({
    teams,
    filteredTeams,
    statusCounts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    trackFilter,
    setTrackFilter,
    onRemove,
    onDisqualify,
    onRestore
}) => {
    const tracks = [...new Set(teams.map(t => t.track).filter(Boolean))];

    const tabs = [
        { value: 'all', label: 'All Teams', count: statusCounts.all || teams.length },
        { value: 'arrived', label: 'Arrived', count: statusCounts.arrived || 0 },
        { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
        { value: 'removed', label: 'Removed', count: statusCounts.removed || 0 },
        { value: 'disqualified', label: 'DQ', count: statusCounts.disqualified || 0 },
        { value: 'eliminated', label: 'Eliminated', count: statusCounts.eliminated || 0 },
    ];

    return (
        <>
            {/* ═══════ STATUS TABS ═══════ */}
            <Card sx={{ mb: 3, bgcolor: colors.dark.card, border: `1px solid ${colors.dark.border}` }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': { color: '#fff', textTransform: 'uppercase', fontWeight: 600, '&.Mui-selected': { color: colors.neonCyan } },
                        '& .MuiTabs-indicator': { backgroundColor: colors.neonCyan, height: 3, boxShadow: glowEffects.cyan },
                    }}
                >
                    {tabs.map((tab) => {
                        const Icon = iconMap[tab.value] || Users;
                        return (
                            <Tab
                                key={tab.value}
                                value={tab.value}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon size={18} />
                                        {tab.label}
                                        <Box sx={{
                                            ml: 1, px: 1, py: 0.5,
                                            bgcolor: activeTab === tab.value ? colors.neonCyan : colors.dark.border,
                                            color: activeTab === tab.value ? '#000' : '#fff',
                                            borderRadius: 1, fontSize: '0.75rem', fontWeight: 700,
                                        }}>
                                            {tab.count}
                                        </Box>
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>
            </Card>

            {/* ═══════ FILTERS ═══════ */}
            <Card sx={{ mb: 3, bgcolor: colors.dark.card, border: `1px solid ${colors.dark.border}` }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={20} color={colors.neonCyan} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Track</InputLabel>
                                <Select
                                    value={trackFilter}
                                    onChange={(e) => setTrackFilter(e.target.value)}
                                    label="Filter by Track"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Filter size={20} color={colors.neonPink} />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="">All Tracks</MenuItem>
                                    {tracks.map(track => (
                                        <MenuItem key={track} value={track}>{track}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* ═══════ TEAMS GRID ═══════ */}
            {filteredTeams.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredTeams.map((team, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={team.id || team._id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <Card sx={{
                                    bgcolor: 'rgba(10,10,22,0.55)',
                                    backdropFilter: 'blur(14px)',
                                    border: `1px solid ${colors.dark.border}`,
                                    '&:hover': { borderColor: colors.neonCyan },
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                                            {team.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <Award size={14} color={colors.neonPink} />
                                            <Typography variant="caption" sx={{ color: colors.neonPink }}>
                                                {team.track}
                                            </Typography>
                                        </Box>
                                        <StatusBadge status={team.status} size="small" />

                                        {/* Members List */}
                                        {team.members && team.members.length > 0 && (
                                            <Box sx={{ mt: 2, mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>MEMBERS:</Typography>
                                                {team.members.map((m, i) => (
                                                    <Typography key={i} variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>
                                                        • {m.name}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}

                                        {/* Idea Snippet */}
                                        {team.idea && (
                                            <Box sx={{ mt: 1.5, p: 1, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>IDEA:</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {team.idea}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {team.status === 'arrived' && (
                                                <>
                                                    <AnimatedButton fullWidth variant="secondary" size="small" onClick={() => onRemove(team)}>
                                                        Remove
                                                    </AnimatedButton>
                                                    <AnimatedButton fullWidth variant="danger" size="small" onClick={() => onDisqualify(team)}>
                                                        Disqualify
                                                    </AnimatedButton>
                                                </>
                                            )}
                                            {(team.status === 'removed' || team.status === 'disqualified') && (
                                                <AnimatedButton fullWidth variant="success" size="small" onClick={() => onRestore(team)}>
                                                    Restore
                                                </AnimatedButton>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8, color: colors.neonOrange }}>
                    <Typography variant="h5">No teams found</Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        Try adjusting your filters, or check in teams from the Entry page
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default TeamManager;
