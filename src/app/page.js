"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Zap, Monitor, Terminal } from "lucide-react";
import RotatingCube from "@/components/RotatingCube"; // Use the new component

const theme = createTheme({
  typography: { fontFamily: "'Inter', sans-serif" },
  palette: {
    mode: 'dark',
    primary: { main: "#00e5ff" },
    secondary: { main: "#ff007f" },
  },
});

const NavCard = ({ title, path, icon: Icon, delay }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={() => router.push(path)}
        sx={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 4,
          cursor: "pointer",
          height: "100%",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "rgba(255,255,255,0.08)",
            borderColor: "rgba(0,229,255,0.5)",
            boxShadow: "0 0 30px rgba(0,229,255,0.15)"
          }
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Box sx={{
            p: 2,
            borderRadius: "50%",
            background: "rgba(0,229,255,0.1)",
            color: "#00e5ff",
            mb: 1
          }}>
            <Icon size={32} />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="white" sx={{ letterSpacing: 1 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function LandingPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#050505",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(0,229,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,0,127,0.08) 0%, transparent 40%)
          `,
        }}
      >
        {/* Abstract Grid Background */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          opacity: 0.3,
          pointerEvents: "none"
        }} />

        {/* 3D Cube Container */}
        <Box sx={{ mt: 8, mb: 4, position: "relative", zIndex: 2 }}>
          <RotatingCube size={300} />
        </Box>

        {/* Hero Text */}
        <Box sx={{ textAlign: "center", mb: 8, zIndex: 2, px: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #fff 0%, #a5f3fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 30px rgba(0,229,255,0.3)",
                fontSize: { xs: "2.5rem", md: "4rem" },
                mb: 2,
                letterSpacing: -1
              }}
            >
              PROGRAMMING INNOVATORS
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 300,
                color: "rgba(255,255,255,0.6)",
                fontSize: { xs: "1.5rem", md: "2rem" },
                letterSpacing: 4,
                textTransform: "uppercase"
              }}
            >
              EVENTS
            </Typography>
          </motion.div>
        </Box>

        {/* Navigation Cards */}
        <Box sx={{ width: "100%", maxWidth: "1200px", px: 4, zIndex: 2 }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <NavCard
                title="IGNITE"
                path="/ignite"
                icon={Zap}
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <NavCard
                title="IGNITE 2 LOBBY"
                path="/ignite2/lobby"
                icon={Monitor}
                delay={0.4}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <NavCard
                title="CYBER"
                path="/cyber"
                icon={Terminal}
                delay={0.6}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: "auto", py: 4, opacity: 0.4 }}>
          <Typography variant="body2" sx={{ letterSpacing: 2 }}>
            © {new Date().getFullYear()} PROGRAMMING INNOVATORS
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
