let weatherApiRootUrl = 'https://api.openweathermap.org';
let weatherApiKey ='e4b6d84d9f08d3010824b8171389a8bb';

function saveSearch() {
  let searchQuery = document.getElementById("search-input").value;

  if (searchQuery !== "") {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];
    searches.push(searchQuery);
    localStorage.setItem("searches", JSON.stringify(searches));
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
  let description = weatherData.weather[0].description;
  let temperatureFahrenheit = Math.round((temperature - 273.15) * (9 / 5) + 32);

  let currentWeatherInfoElement = document.getElementById("current-weather-info");
  currentWeatherInfoElement.innerHTML = `<br>Temperature: ${temperatureFahrenheit} &#8457;<br>Description: ${description}`;
}

function displayForecast(forecastData) {
  let forecastListElement = document.getElementById("forecast-list");
  forecastListElement.innerHTML = "";

  for (let i = 0; i < forecastData.list.length; i += 8) {
    let forecastItem = forecastData.list[i];
    let temperature = forecastItem.main.temp;
    let description = forecastItem.weather[0].description;
    let temperatureFahrenheit = Math.round((temperature - 273.15) * (9/5) + 32);

    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.innerHTML = `Temperature: ${temperatureFahrenheit} &#8457;<br>Description: ${description}`;

    forecastListElement.appendChild(listItem);
  }
}

document.getElementById("search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  saveSearch();
});

displaySearches();