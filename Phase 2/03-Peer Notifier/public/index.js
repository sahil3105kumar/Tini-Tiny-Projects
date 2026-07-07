const socket = io()

// --- state ---
let state = {
  screen: 'idle',      // idle | waiting | connecting | connected | error
  roomId: null,
  role: null,          // 'creator' | 'joiner'
  errorMsg: '',
  connectStep: 0,      // 0-3, drives the progress bar
}

// --- element refs ---
const screens    = document.querySelectorAll('[data-screen]')
const createBtn  = document.getElementById('createBtn')
const joinBtn    = document.getElementById('joinBtn')
const roomInput  = document.getElementById('roomInput')
const roomCode   = document.getElementById('roomCode')
const roomCodeC  = document.getElementById('roomCodeConnecting')
const copyBtn    = document.getElementById('copyBtn')
const connectMsg = document.getElementById('connectingMsg')
const progressFill = document.getElementById('progressFill')
const peerId     = document.getElementById('peerId')
const chatbox    = document.getElementById('chat')
const msgInput   = document.getElementById('msgInput')
const sendBtn    = document.getElementById('sendBtn')
const errorMsg   = document.getElementById('errorMsg')
const retryBtn   = document.getElementById('retryBtn')

// --- webrtc state ---
let pc = null
let dc = null
const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

// ============================================================
// render — the only place UI decisions live
// ============================================================
function render() {
  // show the right screen
  screens.forEach(s => {
    s.classList.toggle('active', s.dataset.screen === state.screen)
  })

  if (state.screen === 'waiting') {
    roomCode.textContent = state.roomId
  }

  if (state.screen === 'connecting') {
    roomCodeC.textContent = state.roomId
    const steps = [
      'peer joined — negotiating...',
      'exchanging offer...',
      'exchanging answer...',
      'exchanging ice candidates...',
    ]
    connectMsg.textContent = steps[state.connectStep] || steps[0]
    progressFill.style.width = `${(state.connectStep / 3) * 100}%`
  }

  if (state.screen === 'connected') {
    peerId.textContent = socket.id
  }

  if (state.screen === 'error') {
    errorMsg.textContent = state.errorMsg
  }
}

// ============================================================
// setState — single entry point for all state changes
// ============================================================
function setState(patch) {
  state = { ...state, ...patch }
  render()
}

// initial render
render()

// ============================================================
// socket events
// ============================================================
createBtn.addEventListener('click', () => {
  socket.emit('create room')
})

socket.on('room created', (roomId) => {
  setState({ screen: 'waiting', roomId, role: 'creator' })
})

socket.on('peer joined', async () => {
  setState({ screen: 'connecting', connectStep: 0 })

  pc = new RTCPeerConnection(iceConfig)
  dc = pc.createDataChannel('chat')
  setupDataChannel()

  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit('ice candidate', e.candidate)
  }

  setState({ connectStep: 1 })
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socket.emit('offer', pc.localDescription)
  setState({ connectStep: 2 })
})

socket.on('answer', async (sdp) => {
  await pc.setRemoteDescription(sdp)
  setState({ connectStep: 3 })
})

joinBtn.addEventListener('click', () => {
  const roomId = roomInput.value.trim()
  if (!roomId) return
  socket.emit('join room', roomId)
})

roomInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinBtn.click()
})

socket.on('joined room', (roomId) => {
  setState({ screen: 'connecting', roomId, role: 'joiner', connectStep: 0 })
})

socket.on('offer', async (sdp) => {
  setState({ connectStep: 1 })

  pc = new RTCPeerConnection(iceConfig)

  pc.ondatachannel = (e) => {
    dc = e.channel
    setupDataChannel()
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit('ice candidate', e.candidate)
  }

  await pc.setRemoteDescription(sdp)
  setState({ connectStep: 2 })
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socket.emit('answer', pc.localDescription)
  setState({ connectStep: 3 })
})

socket.on('ice candidate', async (candidate) => {
  if (pc) await pc.addIceCandidate(candidate)
})

socket.on('join error', (msg) => {
  setState({ screen: 'error', errorMsg: msg })
})

// ============================================================
// datachannel
// ============================================================
function setupDataChannel() {
  dc.onopen = () => setState({ screen: 'connected' })
  dc.onmessage = (e) => appendMessage(`them: ${e.data}`, 'them')
  dc.onclose = () => setState({ screen: 'error', errorMsg: 'peer disconnected' })
}

// ============================================================
// chat
// ============================================================
function appendMessage(text, type) {
  const empty = chatbox.querySelector('.empty')
  if (empty) empty.remove()
  const p = document.createElement('p')
  p.textContent = text
  p.className = type
  chatbox.appendChild(p)
  chatbox.scrollTop = chatbox.scrollHeight
}

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

// ============================================================
// copy button
// ============================================================
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(state.roomId).then(() => {
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    setTimeout(() => {
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
    }, 2000)
  })
})

// ============================================================
// retry
// ============================================================
retryBtn.addEventListener('click', () => {
  pc = null
  dc = null
  setState({ screen: 'idle', roomId: null, role: null, errorMsg: '', connectStep: 0 })
})

// ============================================================
// connection lifecycle
// ============================================================
socket.on('connect', () => console.log('connected:', socket.id))
socket.on('disconnect', () => console.log('disconnected'))