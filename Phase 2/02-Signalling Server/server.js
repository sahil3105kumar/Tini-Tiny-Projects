const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  socket.on('create room', () => {
    const roomId = Math.random().toString(36).slice(2, 8)
    socket.join(roomId)
    socket.data.room = roomId
    console.log(`room created: ${roomId}`)
    socket.emit('room created', roomId)
  })

  socket.on('join room', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId)

    if (!room) {
      socket.emit('join error', 'room does not exist')
      return
    }

    if (room.size >= 2) {
      socket.emit('join error', 'room is full')
      return
    }

    socket.join(roomId)
    socket.data.room = roomId
    console.log(`${socket.id} joined room: ${roomId}`)

    socket.to(roomId).emit('peer joined')  // → peer A: go create offer
    socket.emit('joined room', roomId)     // → peer B: you're in, wait for offer
  })

  socket.on('offer', (sdp) => {
    const roomId = socket.data.room
    if (!roomId) return
    socket.to(roomId).emit('offer', sdp)
  })

  socket.on('answer', (sdp) => {
    const roomId = socket.data.room
    if (!roomId) return
    socket.to(roomId).emit('answer', sdp)
  })

  socket.on('ice candidate', (candidate) => {
    const roomId = socket.data.room
    if (!roomId) return
    socket.to(roomId).emit('ice candidate', candidate)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })
})

server.listen(3000, () => console.log('running on 3000'))