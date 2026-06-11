# P1-03 — STUNTestTool

simplest project in Phase 1. no chat, no file transfer. just creates a PeerConnection, kicks off ICE gathering, and displays every candidate the browser finds — including your public IP discovered via STUN.

---

## what it does

- click the button
- browser contacts Google's STUN server
- all ICE candidates appear as they're discovered
- host candidates (local IPs) shown in grey
- srflx candidates (public IP via STUN) highlighted in green
- public IP extracted and displayed at the top

---

## how to run

open `index.html` in a browser. no setup needed.

---

## what i learned

**ICE gathering needs something to negotiate** — `createOffer()` with no media tracks and no DataChannel produces an empty offer. ICE never starts. adding a dummy DataChannel gives the connection something to negotiate and kicks off gathering.

**candidate types in the wild** — you can see all three types just by running this tool:
- `typ host` — your local network IP (192.168.x.x or similar). useless for cross-internet connections.
- `typ srflx` — your public IP as seen from outside your router, discovered by asking the STUN server. this is what other peers use to reach you.
- `typ relay` — only appears if you configured a TURN server. packets go through the relay instead of directly.

**reading the candidate string** — a raw ICE candidate string looks like:
```
candidate:1 1 UDP 1685987327 223.228.242.192 49336 typ srflx raddr 0.0.0.0 rport 0
```
the public IP sits right before `typ srflx`. regex pulls it out:
```js
const match = str.match(/(\d+\.\d+\.\d+\.\d+) \d+ typ srflx/)
// match[1] = '223.228.242.192'
```

**null candidate = gathering complete** — `onicecandidate` fires for every candidate found. when `event.candidate` is null, gathering is done. that's the signal to do any post-processing — in this case, scanning for the srflx candidate and extracting the IP.

---

## files

```
P1-03-STUNTestTool/
├── index.html
├── index.css
└── index.js
```