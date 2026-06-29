const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id) //  this wont show up in the browser console, it will show up in the terminal where you ran node server.js.

  socket.on('message', (msg) => {
    console.log('message from client:', msg)
    io.emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })
})

server.listen(3000, () => console.log('running on 3000'))