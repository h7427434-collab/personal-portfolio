const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const forecast = document.getElementById("forecast");
const errorMessage = document.getElementById("errorMessage");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});

async function getWeather() {
  const city = cityInput.value.trim();

  errorMessage.textContent = "";
  weatherResult.innerHTML = "";
  forecast.innerHTML = "";

  if (!city) {
    errorMessage.textContent = "Please enter a city name.";
    return;
  }

  try {
    // Find the city's latitude and longitude
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error("City not found.");
    }

    const location = locationData.results[0];
    const latitude = location.latitude;
    const longitude = location.longitude;

    // Get current weather and 5-day forecast
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
    );

    const weatherData = await weatherResponse.json();

    displayWeather(location, weatherData);
    displayForecast(weatherData);

  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

function displayWeather(location, data) {
  const temperature = Math.round(data.current.temperature_2m);
  const windSpeed = Math.round(data.current.wind_speed_10m);

  weatherResult.innerHTML = `
    <div class="weather-card">
      <h2>${location.name}, ${location.country}</h2>
      <div class="temperature">${temperature}°C</div>
      <p>💨 Wind: ${windSpeed} km/h</p>
      <p>${getWeatherDescription(data.current.weather_code)}</p>
    </div>
  `;
}

function displayForecast(data) {
  forecast.innerHTML = "<h2>5-Day Forecast</h2>";

  data.daily.time.forEach((date, index) => {
    const maxTemp = Math.round(data.daily.temperature_2m_max[index]);
    const minTemp = Math.round(data.daily.temperature_2m_min[index]);
    const description = getWeatherDescription(data.daily.weather_code[index]);

    forecast.innerHTML += `
      <div class="forecast-card">
        <strong>${formatDate(date)}</strong>
        <p>${description}</p>
        <p>🌡️ ${maxTemp}°C / ${minTemp}°C</p>
      </div>
    `;
  });
}

function formatDate(date) {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric"
  };

  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    options
  );
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "☀️ Clear sky",
    1: "🌤️ Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Foggy",
    48: "🌫️ Depositing rime fog",
    51: "🌦️ Light drizzle",
    53: "🌦️ Moderate drizzle",
    55: "🌧️ Dense drizzle",
    61: "🌧️ Light rain",
    63: "🌧️ Moderate rain",
    65: "🌧️ Heavy rain",
    71: "🌨️ Light snow",
    73: "🌨️ Moderate snow",
    75: "❄️ Heavy snow",
    80: "🌦️ Light rain showers",
    81: "🌧️ Moderate rain showers",
    82: "⛈️ Heavy rain showers",
    95: "⛈️ Thunderstorm"
  };

  return weatherCodes[code] || "🌤️ Unknown weather";
}
