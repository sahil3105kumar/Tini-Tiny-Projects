const offerbtn       = document.getElementById('offer');
const answerbtn      = document.getElementById('answer');
const localSDP       = document.getElementById('local-sdp');
const remoteSDP      = document.getElementById('remote-sdp');
const setRemoteDescr = document.getElementById('set-remote');
const sendbtn        = document.getElementById('send');
const chatbox        = document.getElementById('chat');
const msg            = document.getElementById('message-input');
const status         = document.getElementById('status');
const transferStatus   = document.getElementById('transfer-status');

let pc = null; // peer connection
let dc = null; // data channel
let fc = null; // file channel
let recievedChunks = [];
let fileMetadata = null;

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
  pc.onicecandidate = (event) => {
    if (event.candidate == null) {
      localSDP.value = JSON.stringify(pc.localDescription);
    }
  }

  dc = pc.createDataChannel('chat');

  dc.onopen = () => {
    setStatus('connected', true);
  }

  dc.onmessage = (event) => {
    appendMessage(`them: ${event.data}`, 'them');
  }

  fc = pc.createDataChannel('file');

  fc.binaryType = 'arraybuffer';
  fc.onmessage = (event) => {
  if (typeof event.data === 'string') {
    const data = JSON.parse(event.data)
    if (data.type === 'file-start') {
      fileMetadata = data
      recievedChunks = []
      transferStatus.textContent = `Receiving ${data.name}...`
    } else if (data.type === 'file-done') {
      const blob = new Blob(recievedChunks, { type: fileMetadata.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileMetadata.name
      a.textContent = `Download ${fileMetadata.name}`
      document.getElementById('received-files').appendChild(a)
      transferStatus.textContent = `Received ${fileMetadata.name}`
      recievedChunks = []
      fileMetadata = null
    }
  } else {
    recievedChunks.push(event.data)
  }
}

  setStatus('gathering candidates...');
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function createAnswer() {
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  pc.ondatachannel = (event) => {
    const channel = event.channel;
    if (channel.label =='chat') {
        dc = channel;
        dc.onopen = () => setStatus('connected', true);
        dc.onmessage = (event) => appendMessage(`them: ${event.data}`, 'them');
    } else if (channel.label == 'file') {
      fc = channel;
      fc.binaryType = 'arraybuffer';

      fc.onmessage = (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.type === 'file-done') {
            const blob = new Blob(recievedChunks, { type: fileMetadata.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileMetadata.name;
            a.textContent = `Download ${fileMetadata.name}`;
            document.getElementById('received-files').appendChild(a);
            transferStatus.textContent = `Received ${fileMetadata.name} (${fileMetadata.size} bytes)`;
            recievedChunks = [];
            fileMetadata = null;
          } else if(data.type === 'file-start') {
            fileMetadata = data; // Store metadata for later use
            recievedChunks = []; // Clear any previous chunks
            transferStatus.textContent = `Receiving ${fileMetadata.name}...`;
          }
        } else {
          recievedChunks.push(event.data); // Store received chunks
        }   
      };
    }
  };

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

async function sendFile() {
    const file = document.getElementById('file-input').files[0];
    if (!file) {
      alert('Please select a file first!');
      return;
    }else if (fc === null || fc.readyState !== 'open') {
      alert('File channel is not open!');
      return;
    }

    const chunkSize = 16384; // 16KB
    const buffer = await file.arrayBuffer();
    const metadata = JSON.stringify({ type: 'file-start', name: file.name, size: file.size, mimeType: file.type });
    fc.send(metadata); // Send file metadata first

    transferStatus.textContent = `Sending ${file.name}...`;

    for (let offset = 0; offset < buffer.byteLength; offset += chunkSize) {
      const chunk = buffer.slice(offset, offset + chunkSize);
      fc.send(chunk);
    }

    transferStatus.textContent = `File ${file.name} sent successfully!`;

    fc.send(JSON.stringify({ type : 'file-done'})); // Signal end of file transfer
}

offerbtn.addEventListener('click', createOffer);
answerbtn.addEventListener('click', createAnswer);
setRemoteDescr.addEventListener('click', setRemoteDescription);
sendbtn.addEventListener('click', sendMessage);
msg.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') sendMessage();
});
document.getElementById('send-file').addEventListener('click', sendFile)