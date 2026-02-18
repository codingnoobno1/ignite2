'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, useAnimation } from "framer-motion";

const theme = createTheme({
  typography: { fontFamily: "Roboto, sans-serif" },
  palette: {
    primary: { main: "#00aaff" },
    secondary: { main: "#ff007f" },
  },
});

const PixelTexploreSelection = () => {
  const router = useRouter();
  const cubeControls = useAnimation();

  React.useEffect(() => {
    const sequence = async () => {
      const flips = [
        { rotateY: 90 }, 
        { rotateX: 90 }, 
        { rotateY: 180 }, 
        { rotateX: -90 }, 
        { rotateY: -90 }, 
        { rotateX: 0 }, 
        { rotateY: 0 },
      ];
      while (true) {
        for (const flip of flips) {
          await cubeControls.start(flip, {
            duration: 0.5,
            ease: "easeInOut"
          });
          await new Promise(res => setTimeout(res, 700)); // pause like a robot
        }
      }
    };
    sequence();
  }, [cubeControls]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#222",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/000/536/275/large_2x/vector-abstract-futuristic-circuit-board-illustration-technology-dark-blue-color-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          padding: "2rem",
        }}
      >
        {/* Robotic Cube */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150px",
            height: "150px",
            perspective: "1000px",
            zIndex: 3,
          }}
        >
          <motion.div
            animate={cubeControls}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
            }}
          >
            {[
              { content: "amity.jpg", rotateY: 0 },
              { content: "amity.jpg", rotateY: 180 },
              { content: "PIXEL", rotateY: 90 },
              { content: "TEXPLORE", rotateY: -90 },
              { content: "pixel.jpg", rotateX: 90 },
              { content: "tex.jpg", rotateX: -90 },
            ].map(({ content, rotateY = 0, rotateX = 0 }, index) => (
              <Box
                key={index}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.8)",
                  border: "2px solid #ff69b4",
                  boxShadow: "0px 5px 10px rgba(255, 105, 180, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  fontFamily: "Poppins, sans-serif",
                  color: "#ff69b4",
                  textShadow: "0 0 10px #ff69b4",
                  transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(75px)`,
                }}
              >
                {content.endsWith(".jpg") ? (
                  <img src={content} alt="Logo" style={{ maxWidth: "120px" }} />
                ) : (
                  content
                )}
              </Box>
            ))}
          </motion.div>
        </Box>

        <Box mt={20} />

        <Typography
          variant="h2"
          color="primary"
          sx={{
            fontWeight: "bold",
            textShadow: "0 0 15px rgba(54, 54, 150, 0.8)",
            background: "linear-gradient(45deg, rgb(255, 255, 255), rgb(213, 225, 229), rgb(171, 232, 243))",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          PIXEL X TEXPLORE
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", textShadow: "0 0 15px rgba(0, 0, 255, 0.8)" }}
        >
          Makethon Selection | Represent Amity at Infosys Mohali
        </Typography>

        <Box
          mt={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            padding: "1.5rem",
            borderRadius: "10px",
          }}
        >
          <Typography variant="h6">📍 Venue: Seminar Hall 2, Amity University Punjab</Typography>
          <Typography variant="h6">📅 Date: 23rd April, 11:00 AM Onwards</Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "gold", marginTop: 2 }}>
            🎯 Only 1 Team Will Represent Amity!
          </Typography>
          <Box mt={3}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => router.push("/ignite")}
            >
              APPLY NOW
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PixelTexploreSelection;
