const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const cityName = document.querySelector('.city-name');
const weatherCondition = document.querySelector('.weather-condition');
const dateDisplay = document.querySelector('#date');
const timeDisplay = document.querySelector('#time');
const temperatureDisplay = document.querySelector('.temperature-display');
const feelsLikeDisplay = document.querySelector('#feels');
const humidityDisplay = document.querySelector('#humidity');
const windDisplay = document.querySelector('#wind');


const apiKey = 'PDRKKDZV8PMJHWX2LXY4KRVGS';
let city;

updateWeather();
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    updateWeather();
});

async function getWeatherData(city) {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}`);
    return response.json();
}

function displayWeather(data) {
    cityName.innerText = data.resolvedAddress;
    weatherCondition.innerText = data.currentConditions.conditions;
    temperatureDisplay.innerText = `${data.currentConditions.temp} &deg;C`;
    dateDisplay.innerText = getDate(data);
    timeDisplay.innerText = getTime(data);
    getDetails(data);
}

function getDate(data) {
    const date = new Date(data.currentConditions.datetimeEpoch * 1000);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[monthIndex];
    const formattedDate = `${day}${month}`;
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

function getDetails(data){
    feelsLikeDisplay.innerText = `${data.currentConditions.feelslike} &deg;C`;
    humidityDisplay.innerText = `${data.currentConditions.humidity} %`;
    windDisplay.innerText = `${data.currentConditions.windspeed} km/h`;
}

async function updateWeather() {
    city = searchInput.value.trim() || 'Karachi'; //by default weather details of Karachi will be shown
    const data = await getWeatherData(city);
    console.log(data);
    displayWeather(data);
}


