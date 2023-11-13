var queryInput = document.querySelector("#query");
var searchButton = document.querySelector("#searchButton");
var currentWeatherDiv = document.querySelector("#currentWeather");
var forecastDiv = document.querySelector("#forecastContainer");
var currentWeatherContainer = document.querySelector(
  "#currentWeatherContainer"
);
var searchHistoryContainer = document.querySelector("#searchHistory");

var cityNamesSearched = JSON.parse(localStorage.getItem("cityNames")) || [];

function renderSearchedCities() {
  for (let i = 0; i < cityNamesSearched.length; i++) {
    var cityName = cityNamesSearched[i];
    var cityButton = document.createElement("button");
    cityButton.textContent = cityName;
    searchHistoryContainer.append(cityButton);
  }
}

renderSearchedCities();

function appendNewCity(cityName) {
  // check if city name already exists
  if (!cityNamesSearched.includes(cityName)) {
    var cityButton = document.createElement("button");
    cityButton.textContent = cityName;
    searchHistoryContainer.append(cityButton);

    // add city name to array if new
    cityNamesSearched.push(cityName);

    // updated local storage
    localStorage.setItem("cityNames", JSON.stringify(cityNamesSearched));
  }
}

// below 2 functions are for the initial search for city data and for pulling up the old search data from the search history container
function searchCityEvent(event) {
  event.preventDefault();
  var cityName = queryInput.value;
  searchCity(cityName);
}

function searchCity(cityName) {
  // moved to apendNewCity function to avoid dups -
  // cityNamesSearched.push(cityName);

  appendNewCity(cityName);

  // request to pull lat and lon from api first
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=8c906ca7c27b046a144572c31a5b98e0`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (weatherData) {
      var lat = weatherData.coord.lat;
      var lon = weatherData.coord.lon;

      // must change url with temp literals..  typing in the city will pull and log the lon and lat info
      var url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=8c906ca7c27b046a144572c31a5b98e0`;

      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data.city);
          console.log(data.list);

          //   clear previous results
          currentWeatherDiv.innerHTML = "";
          forecastDiv.innerHTML = "";
          currentWeatherContainer.innerHTML = "";
          forecastContainer.innerHTML = "";

          //   Display city name
          var cityTitle = document.createElement("h2");
          cityTitle.textContent = `${data.city.name}`;
          currentWeatherDiv.appendChild(cityTitle);

          // Current Weather
          var currentWeather = data.list[0];
          displayWeather(currentWeather, currentWeatherContainer);

          // 5 day forecast
          // next 5 entries from data
          // data does not go 6 days out like I need. the free api key only goes 5 days out. I did not want to spend money to get an api key that goes 6 days out for a 5 day forecast.
          for (let i = 6; i < data.list.length; i += 6) {
            displayWeather(data.list[i], forecastDiv);
          }
        });
    });
}

function displayWeather(forecast, container) {
  // Loop through forecast data and display icon, temp, humidity, wind speed
  // data.list.forEach(forecast => {
  var forecastDiv = document.createElement("div");
  // convert timestamp to date object
  var date = new Date(forecast.dt * 1000);
  var temperature = forecast.main.temp;
  var windSpeed = forecast.wind.speed;
  var humidity = forecast.main.humidity;
  var description = forecast.weather[0].description;
  var icon = forecast.weather[0].icon;

  // create image element for weather icon
  var iconUrl = `https://openweathermap.org/img/w/${icon}.png`;
  var iconImage = document.createElement("img");
  iconImage.src = iconUrl;
  // set description for image
  iconImage.alt = description;

  var forecastInfo = document.createElement("p");
  forecastInfo.textContent = `Date: ${date.toLocaleDateString()},
    Temperature: ${temperature} F,
    Wind Speed: ${windSpeed} mph,
    Humidity: ${humidity}%,
    Description: ${description}`;

  forecastDiv.appendChild(iconImage);

  forecastDiv.appendChild(forecastInfo);

  container.appendChild(forecastDiv);
}

searchButton.addEventListener("click", searchCityEvent);

// event listener to pull back up city data for a previous search
searchHistoryContainer.addEventListener("click", function (event) {
  event.preventDefault();
  console.log(event.target.textContent);
  searchCity(event.target.textContent);
});

// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
