const API_KEY = '46bca850aa5fc605ad0cc96ffa9fa992';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

const elements = {
    cityName: document.getElementById('cityName'),
    countryCode: document.getElementById('countryCode'),
    dateTime: document.getElementById('dateTime'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),
    weatherIcon: document.getElementById('weatherIcon'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    clouds: document.getElementById('clouds'),
    uvIndex: document.getElementById('uvIndex'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset')
};

document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity') || 'London';
    getWeatherByCity(lastCity);
    
    setInterval(updateDateTime, 1000);
});

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
locationBtn.addEventListener('click', getLocationWeather);

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
}

async function getWeatherByCity(city) {
    try {
        showLoading();
        hideError();
        
              const weatherResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const weatherData = await weatherResponse.json();
        
        
        const uvResponse = await fetch(
            `${BASE_URL}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
        );
        const uvData = await uvResponse.json();
        
              displayWeather(weatherData, uvData.value);
        
        
        localStorage.setItem('lastCity', city);
        cityInput.value = '';
        
    } catch (error) {
        showError(error.message === 'City not found' 
            ? `City "${city}" not found. Please check the spelling.` 
            : 'Failed to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                showLoading();
                hideError();
                
                const { latitude, longitude } = position.coords;
                
                // Get weather data
                const weatherResponse = await fetch(
                    `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                
                if (!weatherResponse.ok) {
                    throw new Error('Failed to fetch weather data');
                }
                
                const weatherData = await weatherResponse.json();
                
                // Get UV Index
                const uvResponse = await fetch(
                    `${BASE_URL}/uvi?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
                );
                const uvData = await uvResponse.json();
                
                displayWeather(weatherData, uvData.value);
                
            } catch (error) {
                showError('Failed to fetch weather data for your location');
            } finally {
                hideLoading();
            }
        },
        (error) => {
            showError('Unable to access your location. Please enable location services.');
        }
    );
}

// Display Weather Data
function displayWeather(data, uvIndex = 0) {
    // Main weather info
    elements.cityName.textContent = data.name;
    elements.countryCode.textContent = data.sys.country;
    elements.temperature.textContent = Math.round(data.main.temp);
    elements.weatherDescription.textContent = data.weather[0].description;
    elements.feelsLike.textContent = Math.round(data.main.feels_like);
    
      const iconCode = data.weather[0].icon;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    elements.weatherIcon.alt = data.weather[0].description;
    
    
    elements.windSpeed.textContent = data.wind.speed.toFixed(1);
    elements.humidity.textContent = data.main.humidity;
    elements.pressure.textContent = data.main.pressure;
    elements.visibility.textContent = (data.visibility / 1000).toFixed(1);
    elements.clouds.textContent = data.clouds.all;
    elements.uvIndex.textContent = uvIndex.toFixed(1);
    
       elements.sunrise.textContent = formatTime(data.sys.sunrise);
    elements.sunset.textContent = formatTime(data.sys.sunset);
    
   
    updateBackground(data.weather[0].main);
    
    
    weatherDisplay.classList.add('show');
}


function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    if (elements.dateTime) {
        elements.dateTime.textContent = now.toLocaleDateString('en-US', options);
    }
}

function updateBackground(weatherMain) {
    const backgrounds = {
        'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Clouds': 'linear-gradient(135deg, #636363 0%, #a2ab58 100%)',
        'Rain': 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)',
        'Drizzle': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        'Thunderstorm': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        'Snow': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',
        'Mist': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
        'Smoke': 'linear-gradient(135deg, #56514e 0%, #2b2826 100%)',
        'Haze': 'linear-gradient(135deg, #d3959b 0%, #bfe6ba 100%)',
        'Dust': 'linear-gradient(135deg, #d19a3d 0%, #5a4e3c 100%)',
        'Fog': 'linear-gradient(135deg, #a8a8a8 0%, #5f5f5f 100%)',
        'Sand': 'linear-gradient(135deg, #e4a853 0%, #b08d4f 100%)',
        'Ash': 'linear-gradient(135deg, #606060 0%, #3e3e3e 100%)',
        'Squall': 'linear-gradient(135deg, #4b79a1 0%, #283e51 100%)',
        'Tornado': 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)'
    };
    
    document.body.style.background = backgrounds[weatherMain] || backgrounds['Clear'];
}

// Show/Hide Loading
function showLoading() {
    loading.classList.add('show');
    weatherDisplay.classList.remove('show');
}

function hideLoading() {
    loading.classList.remove('show');
}

// Show/Hide Error
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    weatherDisplay.classList.remove('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

function hideError() {
    errorDiv.classList.remove('show');
}

