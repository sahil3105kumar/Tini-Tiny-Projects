const offerbtn    = document.getElementById('offer');
const answerbtn   = document.getElementById('answer');
const localSDP = document.getElementById('local-sdp');
const remoteSDP = document.getElementById('remote-sdp');
const setRemoteDescr = document.getElementById('set-remote');
const sendbtn = document.getElementById('send');
const chatbox = document.getElementById('chat');
const msg = document.getElementById('message-input');

let pc = null; // peer connection
let dc = null; // data channel

async function createOffer() {
    pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    dc = pc.createDataChannel('chat');
    dc.onopen = () => {
        console.log('Data channel is open');
    }
    dc.onmessage = (event) => {
        const message = event.data;
        const p = document.createElement('p');
        p.textContent = `Remote: ${message}`;
        chatbox.appendChild(p);
    }

    pc.onicecandidate = (event) => { 
        if(event.candidate == null){
            localSDP.value = JSON.stringify(pc.localDescription);
        }
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
}

offerbtn.addEventListener('click', createOffer);

async function createAnswer() {
    pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.ondatachannel = (event) => {
        dc = event.channel;
        dc.onopen = () => {
            console.log('Data channel is open');
        }
        dc.onmessage = (event) => {
            const message = event.data;
            const p = document.createElement('p');
            p.textContent = `Remote: ${message}`;
            chatbox.appendChild(p);
        }
    }

    pc.onicecandidate = (event) => { 
        if(event.candidate == null){
            localSDP.value = JSON.stringify(pc.localDescription);
        }
    }

    await pc.setRemoteDescription(JSON.parse(remoteSDP.value));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    

}

answerbtn.addEventListener('click', createAnswer);

async function setRemoteDescription() {
    if(!pc){ //  ye kon sa pc h , the offer one, matlb, wo tab jo offer create kr rha h, whi tab set remote description kr skta h, answer wala ka to already local or remote set kr diye after creating answer.
        alert('Create an offer or answer first!');
        return;
    }
    await pc.setRemoteDescription(JSON.parse(remoteSDP.value));
}

setRemoteDescr.addEventListener('click', setRemoteDescription);

async function sendMessage() {

    if(dc === null || dc.readyState !== 'open'){
        alert('Data channel is not open!');
        return;
    }

    const message = msg.value;

    if(message.trim() === ''){
        alert('Message cannot be empty!');
        return;
    }

    dc.send(message);

    const p = document.createElement('p');
    p.textContent = `You: ${message}`;
    chatbox.appendChild(p);

    msg.value = '';
}

sendbtn.addEventListener('click', sendMessage); 
msg.addEventListener('keypress', (event) => {
    if(event.key === 'Enter'){
        sendMessage();
    }
});
