// API Rules
let weatherApiRootUrl = 'https://api.openweathermap.org';
let weatherApiKey = 'e4b6d84d9f08d3010824b8171389a8bb';

// Search history
let isSearchHistoryVisible = false;

// Add a click event listener to the document
document.addEventListener('click', function(event) {
  if (isSearchHistoryVisible) {
    const searchHistory = document.getElementById('search-history');
    const searchInput = document.getElementById('search-input');

    if (event.target !== searchHistory && event.target !== searchInput) {
      // If the search history is visible and the click is outside search bar or history, hide the history.
      hideSearchHistory();
    }
  }
});

function saveSearch() {
  let searchQuery = document.getElementById('search-input').value;

  if (searchQuery !== '') {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];

    if (!searches.includes(searchQuery)) {
      searches.push(searchQuery);
      localStorage.setItem('searches', JSON.stringify(searches));
    }

    document.getElementById('search-input').value = '';
    performSearch(searchQuery);

    if (isSearchHistoryVisible) {
      hideSearchHistory(); // Hide search history if it's visible
    } else {
      showSearchHistory(); // Show search history if it's not visible
    }
  }
}

// Function to hide the search history
function hideSearchHistory() {
  let searchHistory = document.getElementById('search-history');
  searchHistory.style.display = 'none';
  isSearchHistoryVisible = false;
}

// Function to show the search history
function showSearchHistory() {
  let searchHistory = document.getElementById('search-history');
  searchHistory.style.display = 'block';
  isSearchHistoryVisible = true;
}




// Event listener for the search input focus to display the search history
document.getElementById('search-input').addEventListener('focus', function () {
  isSearchHistoryVisible = true;
  displaySearches(); // Display recent searches when the search input is focused
});

// Event listener for clicks on the entire document to hide the search history
document.addEventListener('click', function (event) {
  var target = event.target;
  var searchInput = document.getElementById('search-input');
  var searchHistory = document.getElementById('search-history');

  if (target !== searchInput && !searchHistory.contains(target)) {
    hideSearchHistory();
  }
});

// Displays previous searches as clickable links
function displaySearches() {
  if (isSearchHistoryVisible) {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    let searchHistoryElement = document.getElementById('search-history');

    searchHistoryElement.innerHTML = '';

    // Create a Set to store unique search queries
    let uniqueSearches = new Set();

    // Iterate over searches in reverse order to get the most recent ones
    for (let i = searches.length - 1; i >= 0; i--) {
      let search = searches[i];

      // Check if the search is unique and not already in the Set
      if (!uniqueSearches.has(search)) {
        uniqueSearches.add(search);

        // Create the list item and link
        let listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        let link = document.createElement('a');
        link.textContent = search;
        link.href = 'javascript:void(0)'; // Prevent default link behavior
        link.addEventListener('click', function (event) {
          event.preventDefault(); // Prevent default link behavior
          performSearch(search);
        });
        listItem.appendChild(link);
        searchHistoryElement.appendChild(listItem);

        // If you've displayed three unique searches, break the loop
        if (uniqueSearches.size === 3) {
          break;
        }
      }
    }
  }
}

// Displays the city name with its current weather data
function displayCityName(cityName) {
  // Split the city name by spaces
  let words = cityName.split(' ');
  
  // Capitalize the first letter of each word
  let capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );

  // Join the words back together with spaces
  let formattedCityName = capitalizedWords.join(' ');

  let cityNameElement = document.getElementById('city-name');
  cityNameElement.textContent = formattedCityName;
}


function performSearch(location) {
  displayCityName(location);
  let currentWeatherUrl = `${weatherApiRootUrl}/data/2.5/weather?q=${location}&appid=${weatherApiKey}`;
  let forecastUrl = `${weatherApiRootUrl}/data/2.5/forecast?q=${location}&appid=${weatherApiKey}`;

  Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
    .then(function (responses) {
      return Promise.all(
        responses.map(function (response) {
          if (!response.ok) {
            throw new Error('Not Found'); // Handle "Not Found" error
          }
          return response.json();
        })
      );
    })
    .then(function (data) {
      let currentWeatherData = data[0];
      let forecastData = data[1];
      displayCurrentWeather(currentWeatherData);
      displayForecast(forecastData);
      hideSearchHistory(); // Hide search history after a search is completed
    })
    .catch(function (error) {
      if (error.message === 'Not Found') {
        displayNotFoundError(); // Display "Not Found" message
      } else {
        console.log(error);
      }
    });
}

