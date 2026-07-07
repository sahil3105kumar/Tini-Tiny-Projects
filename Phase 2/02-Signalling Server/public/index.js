const socket = io()

const lobby = document.getElementById('lobby')
const room = document.getElementById('room')
const createBtn = document.getElementById('createBtn')
const joinBtn = document.getElementById('joinBtn')
const roomInput = document.getElementById('roomInput')
const roomCode = document.getElementById('roomCode')
const statusMsg = document.getElementById('statusMsg')
const chatbox = document.getElementById('chat')
const msgInput = document.getElementById('msgInput')
const sendBtn = document.getElementById('sendBtn')
const copyBtn = document.getElementById('copyBtn')
const chatPanel = document.getElementById('chatPanel')

// --- webrtc state ---
let pc = null
let dc = null

const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

// --- ui helpers ---
function showRoom(code, msg) {
  lobby.classList.add('hidden')
  room.classList.remove('hidden')
  roomCode.textContent = code
  statusMsg.textContent = msg
}

function setStatus(msg, active = false) {
  statusMsg.textContent = msg
  statusMsg.className = active ? 'active' : ''
}

function appendMessage(text, type) {
  const empty = chatbox.querySelector('.empty')
  if (empty) empty.remove()
  const p = document.createElement('p')
  p.textContent = text
  p.className = type
  chatbox.appendChild(p)
  chatbox.scrollTop = chatbox.scrollHeight
}

// --- copy room code ---
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(roomCode.textContent).then(() => {
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    setTimeout(() => {
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
    }, 2000)
  })
})

// --- datachannel setup ---
function setupDataChannel() {
  dc.onopen = () => {
    setStatus('connected', true)
    sendBtn.disabled = false
    room.classList.add('hidden')
  }
  dc.onmessage = (e) => appendMessage(`them: ${e.data}`, 'them')
  dc.onclose = () => setStatus('disconnected')
}

// --- creator flow ---
createBtn.addEventListener('click', () => {
  socket.emit('create room')
})

socket.on('room created', (roomId) => {
  showRoom(roomId, 'waiting for peer to join...')
})

socket.on('peer joined', async () => {
  setStatus('peer joined — creating offer...', true)
  chatPanel.classList.remove('hidden')

  pc = new RTCPeerConnection(iceConfig)
  dc = pc.createDataChannel('chat')
  setupDataChannel()

  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit('ice candidate', e.candidate)
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socket.emit('offer', pc.localDescription)
  setStatus('offer sent — waiting for answer...')
})

socket.on('answer', async (sdp) => {
  await pc.setRemoteDescription(sdp)
  setStatus('answer received — connecting...')
})

// --- joiner flow ---
joinBtn.addEventListener('click', () => {
  const roomId = roomInput.value.trim()
  if (!roomId) return
  socket.emit('join room', roomId)
})

socket.on('joined room', (roomId) => {
  showRoom(roomId, 'joined — waiting for offer...')
})

socket.on('offer', async (sdp) => {
  setStatus('offer received — creating answer...', false)
  chatPanel.classList.remove('hidden')

  pc = new RTCPeerConnection(iceConfig)

  pc.ondatachannel = (e) => {
    dc = e.channel
    setupDataChannel()
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit('ice candidate', e.candidate)
  }

  await pc.setRemoteDescription(sdp)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socket.emit('answer', pc.localDescription)
  setStatus('answer sent — waiting for connection...')
})

roomInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinBtn.click()
})

socket.on('ice candidate', async (candidate) => {
  if (pc) await pc.addIceCandidate(candidate)
})

socket.on('join error', (msg) => {
  alert(msg)
})

// --- chat ---
sendBtn.addEventListener('click', sendMessage)
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage()
})

function sendMessage() {
  if (!dc || dc.readyState !== 'open') return
  const text = msgInput.value.trim()
  if (!text) return
  dc.send(text)
  appendMessage(`me: ${text}`, 'me')
  msgInput.value = ''
}

// --- connection lifecycle ---
socket.on('connect', () => console.log('connected:', socket.id))
socket.on('disconnect', () => console.log('disconnected'))