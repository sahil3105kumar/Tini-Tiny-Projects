const offerbtn       = document.getElementById('offer');
const answerbtn      = document.getElementById('answer');
const localSDP       = document.getElementById('local-sdp');
const remoteSDP      = document.getElementById('remote-sdp');
const setRemoteDescr = document.getElementById('set-remote');
const sendbtn        = document.getElementById('send');
const chatbox        = document.getElementById('chat');
const msg            = document.getElementById('message-input');
const status         = document.getElementById('status');

let pc = null; // peer connection
let dc = null; // data channel

function setStatus(text, connected = false) {
  status.textContent = text;
  status.className = 'status' + (connected ? ' connected' : '');
}

function appendMessage(text, type) {
  const empty = chatbox.querySelector('.empty');
  if (empty) empty.remove();
  const p = document.createElement('p');
  p.textContent = text;
  p.className = type; // 'me' or 'them'
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function createOffer() {
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  dc = pc.createDataChannel('chat');

  dc.onopen = () => {
    setStatus('connected', true);
  }

  dc.onmessage = (event) => {
    appendMessage(`them: ${event.data}`, 'them');
  }

  pc.onicecandidate = (event) => {
    if (event.candidate == null) {
      localSDP.value = JSON.stringify(pc.localDescription);
    }
  }

  setStatus('gathering candidates...');
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function createAnswer() {
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  pc.ondatachannel = (event) => {
    dc = event.channel;
    dc.onopen = () => setStatus('connected', true);
    dc.onmessage = (event) => appendMessage(`them: ${event.data}`, 'them');
  }

  pc.onicecandidate = (event) => {
    if (event.candidate == null) {
      localSDP.value = JSON.stringify(pc.localDescription);
    }
  }

  setStatus('gathering candidates...');
  await pc.setRemoteDescription(JSON.parse(remoteSDP.value));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
}

async function setRemoteDescription() {
  if (!pc) {
    alert('Create an offer or answer first!');
    return;
  }
  await pc.setRemoteDescription(JSON.parse(remoteSDP.value));
  setStatus('connecting...');
}

async function sendMessage() {
  if (dc === null || dc.readyState !== 'open') {
    alert('Data channel is not open!');
    return;
  }
  const message = msg.value.trim();
  if (message === '') return;

  dc.send(message);
  appendMessage(`me: ${message}`, 'me');
  msg.value = '';
}

offerbtn.addEventListener('click', createOffer);
answerbtn.addEventListener('click', createAnswer);
setRemoteDescr.addEventListener('click', setRemoteDescription);
sendbtn.addEventListener('click', sendMessage);
msg.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') sendMessage();
});