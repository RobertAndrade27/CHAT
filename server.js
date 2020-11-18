const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express ();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let connecteddUsers = [];

io.on('connection', (socket) =>{
    console.log("Conexão detectada...");

    socket.on('join-request', (username) =>{
        socket.username = username;
        connecteddUsers.push( username );
        console.log( connecteddUsers );

        socket.emit('user-ok', connecteddUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connecteddUsers
        });
    });

    socket.on('disconnect', () => {
//primeira função remover
        connecteddUsers = connecteddUsers.filter(u => u != socket.username);
        console.log(connecteddUsers);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connecteddUsers
        })
    });

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt,
        };

        socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj);
    });

});