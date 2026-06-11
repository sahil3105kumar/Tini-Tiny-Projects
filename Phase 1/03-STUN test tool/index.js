const start         = document.getElementById('startButton');
const candidateList = document.getElementById('iceCandidates');
const yourIP        = document.getElementById('YourIP');

async function startTest() {
  candidateList.innerHTML = ''
  yourIP.textContent = ''

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  pc.onicecandidate = (event) => {
    if (event.candidate != null) {
      const p = document.createElement('p')
      p.textContent = event.candidate.candidate

      // colour-code by type
      if (event.candidate.candidate.includes('typ srflx')) p.className = 'srflx'
      else if (event.candidate.candidate.includes('typ relay')) p.className = 'relay'

      candidateList.appendChild(p)
    } else {
      // gathering complete — extract public IP from srflx candidate
      for (const p of candidateList.children) {
        if (p.textContent.includes('srflx')) {
          const match = p.textContent.match(/(\d+\.\d+\.\d+\.\d+) \d+ typ srflx/)
          if (match) {
            yourIP.textContent = `your public IP: ${match[1]}`
          }
        }
      }
    }
  }

  pc.createDataChannel('test')
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
}

start.addEventListener('click', startTest)