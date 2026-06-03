let btn = document.getElementById("btn");
let result = document.getElementById("result");



async function render() {
    const city = document.getElementById("input").value.trim();
    if(!city) {
        alert("Please enter a city name");
        return;
    }

    console.log(city);

   

    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`); // return object with lat and long of city
        const data = await res.json(); // convert response to json.
        console.log(data);

        const latitude = data.results[0].latitude;
        const longitude = data.results[0].longitude; 

        const temp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`); 
        const tempData = await temp.json();
        console.log(tempData);

        result.innerHTML = `The weather in ${city} is ${getCondition(tempData.current_weather.weathercode)} with a temperature of ${tempData.current_weather.temperature}°C and wind speed of ${tempData.current_weather.windspeed} km/h.`;
    } catch (err) {
        console.error(err);
    }
}

const input = document.getElementById("input");

btn.addEventListener("click", render);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        render();
    }
});

function getCondition(code) {
  if (code === 0) return 'clear sky'
  if (code <= 2) return 'partly cloudy'
  if (code <= 3) return 'overcast'
  if (code <= 48) return 'foggy'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'showers'
  if (code <= 99) return 'thunderstorm'
  return 'unknown'
}




