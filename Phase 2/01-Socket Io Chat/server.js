const express = require('express')
const http = require('http')
const { Server } = require('socket.io') // why {} -> The `{}` syntax is used here to destructure the `Server` class from the `socket.io` module. In JavaScript, when you import a module, you can either import the entire module or specific parts of it.

const app = express()
const server = http.createServer(app) // wrapping the express app in a http server is necessary for socket.io to work. Socket.io needs to work with the underlying HTTP server to handle WebSocket connections.
const io = new Server(server) // this is the socket.io server instance. It will listen for incoming socket connections and handle events.

app.use(express.static('public'))  // this serves the static files in the 'public' directory. When you visit the root URL of the server, it will serve the index.html file from the public directory.

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id) //  this wont show up in the browser console, it will show up in the terminal where you ran node server.js.

  socket.on('join room', (roomName) => {
    socket.join(roomName) // a socket can join multiple rooms.
    socket.data.room = roomName
    console.log(`${socket.id} joined room: ${roomName}`)
  })

  socket.on('message', (msg) => {
    console.log('message from client:', msg)
    io.to(socket.data.room).emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })
})

server.listen(3000, () => console.log('running on 3000'))