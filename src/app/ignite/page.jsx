'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

const theme = createTheme({
  typography: { fontFamily: "Roboto, sans-serif" },
  palette: {
    primary: { main: "#00aaff" },
    secondary: { main: "#ff007f" },
  },
});

const Round1 = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#111",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          backgroundImage: "url('https://wallpaperaccess.com/full/2048226.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          padding: "2rem",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "1rem 2rem",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#fff", textShadow: "0 0 10px #00aaff" }}
          >
            ROUND 1: IGNITE YOUR MIND
          </Typography>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            🚫 No Mobiles | 🚫 No Cheating | ⚡ Brainstorm & Conquer
          </Typography>
        </Box>

        <Box
          sx={{
            width: "150px",
            height: "150px",
            perspective: "1000px",
            marginBottom: "2rem",
          }}
        >
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
            }}
          >
            {["1 Hour", "60 min", "3600 sec", "Time", "IGNITE", "🔥"].map((text, index) => (
              <Box
                key={index}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.8)",
                  border: "2px solid #00aaff",
                  boxShadow: "0px 5px 10px rgba(0, 170, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#00aaff",
                  transform: `rotateY(${index * 90}deg) translateZ(75px)`,
                }}
              >
                {text}
              </Box>
            ))}
          </motion.div>
        </Box>

        <Typography variant="h3" color="primary" gutterBottom>
          {formatTime(timeLeft)}
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => router.push("/round2")}
        >
          NEXT ROUND
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default Round1;
