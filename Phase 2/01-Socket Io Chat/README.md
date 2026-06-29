# P2-01 — SocketioChat
first Phase 2 project. real chat between multiple browser tabs through an actual node server, using Socket.io instead of manual SDP copy-paste. point of this one is to get comfortable with the Socket.io API itself before it gets used to build the signaling server.
---
## what it does
- node + express server with Socket.io attached
- any number of browser tabs can connect at once
- type a message, hit send (or enter)
- server receives it and broadcasts it out to every connected client, including the sender
- message shows up in every open tab, in order
---
## how to run
```
npm install
npm run dev
```
then open `http://localhost:3000` in as many tabs as you want.
---
## the message flow
```
Tab A: types message, submits form
  → client emits 'message' to server
Server: receives 'message'
  → io.emit('chat message', msg) to everyone connected
Tab A, Tab B, Tab C...: each receive 'chat message'
  → append it to the message list
```
---
## what i learned
**io vs socket** — `io` is the whole server, it only knows about things arriving (`connection`). `socket` is one specific established connection, everything that happens to that one client lives on it (`disconnect`, custom events).
**connection vs connect** — same handshake, two names, because each side is narrating from its own point of view. server says "a connection arrived" (noun). client says "I connected" (verb, it did the action).
**emit/on is not request/response** — no return value, no promise by default. you send an event, and separately you listen for whatever comes back. it's two one-way streets, not a round trip in one function call.
**socket.emit vs broadcast.emit vs io.emit** — three different audiences. `socket.emit` = just this one client. `socket.broadcast.emit` = everyone except this one. `io.emit` = literally everyone, sender included. picking the right one matters for whether the sender sees their own message twice.
**don't render optimistically and also wait for the broadcast** — if the client draws its own message locally AND the server echoes it back to everyone including the sender, the sender sees it twice. pick one source of truth for rendering. went with: server is always the source of truth, client never renders before the round trip completes.
---
## bugs i hit
**wrong server for the job** — opened index.html through a Live Server / port 5501 static extension instead of through the actual node server on port 3000. socket.io's client bundle only exists because the node server serves it — a generic static file server has no idea that route exists. 404 → browser tries to run the 404 html page as if it were javascript → MIME type error.
**css filename mismatch** — linked `style.css` in the html but the file was actually named `index.css`. browser asked for a file that didn't exist, server's 404 page came back instead, browser refused to apply it as a stylesheet.
**socket.id read too early** — tried to read `socket.id` before the `connect` event had actually fired. id isn't assigned until the handshake completes, so reading it outside the connect callback gave undefined.
**local npm binaries aren't on PATH** — installed nodemon, then tried running `nodemon server.js` directly in the terminal. shell has no idea where local node_modules binaries live. fixed it with an npm script instead of relying on global PATH resolution.
**duplicate message rendering** — client was appending its own message to the DOM immediately on submit, AND the server was broadcasting it back to everyone including the sender. sender saw their own message twice. fixed by removing the local append entirely and letting the broadcast be the only thing that ever draws a message.
---
## files
```
P2-01-SocketioChat/
├── server.js
├── package.json
└── public/
    ├── index.html
    ├── index.css
    └── index.js
```