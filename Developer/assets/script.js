// API Rules
let weatherApiRootUrl = 'https://api.openweathermap.org';
let weatherApiKey = 'e4b6d84d9f08d3010824b8171389a8bb';

// Search history

function saveSearch() {
  let searchQuery = document.getElementById("search-input").value;

  if (searchQuery !== "") {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];

    if (!searches.some(search => search.query === searchQuery)) {
      searches.push({ query: searchQuery, timestamp: Date.now() });
      localStorage.setItem("searches", JSON.stringify(searches));
    }

    document.getElementById("search-input").value = "";
    performSearch(searchQuery);
    displaySearches(); // Move the displaySearches() function call here
  }
}

$(document).on("click", function(event) {
  var target = $(event.target);
  var searchInput = $("#search-input");
  

// Check if the clicked element is outside of the search bar and the search history
$(document).on("click", function(event) {
  var target = $(event.target);
  var searchInput = $("#search-input");
  var searchHistory = $(".history");

  if (!target.is(searchInput) && !target.closest(".history").length) {
    searchHistory.hide();
  } else {
    searchHistory.show();
  }
})
});

// Displays previous searches, links, and prevents repetitive histories
function displaySearches() {
  let searches = JSON.parse(localStorage.getItem("searches")) || [];
  let searchHistoryElement = document.getElementById("search-history");

  searchHistoryElement.innerHTML = "";

  // Sort the searches array in reverse order to get the most recent searches first
  searches.sort((a, b) => b.timestamp - a.timestamp);

  // Iterate over the first 3 searches or the total number of searches if less than 3
  for (let i = 0; i < Math.min(searches.length, 3); i++) {
    let search = searches[i];
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    let link = document.createElement("a");
    link.textContent = search.query;
    link.href = "#";
    link.addEventListener("click", function() {
      performSearch(search.query);
    });
    listItem.appendChild(link);
    searchHistoryElement.appendChild(listItem);
  }
}



// Displays the city name with its current weather data

function displayCityName(cityName) {
  let lowercaseCityName = cityName.toLowerCase();
  let words = lowercaseCityName.split(" ");
  let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  let formattedCityName = capitalizedWords.join(" ");
  let cityNameElement = document.getElementById("city-name");
  cityNameElement.textContent = formattedCityName;
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

// Formats the weather data

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
    <i class="weather-icon"></i><br>
    Temperature: ${temperatureFahrenheit} &#8457;<br>
    Humidity: ${humidity}%<br>
    Wind Speed: ${windSpeed.toFixed(1)} mph<br> 
    Condition: ${description}<br>`;

  // Calling the weather icon inside the function to show on the forecast

  let iconElement = document.querySelector(".weather-icon");
  setWeatherIcon(description, iconElement);
}

// Sets weather icon depending on the weather conditions

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

// Forecast function shows 5 days of future weather

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
      dateElement.classList.add("date"); 
      listItem.appendChild(dateElement);
      listItem.appendChild(document.createElement("br"));

      let iconElement = document.createElement("i");
      iconElement.className = "weather-icon";
      setWeatherIcon(description, iconElement);
      listItem.appendChild(iconElement);

      let temperatureElement = document.createElement("span");
      temperatureElement.innerHTML = `Temperature: ${temperatureFahrenheit} ℉`;
      listItem.appendChild(temperatureElement);
      listItem.appendChild(document.createElement("br")); 

      let humidityElement = document.createElement("span");
      humidityElement.textContent = `Humidity: ${humidity}%`;
      listItem.appendChild(humidityElement);
      listItem.appendChild(document.createElement("br")); 

      let windSpeedElement = document.createElement("span");
      windSpeedElement.textContent = `Wind Speed: ${windSpeed.toFixed(1)}mph`;
      listItem.appendChild(windSpeedElement);
      listItem.appendChild(document.createElement("br")); 

      let descriptionElement = document.createElement("span");
      descriptionElement.textContent = `Condition: ${description}`;
      listItem.appendChild(descriptionElement);
      listItem.appendChild(document.createElement("br")); 

      forecastListElement.appendChild(listItem);
    }
  }
}

// Shows dates formatted to month and day displays

function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

document.getElementById("search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  saveSearch();
});

displaySearches();


