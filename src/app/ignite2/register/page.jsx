'use client';
import React, { useState } from 'react';
import { Box, Typography, TextField, Card, CardContent, Grid, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Plus, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { cyberpunkTheme, colors, glowEffects } from '@/lib/theme';
import AnimatedButton from '@/components/ui/AnimatedButton';

const TRACKS = ['AI & ML', 'Web Dev', 'Blockchain', 'IoT', 'Cybersecurity', 'Open Innovation'];

const emptyMember = () => ({ name: '', roll: '', phone: '', email: '' });

export default function RegisterPage() {
    const [teamName, setTeamName] = useState('');
    const [track, setTrack] = useState('');
    const [members, setMembers] = useState([emptyMember(), emptyMember()]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { type: 'success'|'error', message }

    const addMember = () => setMembers(prev => [...prev, emptyMember()]);

    const removeMember = (index) => {
        if (members.length <= 1) return;
        setMembers(prev => prev.filter((_, i) => i !== index));
    };

    const updateMember = (index, field, value) => {
        setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        setSubmitting(true);

        try {
            const res = await fetch('/api/ignite2/teams/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: teamName, track, members }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setResult({ type: 'success', message: `✅ ${data.message}` });
                setTeamName('');
                setTrack('');
                setMembers([emptyMember(), emptyMember()]);
            } else {
                setResult({ type: 'error', message: data.error || 'Registration failed' });
            }
        } catch (err) {
            setResult({ type: 'error', message: 'Network error — try again' });
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── text field styling ─── */
    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            color: '#fff',
            '& fieldset': { borderColor: `${colors.dark.border}` },
            '&:hover fieldset': { borderColor: colors.neonCyan },
            '&.Mui-focused fieldset': { borderColor: colors.neonCyan },
        },
        '& .MuiInputLabel-root': { color: '#888' },
        '& .MuiInputLabel-root.Mui-focused': { color: colors.neonCyan },
    };

    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: colors.dark.bg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', maxWidth: 600 }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${colors.neonCyan}20, ${colors.neonPurple}20)`,
                                border: `2px solid ${colors.neonCyan}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <UserPlus size={28} color={colors.neonCyan} />
                            </Box>
                        </Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 900, letterSpacing: 3,
                            color: colors.neonCyan,
                            textShadow: glowEffects.cyan,
                        }}>
                            TEAM REGISTRATION
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                            IGNITE 2.0 — Register your team
                        </Typography>
                    </Box>

                    {/* Form Card */}
                    <Card sx={{
                        bgcolor: 'rgba(10,10,22,0.7)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${colors.dark.border}`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: `linear-gradient(90deg, transparent, ${colors.neonCyan}, transparent)`,
                        }} />

                        <CardContent sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit}>
                                {/* Team Name */}
                                <TextField
                                    fullWidth label="Team Name" value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)} required
                                    sx={{ ...fieldSx, mb: 2 }}
                                    placeholder="e.g. Cyber Pioneers"
                                />

                                {/* Track Selection */}
                                <Typography variant="caption" sx={{ color: colors.neonPurple, letterSpacing: 2, mb: 1, display: 'block' }}>
                                    SELECT TRACK
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    {TRACKS.map(t => (
                                        <AnimatedButton
                                            key={t}
                                            variant={track === t ? 'primary' : 'secondary'}
                                            size="small"
                                            type="button"
                                            onClick={() => setTrack(t)}
                                        >
                                            {t}
                                        </AnimatedButton>
                                    ))}
                                </Box>

                                {/* Members */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: colors.neonCyan, letterSpacing: 2 }}>
                                        TEAM MEMBERS ({members.length})
                                    </Typography>
                                    <AnimatedButton variant="secondary" size="small" type="button" onClick={addMember}>
                                        <Plus size={14} style={{ marginRight: 4 }} /> Add
                                    </AnimatedButton>
                                </Box>

                                <AnimatePresence>
                                    {members.map((member, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Box sx={{
                                                p: 2, mb: 1.5, borderRadius: 2,
                                                border: `1px solid ${colors.dark.border}`,
                                                bgcolor: 'rgba(0,229,255,0.03)',
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ color: colors.neonPink, fontWeight: 700 }}>
                                                        Member {idx + 1}
                                                    </Typography>
                                                    {members.length > 1 && (
                                                        <IconButton size="small" onClick={() => removeMember(idx)} sx={{ color: '#666', '&:hover': { color: colors.neonPink } }}>
                                                            <Trash2 size={14} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                                <Grid container spacing={1.5}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth label="Name" size="small" required
                                                            value={member.name}
                                                            onChange={(e) => updateMember(idx, 'name', e.target.value)}
                                                            sx={fieldSx}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth label="Roll No" size="small"
                                                            value={member.roll}
                                                            onChange={(e) => updateMember(idx, 'roll', e.target.value)}
                                                            sx={fieldSx}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth label="Phone" size="small"
                                                            value={member.phone}
                                                            onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                                                            sx={fieldSx}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth label="Email" size="small"
                                                            value={member.email}
                                                            onChange={(e) => updateMember(idx, 'email', e.target.value)}
                                                            sx={fieldSx}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Result message */}
                                <AnimatePresence>
                                    {result && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <Box sx={{
                                                mt: 2, p: 2, borderRadius: 2,
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                bgcolor: result.type === 'success' ? 'rgba(0,255,100,0.08)' : 'rgba(255,0,80,0.08)',
                                                border: `1px solid ${result.type === 'success' ? colors.neonGreen : colors.neonPink}30`,
                                            }}>
                                                {result.type === 'success'
                                                    ? <CheckCircle size={18} color={colors.neonGreen} />
                                                    : <AlertTriangle size={18} color={colors.neonPink} />}
                                                <Typography variant="body2" sx={{
                                                    color: result.type === 'success' ? colors.neonGreen : colors.neonPink,
                                                }}>
                                                    {result.message}
                                                </Typography>
                                            </Box>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <Box sx={{ mt: 3 }}>
                                    <AnimatedButton
                                        variant="primary"
                                        fullWidth
                                        type="submit"
                                        disabled={submitting || !teamName || !track}
                                    >
                                        <Zap size={16} style={{ marginRight: 6 }} />
                                        {submitting ? 'Registering...' : 'Register Team'}
                                    </AnimatedButton>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </Box>
        </ThemeProvider>
    );
}
