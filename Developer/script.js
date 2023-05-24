let weatherApiRootUrl = 'https://api.openweathermap.org';
let weatherApiKey = 'e4b6d84d9f08d3010824b8171389a8bb';

function saveSearch() {
  let searchQuery = document.getElementById("search-input").value;

  if (searchQuery !== "") {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];

    if (!searches.includes(searchQuery)) {
      searches.push(searchQuery);
      localStorage.setItem("searches", JSON.stringify(searches));
    }

    document.getElementById("search-input").value = "";
    displaySearches();
    performSearch(searchQuery);
  }
}

function displaySearches() {
  let searches = JSON.parse(localStorage.getItem("searches")) || [];
  let searchHistoryElement = document.getElementById("search-history");

  searchHistoryElement.innerHTML = "";

  searches.forEach(function (search) {
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    let link = document.createElement("a");
    link.textContent = search;
    link.href = "#";
    link.addEventListener("click", function () {
      performSearch(search);
    });
    listItem.appendChild(link);
    searchHistoryElement.appendChild(listItem);
  });
}

function displayCityName(cityName) {
  let cityNameElement = document.getElementById("city-name");
  cityNameElement.textContent = cityName;
}

function performSearch(location) {
  displayCityName(location);
  let currentWeatherUrl = `${weatherApiRootUrl}/data/2.5/weather?q=${location}&appid=${weatherApiKey}`;
  let forecastUrl = `${weatherApiRootUrl}/data/2.5/forecast?q=${location}&appid=${weatherApiKey}`;

  Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
    .then(function (responses) {
      return Promise.all(responses.map(function (response) {
        return response.json();
      }));
    })
    .then(function (data) {
      let currentWeatherData = data[0];
      let forecastData = data[1];
      displayCurrentWeather(currentWeatherData);
      displayForecast(forecastData);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function displayCurrentWeather(weatherData) {
  let temperature = weatherData.main.temp;
  let humidity = weatherData.main.humidity;
  let windSpeed = weatherData.wind.speed * 2.23694; 
  let description = weatherData.weather[0].description;
  let temperatureFahrenheit = Math.round((temperature - 273.15) * (9 / 5) + 32);
  let currentDate = new Date();
  let formattedDate = formatDate(currentDate);

  let currentWeatherInfoElement = document.getElementById("current-weather-info");
  currentWeatherInfoElement.innerHTML = `
    Today: ${formattedDate}<br>
    Temperature: ${temperatureFahrenheit} &#8457;<br>
    Humidity: ${humidity}%<br>
    Wind Speed: ${windSpeed.toFixed(1)} mph<br> 
    Condition: ${description}<br>
    <i class="weather-icon"></i>`;

  let iconElement = document.querySelector(".weather-icon");
  setWeatherIcon(description, iconElement);
}

function setWeatherIcon(description, iconElement) {
  iconElement.className = "weather-icon wi";

  if (description.includes("clear")) {
    iconElement.classList.add("wi-day-sunny");
  } else if (description.includes("cloud")) {
    iconElement.classList.add("wi-cloudy");
  } else if (description.includes("rain")) {
    iconElement.classList.add("wi-rain");
  } else if (description.includes("thunderstorm")) {
    iconElement.classList.add("wi-thunderstorm");
  } else if (description.includes("drizzle")) {
    iconElement.classList.add("wi-showers");
  } else {
    iconElement.classList.add("wi-question");
  }
}

function displayForecast(forecastData) {
  let forecastListElement = document.getElementById("forecast-list");
  forecastListElement.innerHTML = "";

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < forecastData.list.length; i++) {
    let forecastItem = forecastData.list[i];
    let date = new Date(forecastItem.dt * 1000);
    date.setHours(0, 0, 0, 0);

    if (date > currentDate && forecastItem.dt_txt.includes("12:00:00")) {
      let temperature = forecastItem.main.temp;
      let humidity = forecastItem.main.humidity;
      let windSpeed = forecastItem.wind.speed * 2.23694;
      let description = forecastItem.weather[0].description;
      let temperatureFahrenheit = Math.round((temperature - 273.15) * (9 / 5) + 32);

      let listItem = document.createElement("li");
      listItem.className = "forecast-list";

      let dateElement = document.createElement("span");
      dateElement.textContent = formatDate(date);
      listItem.appendChild(dateElement);
      listItem.appendChild(document.createElement("br")); // Add a line break after dateElement

      let temperatureElement = document.createElement("span");
      temperatureElement.innerHTML = `Temperature: ${temperatureFahrenheit} ℉`;
      listItem.appendChild(temperatureElement);
      listItem.appendChild(document.createElement("br")); // Add a line break after temperatureElement

      let humidityElement = document.createElement("span");
      humidityElement.textContent = `Humidity: ${humidity}%`;
      listItem.appendChild(humidityElement);
      listItem.appendChild(document.createElement("br")); // Add a line break after humidityElement

      let windSpeedElement = document.createElement("span");
      windSpeedElement.textContent = `Wind Speed: ${windSpeed.toFixed(1)}mph`;
      listItem.appendChild(windSpeedElement);
      listItem.appendChild(document.createElement("br")); // Add a line break after windSpeedElement

      let descriptionElement = document.createElement("span");
      descriptionElement.textContent = `Condition: ${description}`;
      listItem.appendChild(descriptionElement);
      listItem.appendChild(document.createElement("br")); // Add a line break after descriptionElement

      let iconElement = document.createElement("i");
      iconElement.className = "weather-icon";
      setWeatherIcon(description, iconElement);
      listItem.appendChild(iconElement);

      forecastListElement.appendChild(listItem);
    }
  }
}

function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

document.getElementById("search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  saveSearch();
});

displaySearches();