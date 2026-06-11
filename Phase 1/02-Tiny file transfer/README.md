# P1-02 — TinyFileTransfer

built on top of P1-01. same manual SDP copy-paste, same two tabs, but now both peers can send files to each other over a dedicated DataChannel. files are split into chunks, sent as raw binary, reassembled on the other side, and offered as a download link.

---

## what it does

- everything from P1-01 (manual WebRTC chat)
- pick a file, click send, it arrives on the other side as a download link
- both peers can send and receive files
- transfer status updates live ("sending...", "receiving...", "received")

---

## how to run

open `index.html` in two browser tabs. same manual SDP flow as P1-01.

---

## concepts

### ArrayBuffer

raw binary data in JavaScript. when you read a file with `file.arrayBuffer()`, you get an ArrayBuffer — just a sequence of bytes with no meaning attached. this is what you send over the wire. the receiver collects those bytes and reassembles them into a Blob, which the browser can treat as a file again.

```
File → ArrayBuffer → chunks → send → collect chunks → Blob → download
```

### chunking

DataChannel has a safe message size limit of ~16KB. you can't send a 5MB file as one message — it'll either fail silently or overflow the buffer. so you slice the ArrayBuffer into 16KB pieces and send them one by one:

```js
for (let offset = 0; offset < buffer.byteLength; offset += chunkSize) {
  const chunk = buffer.slice(offset, offset + chunkSize)
  fc.send(chunk)
}
```

the receiver pushes each chunk into an array. when all chunks arrive, concatenate them back into a Blob.

### the messaging protocol

the file channel carries two types of messages — JSON strings and binary ArrayBuffers. you need a way to tell them apart and signal when a transfer starts and ends:

```
sender:   JSON  { type: 'file-start', name, size, mimeType }
sender:   ArrayBuffer  ← chunk 1
sender:   ArrayBuffer  ← chunk 2
...
sender:   JSON  { type: 'file-done' }
```

the receiver checks `typeof event.data === 'string'` to detect JSON messages and handles each type accordingly.

### two DataChannels on one PeerConnection

you can have multiple DataChannels on the same RTCPeerConnection. each has a label. the receiver's `ondatachannel` event fires once per channel — check `channel.label` to know which one arrived and wire it up correctly.

```js
pc.ondatachannel = (event) => {
  if (event.channel.label === 'chat') { ... }
  if (event.channel.label === 'file') { ... }
}
```

### Blob and URL.createObjectURL

after reassembly, `new Blob(chunks, { type: mimeType })` creates a file-like object in memory. `URL.createObjectURL(blob)` gives you a temporary URL pointing to it. attach that to an `<a>` tag with a `download` attribute and the browser treats it as a file download.

---

## code walkthrough

**createOffer** — sets up both channels. `dc` for chat, `fc` for files. `fc.binaryType = 'arraybuffer'` tells the channel to deliver incoming binary as ArrayBuffer instead of Blob. `fc.onmessage` handles incoming file transfers on Peer A's side.

**createAnswer** — receives both channels via `ondatachannel`. checks the label to assign and configure each one. same `fc.onmessage` logic for Peer B.

**sendFile** — reads the file as ArrayBuffer, sends a `file-start` JSON message with metadata, loops through the buffer in 16KB chunks sending each one, then sends `file-done`. updates transfer status at each step.

**fc.onmessage** — checks if the incoming message is a string (JSON) or binary (chunk). on `file-start`, saves metadata and clears the chunks array. on `file-done`, assembles the Blob, creates a download link, appends it to the page. on binary, pushes to the chunks array.

---

## bugs i hit

**`type` field collision in metadata** — sent `{ name, size, type: file.type }` where `type` was the MIME type. the receiver checked `data.type === 'file-start'` and got `'image/png'` instead — never matched, `fileMetadata` stayed null, crashed on `file-done`. fixed by renaming the MIME type field to `mimeType` and adding an explicit `type: 'file-start'` field.

**Peer A couldn't receive files** — only wired `fc.onmessage` inside `createAnswer` for Peer B. Peer A created `fc` in `createOffer` but had no message handler on it. fixed by adding the same `fc.onmessage` logic inside `createOffer` after creating the file channel.

**typo in variable name** — declared `fieleMetadata` at the top but used `fileMetadata` everywhere else. silent reference error that only showed up at runtime.

---

## limitations

- no flow control — blasting chunks with no `bufferedAmount` check. works fine under ~5MB, unreliable above that
- no progress percentage — just text status, no progress bar
- no resume — if connection drops mid-transfer, start over
- both covered in Phase 3

---

## files

```
P1-02-TinyFileTransfer/
├── index.html
├── index.css
└── index.js
```