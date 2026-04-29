const express = require('express');
const http = require("http");
const cors = require('cors');

const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: "*",
    }

    }
)

io.on('connection', (socket)=>{
    console.log(`User Connected: ${socket.id}`);
    
    socket.on('send_message',(data)=>{
        io.emit('receive_message', data);
        console.log("Received message:", data);
    })

    socket.on('disconnect', () => {
        if (socket.username){
            console.log(`User Disconnected: ${socket.username}`);
            io.emit('user_disconnected', socket.username);
        } else{
            console.log(`User Disconnected: ${socket.id}`);
            io.emit('user_disconnected', "Anonymous");
        }
        
    })

    socket.on('user_connected', (username) => {
        socket.username = username;
        console.log(`User Connected: ${username}`);
        io.emit('user_connected', username);
    })

    socket.on('user_change_name', (data) => {
        const prevname = data.prevname;
        socket.username = data.username;
        console.log(`Change Name: ${prevname} to ${data.username}`);
        io.emit('user_change_name', {prevname: prevname, username: data.username});
    });


})


app.use(cors());
app.use(express.json());

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});