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