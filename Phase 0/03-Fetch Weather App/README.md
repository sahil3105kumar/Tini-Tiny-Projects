# P0-03 — FetchWeatherApp

fetches real weather data from an external API based on a city name. first time making network requests and dealing with async data i don't control.

---

## what it does

- type a city name, hit search or press Enter
- fetches coordinates from Open-Meteo's geocoding API
- uses those coordinates to fetch current weather
- displays temperature, wind speed, and condition

---

## how to run

just open `index.html` in a browser. no setup needed.

---

## apis used

- geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=1`
- weather: `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current_weather=true`

both are free, no api key needed.

---

## what i learned

**two requests chained together** — open-meteo only accepts coordinates, not city names. so i had to hit the geocoding api first to get lat/lng, then use those to hit the weather api. can't do the second without the first.

**async/await** — the whole app depends on it. `await` pauses execution at that line until the response comes back. without it, you get a Promise object instead of actual data and everything breaks silently.

**always read `.value` inside the event handler** — not outside. reading it on page load gives you an empty string every time.

**keypress fires on every key** — had to check `e.key === "Enter"` explicitly, otherwise the api gets called on every keystroke.

**`current_weather=true` vs `hourly`** — started with `hourly=temperature_2m` which gives a forecast array. `temperature_2m[0]` is just the first hour, not the current temp. switched to `current_weather=true` which gives actual current conditions directly.

**weather codes are just numbers** — the api returns a `weathercode` like `0` or `61`. built a `getCondition()` function with if/else ranges to convert them to readable text.

---

## bugs i hit

**city input shadowed by event parameter** — named the event listener parameter `city` which overwrote the outer variable. the console was logging a MouseEvent object instead of the city string. fixed by naming the parameter `e` and reading `.value` inside the handler.

**`const` inside try block** — tried to declare `latitude` and `longitude` as `const` then reassign them. `const` can't be reassigned. fixed by using `let`, then later simplified to one try/catch block so the split wasn't needed anyway.

---

## files

```
Phase0
├── 03-FetchWeatherApp/
    ├── index.html
    ├── index.css
    └── index.js
```