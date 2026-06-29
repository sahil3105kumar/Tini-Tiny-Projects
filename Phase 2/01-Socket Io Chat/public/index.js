const socket = io()
const form = document.getElementById('form')
const input = document.getElementById('input')
const list = document.getElementById('messages')

const room = prompt('enter room name:') || 'general'

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = input.value
  socket.emit('message', msg)
  input.value = ''
})

socket.on('connect', () => {
  console.log('connected to server, my socket ID is', socket.id)
  socket.emit('join room', room) // this will trigger the 'join room' event on the server, and the server will add this socket to the specified room.
})

socket.on('chat message', (msg) => {
  const li = document.createElement('li')
  li.textContent = msg
  list.appendChild(li)
})

socket.on('disconnect', () => {
  console.log('disconnected from server')
})