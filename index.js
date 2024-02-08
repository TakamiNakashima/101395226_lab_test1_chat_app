const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routes/UserRoutes.js')
const formatMessage = require("./utils/messages");
const socketIO = require('socket.io')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

const app = express()
app.use(express.static(path.join(__dirname, 'views')))

const server = app.listen(8081, () => { console.log('Server is running...') })

// DB connection
//mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority
const DB_HOST = "fs1-f2023.pxy3izp.mongodb.net"
const DB_USER = "mialand1227"
const DB_PASSWORD = "12345"
const DB_NAME = "w2024_fs"

const DB_CONNECTION_STRING = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(success => {
console.log('Success Mongodb connection')
}).catch(err => {
console.log('Error Mongodb connection')
});

app.use(userRouter);

// Socket setup
const serverIO = socketIO(server)

serverIO.on('connection', (socket) => {
    console.log(`Socket connection made`, socket.id)

    socket.on('join_group', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)
        console.log(`Joined group ${room}`)

        socket.emit('message', formatMessage('admin', 'Hello from server'))

        socket.broadcast.to(user.room).emit(
            'message', 
            formatMessage('admin', `${user.username} has joined the chat`)
        )

        serverIO.to(user.room).emit("room_users", {
            room: user.room,
            users: getRoomUsers(user.room),
        });

        socket.on('chat_message', (msg) => {
            const user = getCurrentUser(socket.id)
            serverIO.to(user.room).emit('message', formatMessage(user.username, msg))
        })

        socket.on('disconnect', () => {
            const user = userLeave(socket.id)

            if(user){
                serverIO.to(user.room).emit('message', formatMessage('admin', `${user.username} left the chat`))

                // Send users and room info
                serverIO.to(user.room).emit("room-users", {
                    room: user.room,
                    users: getRoomUsers(user.room),
                });
            }
        })
    })

    // Authentication check
    // socket.on('authenticate', async (userData) => {
    //     try {
    //         // Check if user exists in the database (e.g., using userModel)
    //         const user = await userModel.findOne({ username: userData.username });
    //         if (user) {
    //             // User is authenticated, allow them to join groups
    //             socket.emit('authenticated', { username: userData.username });
    //         } else {
    //             // User is not authenticated, send an error message
    //             socket.emit('authentication_error', 'User not found');
    //         }
    //     } catch (error) {
    //         console.error('Error authenticating user:', error);
    //         socket.emit('authentication_error', 'An error occurred during authentication');
    //     }
    // })

    // socket.on('leave_group', (groupName) => {
    //     socket.leave(groupName);
    //     console.log(`Left group ${groupName}`);
    // })
})