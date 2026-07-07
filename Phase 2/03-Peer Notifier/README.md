# P2-03 — PeerNotifier

same signaling flow as P2-02, but the point this time is UI state management. instead of scattered `classList.add/remove` calls across every event handler, the entire UI is driven by a single state object and one `render()` function.

---

## what's different from P2-02

no new Socket.io or WebRTC concepts. `server.js` is identical. the only thing that changed is how the client manages UI.

**P2-02 approach** — imperative, scattered:
```
socket.on('peer joined', () => {
  room.classList.remove('hidden')
  chatPanel.classList.add('hidden')
  statusMsg.textContent = '...'
  // DOM calls everywhere, across every handler
})
```

**P2-03 approach** — state drives the UI:
```
socket.on('peer joined', () => {
  setState({ screen: 'connecting', connectStep: 0 })
  // that's it. render() handles the DOM.
})
```

---

## the state machine

```
idle → waiting (created a room)
idle → connecting (joined a room)
waiting → connecting (peer joined)
connecting → connected (DataChannel open)
connecting → error (join failed)
connected → error (peer disconnected)
error → idle (retry)
```

each state maps to exactly one visible screen. no state = no screen. no way to be in two screens at once.

---

## what i learned

**one state object, one render function** — `state` is a plain object at the top of the file. `render()` reads it and updates the DOM. nothing else touches the DOM for visibility. this makes the UI predictable — if something looks wrong, you check `state`, not six different event handlers.

**setState as the single entry point** — every socket event, every button click, calls `setState(patch)` which merges the patch and calls `render()`. you never call `render()` directly, and you never mutate `state` directly. same discipline React enforces, done manually so the reason for it is obvious.

**screens as data attributes** — each screen is a `[data-screen]` div. `render()` toggles `.active` on whichever one matches `state.screen`. adding a new screen means adding a div and a new case in `render()` — nothing else changes.

**progress bar driven by state** — `state.connectStep` (0–3) drives both the progress bar width and the status message text during the connecting screen. the connecting screen never knows how it got to step 2 — it just reads the number and renders accordingly.

---

## files

```
P2-03-PeerNotifier/
├── server.js        (identical to P2-02)
├── package.json
└── public/
    ├── index.html
    ├── index.css
    └── index.js
```