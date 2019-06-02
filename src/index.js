// Provide functions to deploy the server
const http = require('http');
// Provide functions to work using web sockets
const socketio = require("socket.io");
// PRovide functions to filter words
const Filter = require("bad-words");

// Set the express to run 
const app = require('./app');

// Methods to build return messages
const { generateMessage, generateLocationMessage } = require('./utils/message');

// Methods to control users
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// Set Sockets.IO
const server = http.createServer(app);
const io = socketio(server);

// Get the server port
const port = process.env.PORT;

// Connected Clients count
let connectedClientCount = 0;

// Socket.IO handlers to connected WEB SOCKETS
io.on('connection', (socket) => {
    ++connectedClientCount;
    console.log('New client connect, nº'+connectedClientCount);

    // Handler for joining a chat room 
    socket.on('join', (client, callback) => {
        // Store user data on server
        let { error, user } = addUser({ id: socket.id, ...client });
        console.log(user)
        // If failed return error
        if (error) {
            return callback(error);
        }

        // Join user to custom socket
        socket.join(user.room);

        // Send message to self
        socket.emit('message', generateMessage('Admin', `Welcome`));
        // Send message to everyone on room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} join the chat. Welcome him`));
        
        // Update users inside room
        io.to(user.room).emit('updateUsersInRoom', getUsersInRoom(user.room));
        callback();
    });

    // Handler to send Location data on chat
    socket.on('sendPosition', (position, callback) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback();
    });

    // Handler to send text message on chat
    socket.on('sendMessage', (message, callback) => {
        let user = getUser(socket.id);
        const filter = new Filter();

        // Check for bad words
        if (filter.isProfane())
            return callback('Here isn\'t allowed non family friendly content');

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    // Handler to remove user from chat when disconnected
    socket.on('disconnect', () => {
        let user = removeUser(socket.id);
        io.to(user.room).emit('message', generateMessage('Admin', `${user.username} says goodbye to everyone here!`));
        
        // Update users inside room
        io.to(user.room).emit('updateUsersInRoom', getUsersInRoom(user.room));
    });
});

server.listen(port, () => {
    console.log(`Server up on port ${port}`);
});