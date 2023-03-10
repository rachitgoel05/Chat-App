const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage } = require('../src/utils/message')
const {addUser, getUser, getUserInRoom, removeUser} = require ('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection',(socket) => {
    console.log("New Socket.io Connection")

    socket.on('join',( options, callback ) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error){
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit('message',generateMessage('Admin','Welcome'))  

        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined room`));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)  
        })
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,message))
            callback()
        }
    })

    socket.on('disconnect',()=>{
        const userRemoved = removeUser(socket.id )
        if(userRemoved){
            io.to(userRemoved.room).emit('message',generateMessage('Admin',`${userRemoved.username} has left`));
            io.to(userRemoved.room).emit('roomData',{
                room: userRemoved.room,
                users: getUserInRoom(userRemoved.room)  
            })
        }
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage',generateMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
            callback();
    
        }
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
})