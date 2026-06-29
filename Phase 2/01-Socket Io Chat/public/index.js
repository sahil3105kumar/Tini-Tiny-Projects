const socket = io()
const form = document.getElementById('form')
const input = document.getElementById('input')
const list = document.getElementById('messages')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = input.value
  socket.emit('message', msg)
  input.value = ''
})

socket.on('connect', () => {
  console.log('connected to server, my socket ID is', socket.id)
})

socket.on('chat message', (msg) => {
  const li = document.createElement('li')
  li.textContent = msg
  list.appendChild(li)
})

socket.on('disconnect', () => {
  console.log('disconnected from server')
})