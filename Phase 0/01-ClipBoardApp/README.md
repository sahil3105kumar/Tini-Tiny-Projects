# P0-01 — ClipboardApp

first project. just getting comfortable with the DOM and async browser APIs.

---

## what it does

- type some text into a textarea
- click copy
- it copies to your clipboard
- shows a counter of how many times you've copied

---

## how to run

no setup needed. just open `index.html` in a browser.

```bash
# if you want a quick local server (optional)
npx serve .
```

---

## what i'm learning

- DOM manipulation — grabbing elements, reading values, updating text
- `navigator.clipboard.writeText()` — async clipboard API, needs to be called in a user gesture (button click), won't work if you just call it on page load
- `async/await` — clipboard API returns a promise, gotta handle it
- basic error handling — clipboard can fail if the page isn't focused or permissions are denied

---

## files

```
Phase 0 // folder
01-ClipboardApp/
└── index.html      ← everything lives here
```

---

## notes / gotchas

- clipboard API only works on HTTPS or localhost — won't work if you just drag the file into a browser from the file system on some setups
- always wrap `clipboard.writeText` in a try/catch, it throws if it fails
- the counter is just a variable in JS, it resets on page refresh — that's fine for this project