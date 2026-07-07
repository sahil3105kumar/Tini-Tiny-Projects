# P2-02 — SignalingServer

second Phase 2 project. two peers connect through a node server, exchange SDP and ICE candidates automatically over Socket.io, and establish a direct WebRTC DataChannel — no copy-paste, no manual steps. this is the automated version of P1-01.

---

## what it does

- peer A creates a room, gets a short room code to share
- peer B enters the code and joins
- server signals both peers asymmetrically — A creates the offer, B creates the answer
- SDP and ICE candidates relay through the server automatically
- once the DataChannel opens, all chat is peer-to-peer — server is out of the picture

---

## how to run

```
npm install
npm run dev
```

open `http://localhost:3000` in two browser tabs. create a room in one, paste the code into the other, chat directly.

---

## the signaling flow

```
Peer A: clicks "create room"
  → server generates a room ID, emits 'room created' back to A
  → A displays the code, waits

Peer B: enters the code, clicks "join"
  → server checks room exists + not full
  → server emits 'peer joined' to A  (→ go create offer)
  → server emits 'joined room' to B  (→ wait for offer)

Peer A: receives 'peer joined'
  → creates RTCPeerConnection + DataChannel
  → createOffer() → setLocalDescription()
  → socket.emit('offer', sdp) to server
  → server relays offer to B

Peer B: receives 'offer'
  → creates RTCPeerConnection
  → setRemoteDescription(offer)
  → createAnswer() → setLocalDescription()
  → socket.emit('answer', sdp) to server
  → server relays answer to A

Both peers: trickle ICE candidates through server as they arrive
  → addIceCandidate() on each received candidate

DataChannel opens → server is no longer involved
```

---

## what i learned

**asymmetric signaling** — creator and joiner can't do the same thing. creator creates the offer, joiner creates the answer. the server enforces this by sending different events to each peer (`peer joined` vs `joined room`) so each side knows its role without any client-side guessing.

**trickle ICE vs full ICE** — P1-01 waited for the null candidate before copying the full SDP blob. here, each candidate gets relayed individually as it arrives. faster connection setup, and more realistic — this is how production WebRTC actually works.

**socket.to(roomId) from inside the joiner's handler** — when peer B joins, `socket.to(roomId).emit('peer joined')` sends to everyone in the room *except* the sender. since the room only has A and B at that point, this goes to exactly A. no need to track A's socket ID separately.

**server stores room membership, client doesn't send it per-message** — room ID is stored once on `socket.data.room` at join time. every subsequent relay just reads it from there. client can't spoof routing by sending a different room ID on each message.

**RTCPeerConnection setup order matters** — `createDataChannel` must happen before `createOffer` on the creator side. `ondatachannel` must be wired up before `setRemoteDescription` on the joiner side. get the order wrong and the channel either doesn't exist or the event fires before you're listening.

**setupDataChannel as a shared function** — creator and joiner wire up the DataChannel at different times (creator right after `createDataChannel`, joiner inside `ondatachannel`). extracting `setupDataChannel()` avoids duplicating the `onopen`/`onmessage`/`onclose` logic.

---

## bugs i hit

**CSS variables undefined** — chat panel used `var(--surface)`, `var(--border)` etc. but `:root` never defined them. panel rendered with no background, no borders, invisible inputs. fixed by defining all variables in `:root` once and referencing them everywhere.

**chat panel visible on lobby** — chat panel was always in the DOM and not hidden on load. fixed by starting it with `class="hidden"` and only removing that class inside `showRoom()`.

**copy button inheriting full-width button styles** — the global `button` rule set `width: 100%`. copy button ended up stretching across the whole container. fixed with a scoped `#copyBtn` rule setting `width: auto`.

---

## files

```
P2-02-SignalingServer/
├── server.js
├── package.json
└── public/
    ├── index.html
    ├── index.css
    └── index.js
```