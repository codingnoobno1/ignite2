'use client';
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

// Lazy load the Cube component
const CubeCanvas = dynamic(() => import('./Cube'), { 
    ssr: false,
    loading: () => <Box sx={{ width: 150, height: 150 }} />
});

export default function CubeDecorator({ 
    position = 'top-right',
    size = 150,
    opacity = 0.3 
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if WebGL is supported
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    const positions = {
        'top-left': { top: 20, left: 20 },
        'top-right': { top: 20, right: 20 },
        'bottom-left': { bottom: 20, left: 20 },
        'bottom-right': { bottom: 20, right: 20 },
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                ...positions[position],
                width: size,
                height: size,
                opacity: opacity,
                pointerEvents: 'none',
                zIndex: 0,
                transition: 'opacity 0.5s ease',
                '&:hover': {
                    opacity: opacity * 1.5,
                },
            }}
        >
            <CubeCanvas />
        </Box>
    );
}
