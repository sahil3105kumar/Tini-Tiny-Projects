# P0-02 — LocalTodoList

todo app with filters and localStorage persistence. first time managing state as an array and syncing it to the DOM.

---

## what it does

- add tasks, delete them, mark them done by clicking
- filter by all / active / completed
- survives a page refresh — everything saves to localStorage

---

## how to run

just open `index.html` in a browser. no setup needed.

---

## what i learned

**single source of truth** — everything revolves around one `tasks` array. the DOM is just a reflection of it. never edit the DOM directly to change state — edit the array, then redraw.

**the cycle** — every user action follows the same loop:
```
update tasks → save() → render()
```
always in that order, no exceptions.

**localStorage only stores strings** — so you have to `JSON.stringify` before saving and `JSON.parse` when reading back. and always validate what comes back — if the stored value is corrupted, `JSON.parse` gives you garbage and `Array.isArray()` is the only reliable check.

**filter vs map for updates** — never mutate the array directly. use `filter` to remove items and `map` to update them. both return a new array which replaces the old one.

**e.stopPropagation()** — the delete button sits inside the `<li>` which also has a click listener. without stopping propagation, clicking delete bubbles up and toggles done before deleting. always think about event bubbling when nesting clickable elements.

**filter state is just a string** — `'all'`, `'active'`, `'completed'`. changing the filter doesn't touch the tasks array at all, just rerenders with a different subset.

---

## bug i hit

`tasks.push is not a function` in firefox — localStorage had leftover junk from a previous session that broke `JSON.parse`. fixed by clearing localStorage and making the parser defensive:

```js
function loadTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem('tasks'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
```

lesson: when something works in one place but not another, check the environment first (storage, cache, origin) before blaming the code.

---

## files

```
P0-02-LocalTodoList/
└── index.html
```