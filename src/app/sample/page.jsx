'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FaRegLightbulb, FaFilePowerpoint } from "react-icons/fa";

const theme = createTheme({
  typography: { fontFamily: "Roboto, sans-serif" },
  palette: {
    primary: { main: "#00e6ff" }, // Cyan Glow
    secondary: { main: "#ffd700" }, // Light Golden
  },
});

const Ignite2025 = () => {
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #001f3f, #004080, #00aaff)", // Metallic Blue Gradient
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          boxShadow: "0 0 15px rgba(0, 230, 255, 0.8)", // Neon Cyan Glow
          position: "relative",
        }}
      >
        {/* Amity Logo Container */}
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 215, 0, 0.6)", // Light Golden with Alpha
            padding: "1rem",
            borderRadius: "10px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            component="img"
            src="https://www.amity.edu/mohali/img/logo.png"
            alt="Amity University Logo"
            sx={{
              width: "200px", // Increased Size
              filter: "drop-shadow(0 0 25px rgba(255, 215, 0, 1))", // Light Golden Glow
            }}
          />
        </Box>

        {/* Event Title */}
        <Typography
          variant="h2"
          color="primary"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textShadow: "0 0 20px rgba(0, 230, 255, 1)",
            background: "linear-gradient(45deg, #00e6ff, #00aaff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          IGNITE 2025
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#ffd700",
            textShadow: "0 0 15px rgba(255, 215, 0, 1)",
          }}
        >
          Innovate. Strategize. Dominate.
        </Typography>

        {/* Round Details */}
        <Box mt={4} sx={{ display: "flex", gap: "2rem", textAlign: "center" }}>
          <Box
            sx={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "1.5rem",
              borderRadius: "10px",
              width: "300px",
              boxShadow: "0 0 10px rgba(0, 230, 255, 0.5)",
            }}
          >
            <FaRegLightbulb size={50} color="#00e6ff" />
            <Typography variant="h6" sx={{ marginTop: "10px", fontWeight: "bold" }}>
              Round 1: Idea Forge
            </Typography>
            <Typography variant="body1">📜 Chits Draw | ✍️ Paper-Pen | 💡 Raw Ideas</Typography>
          </Box>

          <Box
            sx={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "1.5rem",
              borderRadius: "10px",
              width: "300px",
              boxShadow: "0 0 10px rgba(0, 230, 255, 0.5)",
            }}
          >
            <FaFilePowerpoint size={50} color="#ffd700" />
            <Typography variant="h6" sx={{ marginTop: "10px", fontWeight: "bold" }}>
              Round 2: Pitch Deck
            </Typography>
            <Typography variant="body1">📊 PPT | 🎴 Golden Question Card | ⚠️ Flaw Point</Typography>
          </Box>
        </Box>

        {/* Event Info */}
        <Box
          mt={4}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            padding: "1.5rem",
            borderRadius: "10px",
            width: "350px",
            textAlign: "center",
            boxShadow: "0 0 10px rgba(0, 230, 255, 0.5)",
          }}
        >
          <Typography variant="h6">📍 Venue: Seminar Hall 2, Amity University Punjab</Typography>
          <Typography variant="h6">📅 Date: 10th March, 9 AM - 2 PM</Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffd700", marginTop: 2 }}>
            🏆 Prizes: Trophies & Cash!
          </Typography>
          <Box mt={3}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(255, 215, 0, 1)",
              }}
              onClick={() => router.push("/ignite")}
            >
              LET'S BEGIN 🚀
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Ignite2025;