function displayNotFoundError() {
  let currentWeatherInfoElement = document.getElementById('current-weather-info');
  currentWeatherInfoElement.innerHTML =
    'Location not found. Please try a different search.';
  let forecastListElement = document.getElementById('forecast-list');
  forecastListElement.innerHTML = '';
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

  let currentWeatherInfoElement = document.getElementById('current-weather-info');
  currentWeatherInfoElement.innerHTML = `
    <p class= "TodayDate">Today: ${formattedDate}</p><br>
    <i class="weather-icon"></i><br>
    Temperature: ${temperatureFahrenheit} &#8457;<br>
    Humidity: ${humidity}%<br>
    Wind Speed: ${windSpeed.toFixed(1)} mph<br> 
    Condition: ${description}<br>`;

  // Calling the weather icon inside the function to show on the forecast
  let iconElement = document.querySelector('.weather-icon');
  setWeatherIcon(description, iconElement);
}

// Sets weather icon depending on the weather conditions
function setWeatherIcon(description, iconElement) {
  iconElement.className = 'weather-icon wi';

  if (description.includes('clear')) {
    iconElement.classList.add('wi-day-sunny');
  } else if (description.includes('cloud')) {
    iconElement.classList.add('wi-cloudy');
  } else if (description.includes('rain')) {
    iconElement.classList.add('wi-rain');
  } else if (description.includes('thunderstorm')) {
    iconElement.classList.add('wi-thunderstorm');
  } else if (description.includes('drizzle')) {
    iconElement.classList.add('wi-showers');
  } else {
    iconElement.classList.add('wi-question');
  }
}

// Forecast function shows 5 days of future weather
function displayForecast(forecastData) {
  let forecastListElement = document.getElementById('forecast-list');
  forecastListElement.innerHTML = '';

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < forecastData.list.length; i++) {
    let forecastItem = forecastData.list[i];
    let date = new Date(forecastItem.dt * 1000);
    date.setHours(0, 0, 0, 0);

    if (date > currentDate && forecastItem.dt_txt.includes('12:00:00')) {
      let temperature = forecastItem.main.temp;
      let humidity = forecastItem.main.humidity;
      let windSpeed = forecastItem.wind.speed * 2.23694;
      let description = forecastItem.weather[0].description;
      let temperatureFahrenheit = Math.round((temperature - 273.15) * (9 / 5) + 32);

      let listItem = document.createElement('li');
      listItem.className = 'forecast-list';

      let dateElement = document.createElement('span');
      dateElement.textContent = formatDate(date);
      dateElement.classList.add('date');
      listItem.appendChild(dateElement);
      listItem.appendChild(document.createElement('br'));

      let iconElement = document.createElement('i');
      iconElement.className = 'weather-icon';
      setWeatherIcon(description, iconElement);
      listItem.appendChild(iconElement);

      let temperatureElement = document.createElement('span');
      temperatureElement.innerHTML = `Temperature: ${temperatureFahrenheit} ℉`;
      listItem.appendChild(temperatureElement);
      listItem.appendChild(document.createElement('br'));

      let humidityElement = document.createElement('span');
      humidityElement.textContent = `Humidity: ${humidity}%`;
      listItem.appendChild(humidityElement);
      listItem.appendChild(document.createElement('br'));

      let windSpeedElement = document.createElement('span');
      windSpeedElement.textContent = `Wind Speed: ${windSpeed.toFixed(1)}mph`;
      listItem.appendChild(windSpeedElement);
      listItem.appendChild(document.createElement('br'));

      let descriptionElement = document.createElement('span');
      descriptionElement.textContent = `Condition: ${description}`;
      listItem.appendChild(descriptionElement);
      listItem.appendChild(document.createElement('br'));

      forecastListElement.appendChild(listItem);
    }
  }
}

// Shows dates formatted to month and day displays
function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();
  saveSearch();
  hideSearchHistory(); // Hide the search history after submitting the search
});

displaySearches();