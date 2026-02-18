const { Server } = require("socket.io");

const io = new Server(4000, {
    cors: {
        origin: "*", // Allow all connections
    },
});

let timerState = {
    isRunning: false,
    timeLeft: 3600, // 60 minutes default
};

let timerInterval = null;

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Send current timer state to new client
    socket.emit("timer-update", timerState);

    // Admin Controls
    socket.on("start-timer", () => {
        if (!timerState.isRunning) {
            timerState.isRunning = true;
            io.emit("timer-update", timerState);

            timerInterval = setInterval(() => {
                if (timerState.timeLeft > 0) {
                    timerState.timeLeft--;
                    io.emit("timer-update", timerState);
                } else {
                    timerState.isRunning = false;
                    clearInterval(timerInterval);
                    io.emit("timer-update", timerState);
                }
            }, 1000);
        }
    });

    socket.on("pause-timer", () => {
        if (timerState.isRunning) {
            timerState.isRunning = false;
            clearInterval(timerInterval);
            io.emit("timer-update", timerState);
        }
    });

    socket.on("reset-timer", (newTime) => {
        timerState.isRunning = false;
        clearInterval(timerInterval);
        timerState.timeLeft = newTime || 3600;
        io.emit("timer-update", timerState);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

console.log("Socket.io server running on port 4000");
