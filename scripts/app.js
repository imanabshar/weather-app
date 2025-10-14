import { weatherIcons } from "./weatherIcons.js";

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const weatherContainer = document.querySelector('.weather-container');
const cityName = document.querySelector('.city-name');
const weatherCondition = document.querySelector('.weather-condition');
const dateDisplay = document.querySelector('#date');
const timeDisplay = document.querySelector('#time');
const weatherIcon = document.querySelector('.weather-icon');
const temperatureDisplay = document.querySelector('.temperature-display');
const feelsLikeDisplay = document.querySelector('#feels');
const humidityDisplay = document.querySelector('#humidity');
const windDisplay = document.querySelector('#wind');
const errorMessage = document.querySelector('.error-message');
const loading = document.querySelector('.loading');
const weatherForecast = document.querySelector('.weatherForecast-container');
const forecastGrid = document.querySelector('.forecast-grid');
const unitButton = document.querySelector('.unit-button');

const apiKey = 'PDRKKDZV8PMJHWX2LXY4KRVGS';
let city;
let unit = 'metric';

updateWeather();
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateWeather();
});

unitButton.addEventListener('click', () => {
    const celsius = document.querySelector('.celsius');
    const farenheit = document.querySelector('.farenheit');
    if (unit === 'metric') {
        unit = 'us';
    }
    else if (unit == 'us') {
        unit = 'metric';
    }
    celsius.classList.toggle('active');
    farenheit.classList.toggle('active');
    updateWeather();
});

async function getWeatherData(lat, long) {
    let url = ''
    if (lat && long) {
        url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}?unitGroup=${unit}&key=${apiKey}`
    }
    else {
        url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unit}&key=${apiKey}`;

    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("The weather data for the city you entered isn't availaible");
        }
        errorMessage.style.display = 'none';
        weatherContainer.style.display = 'block';
        weatherForecast.style.display = 'block';
        return response.json();
    }
    catch (error) {
        weatherContainer.style.display = 'none';
        weatherForecast.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.innerText = error.message;
    }
}

function displayWeather(data, city) {
    //data based on coordinates gives resolvedAdress as long and lat 
    //TODO: set the coordinates to readable city name before displaying 
    if (city) {
        cityName.innerText = data.resolvedAddress;
    }

    weatherCondition.innerText = data.currentConditions.conditions;
    if (unit === 'metric') {
        temperatureDisplay.innerHTML = `${data.currentConditions.temp} &deg;C`;
    }
    else {
        temperatureDisplay.innerHTML = `${data.currentConditions.temp} &deg;F`;
    }
    dateDisplay.innerText = getDate(data.currentConditions);
    timeDisplay.innerText = getTime(data);
    weatherIcon.src = getWeatherIcon(data.currentConditions);
    getDetails(data);
    getWeatherForecast(data);
}

function getDate(data, includeDay = false) {
    const date = new Date(data.datetimeEpoch * 1000);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[monthIndex];
    const formattedDate = `${day},${month}`;

    if (includeDay) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = days[date.getDay()];
        return `${day} ${month}, ${dayName}`;
    }

    return formattedDate;
}

function getTime(data) {
    const date = new Date(data.currentConditions.datetimeEpoch * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const timePeriod = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${timePeriod}`;
}

function getWeatherIcon(data) {
    const icon = data.icon;
    return weatherIcons[icon] || './icons/cloudy.svg';
}

function getDetails(data) {
    feelsLikeDisplay.innerHTML = `${data.currentConditions.feelslike} &deg;C`;
    humidityDisplay.innerText = `${data.currentConditions.humidity} %`;
    windDisplay.innerText = `${data.currentConditions.windspeed} km/h`;
}

function getWeatherForecast(data) {

    let forecastHTML = '';

    for (let i = 0; i <= 6; i++) {
        const day = data.days[i];
        const temp = day.temp;
        const date = getDate(day, true);
        const icon = getWeatherIcon(day);
        forecastHTML +=
            `<div class=forecast-box>
           <h3>${date}</h3>
           <img src="${icon}"/>
           <p>${temp}</p>
       </div>`
    }
    forecastGrid.innerHTML = forecastHTML;
}

async function updateWeather() {
    city = searchInput.value.trim();

    loading.style.display = 'block';
    weatherContainer.style.display = 'none';
    errorMessage.style.display = 'none'
    weatherForecast.style.display = 'none';

    let data = '';

    //If search for specific city then for that city data will be shown
    if (city) {
        data = await getWeatherData();

    } 
    else { //Initially the weather data of one's location will be shown by fetching the location
        data = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lon = position.coords.longitude.toFixed(4);
                    const weather = await getWeatherData(lat, lon);
                    resolve(weather);
                },
                (error) => {
                    //If any error occurs or location access is denied then default city will be Karachi
                    city = 'Karachi';
                    getWeatherData().then(resolve).catch(reject);
                }
            );
        });
    }

    loading.style.display = 'none';

    if (!data) return;
    displayWeather(data, city);
}

