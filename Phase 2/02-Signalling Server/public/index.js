const socket = io()

const lobby = document.getElementById('lobby')
const room = document.getElementById('room')
const createBtn = document.getElementById('createBtn')
const joinBtn = document.getElementById('joinBtn')
const roomInput = document.getElementById('roomInput')
const roomCode = document.getElementById('roomCode')
const statusMsg = document.getElementById('statusMsg')
const chatbox  = document.getElementById('chat')
const msgInput = document.getElementById('msgInput')
const sendBtn  = document.getElementById('sendBtn')

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
  const p = document.createElement('p')
  p.textContent = text
  p.className = type // classname....
  chatbox.appendChild(p)
  chatbox.scrollTop = chatbox.scrollHeight
}

// --- datachannel setup (shared between creator and joiner) ---
function setupDataChannel() {
  dc.onopen = () => {
    setStatus('connected', true)
    sendBtn.disabled = false
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
  // WebRTC offer creation 
  pc = new RTCPeerConnection(iceConfig)
  dc = pc.createDataChannel('chat')
  setupDataChannel()

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('ice candidate', e.candidate)
    }
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socket.emit('offer', pc.localDescription)
  setStatus('offer sent — waiting for answer...')
})

// this will be called when the joiner send their answer back
socket.on('answer', async (sdp) => {
  await pc.setRemoteDescription(sdp)
  setStatus('answer received — connecting...')

  room.classList.add('hidden')
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

  pc = new RTCPeerConnection(iceConfig)

  pc.ondatachannel = (e) => {
    dc = e.channel
    setupDataChannel()
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('ice candidate', e.candidate)
    }
  }

  await pc.setRemoteDescription(sdp)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socket.emit('answer', pc.localDescription)
  setStatus('answer sent — waiting for connection...')
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
socket.on('connect', () => {
  console.log('connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('disconnected')
})