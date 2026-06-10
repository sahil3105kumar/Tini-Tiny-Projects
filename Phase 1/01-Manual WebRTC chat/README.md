# P1-01 — ManualWebRTCChat

first WebRTC project. two browser tabs, no server, no automation. SDP copy-pasted by hand between tabs. the point is to see the handshake work before abstracting it away.

---

## what it does

- Peer A creates an offer → SDP appears in the textarea
- Peer B pastes it, creates an answer → their SDP appears
- Peer A pastes the answer, sets remote description
- DataChannel opens on both sides
- both peers can send and receive text messages directly

---

## how to run

just open `index.html` in two browser tabs. no server, no npm, nothing.

---

## the manual signaling flow

```
Tab A: click "Create Offer"
  → wait for SDP to appear (ICE gathering completes)
  → copy the local SDP

Tab B: paste into remote SDP textarea
  → click "Create Answer"
  → wait for SDP to appear
  → copy the local SDP

Tab A: paste into remote SDP textarea
  → click "Set Remote Description"
  → both tabs log "connected"
  → start chatting
```

---

## what i learned

**the handshake order is strict** — createDataChannel must come before createOffer. setRemoteDescription must come before createAnswer on Peer B. get it wrong and nothing connects, no useful error.

**full ICE vs trickle ICE** — waiting for the null candidate before copying SDP means all candidates are bundled into the SDP blob. no need to exchange candidates separately. this is full ICE — simpler for manual signaling, slower than trickle.

**ondatachannel only fires on the receiver** — Peer A creates the channel, Peer B receives it via ondatachannel. if you try to create it on both sides you get two separate channels that don't connect.

**onicecandidate vs onicecandidate null** — the event fires for every candidate discovered. the null event means gathering is done. that's the signal to copy the SDP — not before.

**setRemoteDescription on Peer A is a separate step** — Peer A has no answer yet when it creates the offer. it has to wait for Peer B to generate one, then paste and apply it manually. this is what a signaling server automates in Phase 2.

---

## bugs i hit

**event parameter shadowing** — named an event listener param the same as an outer variable. logged a MouseEvent instead of the actual value.

**onicecandidate inside ondatachannel** — put ICE setup inside the wrong callback. ICE needs to be wired to pc directly at the top level, not inside a channel event.

**mixing await and .then()** — started with .then() chains then switched to await. mixing them in the same function made the order hard to reason about. kept it all async/await.

---

## files

```
P1-01-ManualWebRTCChat/
├── index.html
├── index.css
└── index.js
```