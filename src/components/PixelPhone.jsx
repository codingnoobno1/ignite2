import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PixelPhone = ({ display }) => {
    // display = { type: 'text'|'team'|'qr', payload: string, timestamp: number }
    const { type, payload } = display || {};

    return (
        <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
                width: 320,
                height: 640,
                background: '#000',
                borderRadius: 40,
                border: '8px solid #1f1f1f',
                boxShadow: '0 0 0 2px #444, 0 30px 60px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ─── WALLPAPER LAYER ─── */}
            <Box
                component="img"
                src="/pixel.jpg"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: 0,
                    filter: 'brightness(0.3)',
                    transform: 'scale(0.7)'
                }}
            />

            {/* ─── STATUS BAR ─── */}
            <Box sx={{
                height: 36,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                color: '#fff',
                position: 'absolute',
                top: 0, left: 0, right: 0,
                pt: 1.5
            }}>
                <Typography variant="caption" fontWeight="600" sx={{ fontSize: 13 }}>09:41</Typography>
                <Box display="flex" gap={0.8}>
                    <Signal size={15} />
                    <Wifi size={15} />
                    <Battery size={15} />
                </Box>
            </Box>

            {/* ─── HOLE PUNCH CAMERA ─── */}
            <Box sx={{
                position: 'absolute',
                top: 15,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#000',
                zIndex: 20,
            }} />

            {/* ─── MAIN SCREEN CONTENT ─── */}
            <Box sx={{
                flex: 1,
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <AnimatePresence mode="wait">

                    {/* MODE 1: TEXT SPLASH (GET READY, GO) */}
                    {type === 'text' && payload && (
                        <motion.div
                            key={`text-${payload}`}
                            initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            exit={{ scale: 2, opacity: 0, filter: "blur(20px)" }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
                            style={{ textAlign: 'center', width: '100%', px: 2 }}
                        >
                            <motion.div
                                animate={{ textShadow: ["0 0 10px #0ff", "0 0 30px #0ff", "0 0 10px #0ff"] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontFamily: '"Fira Code", monospace',
                                        fontWeight: 900,
                                        color: '#00e5ff',
                                        lineHeight: 1,
                                        fontSize: payload.length > 5 ? '3rem' : '4.5rem',
                                        letterSpacing: 2,
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {payload}
                                </Typography>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* MODE 2: TEAM WELCOME */}
                    {type === 'team' && payload && (
                        <motion.div
                            key={`team-${payload}`}
                            initial={{ scale: 0, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120 }}
                            style={{ textAlign: 'center', width: '100%', padding: '0 20px' }}
                        >
                            <Typography sx={{ color: '#d946ef', fontWeight: 700, letterSpacing: 3, mb: 1 }}>
                                WELCOME
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 800,
                                    color: '#fff',
                                    textShadow: '0 0 20px rgba(217, 70, 239, 0.5)',
                                    lineHeight: 1.1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                {payload}
                            </Typography>
                        </motion.div>
                    )}

                    {/* MODE 3: QR CODE */}
                    {type === 'qr' && payload && (
                        <motion.div
                            key={`qr-${payload}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring" }}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Typography sx={{ color: '#00e5ff', fontWeight: 600, letterSpacing: 2, mb: 3 }}>
                                SCAN TO JOIN
                            </Typography>

                            <motion.div
                                animate={{
                                    boxShadow: ["0 0 20px rgba(0,229,255,0.2)", "0 0 50px rgba(0,229,255,0.6)", "0 0 20px rgba(0,229,255,0.2)"]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    padding: 20,
                                    background: '#fff',
                                    borderRadius: 24,
                                }}
                            >
                                <QRCodeSVG value={payload} size={180} />
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </Box>

            {/* ─── HOME BAR ─── */}
            <Box sx={{
                height: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                pb: 2
            }}>
                <Box sx={{ width: 120, height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.4)' }} />
            </Box>
        </motion.div>
    );
};

export default PixelPhone;
