# semo

learning project. building a p2p encrypted file drop thing from scratch — no servers, no accounts, just two devices talking directly to each other.

doing it in phases. each folder is one small project. gotta finish each one before moving to the next.

---

## projects

### phase 0 — foundations

| | folder | what i'm building |
|--|--------|-------------------|
| P0-01 | `P0-01-ClipboardApp` | type text, copy to clipboard, track how many times |
| P0-02 | `P0-02-LocalTodoList` | todo app that saves to localStorage |
| P0-03 | `P0-03-FetchWeatherApp` | pull weather from Open-Meteo API and display it |
| P0-04 | `P0-04-NodeCLITool` | node script that reads a file and counts word frequency |

### phase 1 — webrtc core

| | folder | what i'm building |
|--|--------|-------------------|
| P1-01 | `P1-01-ManualWebRTCChat` | two tabs, paste SDP manually, send messages via DataChannel |
| P1-02 | `P1-02-TinyFileTransfer` | send a small file over DataChannel, download on the other side |
| P1-03 | `P1-03-STUNTestTool` | gather ICE candidates, figure out my public IP |

### phase 2 — signaling server

| | folder | what i'm building |
|--|--------|-------------------|
| P2-01 | `P2-01-RealtimeChatApp` | multi-room chat with socket.io |
| P2-02 | `P2-02-SignalingServer` | actual signaling server — room keys, relay SDP/ICE between peers |
| P2-03 | `P2-03-PeerNotifier` | show sender a spinner until the receiver connects |

### phase 3 — large files

| | folder | what i'm building |
|--|--------|-------------------|
| P3-01 | `P3-01-1GBFileTransferTest` | transfer 1 GB, show speed + ETA, verify checksum |
| P3-02 | `P3-02-ChunkedUploader` | chunked file upload to a node server using fetch |
| P3-03 | `P3-03-DownloadStreamWriter` | generate a 500 MB fake file and stream it to disk |

### phase 4 — encryption

| | folder | what i'm building |
|--|--------|-------------------|
| P4-01 | `P4-01-BrowserEncryptDecryptTool` | encrypt/decrypt text in the browser with a passphrase |
| P4-02 | `P4-02-EncryptedFileLocker` | encrypt a file in browser, save as .enc, decrypt it back |
| P4-03 | `P4-03-SecureNotesApp` | notes app where everything is encrypted before hitting localStorage |

### phase 5 — auth + advanced stuff

| | folder | what i'm building |
|--|--------|-------------------|
| P5-01 | `P5-01-AuthRESTAPI` | register/login/logout with JWT + bcrypt + postgres |
| P5-02 | `P5-02-ResumableUpload` | upload that picks up from where it left off after a refresh |
| P5-03 | `P5-03-MultiTabBroadcast` | 1 sender → 3 receivers, all getting the file at the same time |

---

## how to run

```bash
cd phase0/01-ClipboardApp
# frontend projects: open index.html in a browser
# node projects:
node index.js
```

## structure

```
semo/
├── README.md
├── .gitignore
├── Phase 0
|  └── 01-ClipboardApp/
│   ├── README.md
│   └── index.html
├   └── 02-LocalTodoList/
│   └── ...
└── ...
```

each project has its own readme with what i was trying to learn, how to run it, and what tripped me up.

---

## end goal

something like airdrop or wormhole.app — direct device-to-device, end-to-end encrypted, nothing going through a server.