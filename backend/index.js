const express = require('express');
const dotenv = require('dotenv');
const chats = require('./data/data');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const path = require("path");

const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();
connectDB();
const app = express();

//middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>API is running</h1>");
});

app.use('/api/user', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// ------------------Deployment-----------------------

// const __dirname1 = path.resolve(__dirname, "..");
// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname1, "/frontend/dist")));

//     // Redirect all routes to index.html for SPA
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"))
//     });
// } else {
//     app.get("/", (req, res) => {
//         res.send("API is running successfully");
//     });
// }

// ------------------Deployment-----------------------

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

const io = require("socket.io")(server, {
    pingTimeOut: 60000,
    cors: {
        // origin: "http://localhost:5173",
        origin: "https://real-time-chat-app-frontend-r5qy.onrender.com",
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    
    // client setup
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: "+room);
    });
    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;

        if(!chat.users) return console.log("chat users not defined");

        chat.users.forEach(user => {
            if(user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on('typing', (room) => socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));
});
