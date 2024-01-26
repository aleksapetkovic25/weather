let city = 'New York';
let url = `http://api.weatherapi.com/v1/forecast.json?q=${city}&days=5&key=381050d4a9df4425aa793907242201`;

function getLocation() {
    if (navigator.geolocation) {
        if(navigator.geolocation.getCurrentPosition(showPosition)){
            navigator.geolocation.getCurrentPosition(showPosition);
        }
        else{
            getData();
        }
    } else { 
        getData();
    }
}

function showPosition(position) {
    let latLong = position.coords.latitude + ',' + position.coords.longitude;
    url = `http://api.weatherapi.com/v1/forecast.json?q=${latLong}&days=5&key=381050d4a9df4425aa793907242201`;
    getData();
}

getLocation();


function getData(){

    let unit = {
        speed: document.getElementById('speedUnit').checked ? 'mph' : 'kmh',
        temp: document.getElementById('tempUnit').checked ? 'f' : 'c'
    }
        
    fetch(url, {
        method: 'GET',
        mode: 'cors',
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        generateMainData(data.location);
        generateCurrentWeather(data.current, unit);
        generateDailyWeather(data.forecast.forecastday, unit)
        generateHourlyWeather(data.forecast.forecastday, unit)
    })
    .catch(error => {
        console.error('kokoska:', error.message);
    });
}


document.getElementById('searchCity').addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});


function searchWeather(){
    let cityName = document.getElementById("searchCity").value;

    if(cityName.length == 0)return;
    url = `http://api.weatherapi.com/v1/forecast.json?q=${cityName}&days=5&key=381050d4a9df4425aa793907242201`;
    getData();
}

function generateMainData(data){
    document.getElementById('place').innerHTML = `${data.name}, ${data.country}`;
}

function generateCurrentWeather(data, unit){
    let moreInfo = `
            <span><i class="fas fa-wind"></i> ${unit.speed == 'kmh' ? data.wind_kph + 'kmh' : data.wind_mph + 'mph'} |</span>
            <span><i class="fas fa-tint"></i> ${data.precip_mm}%</span>
        `;
    
    document.getElementById('current_temperature').innerHTML = unit.temp == 'c' ? data.temp_c + "&deg;C" : data.temp_f + "&deg;F";
    document.getElementById('current_more-info').innerHTML = moreInfo;
}

function generateDailyWeather(data, unit){
    let html = '';
    let  weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];


    for(let i = 0; i < data.length; i++){
        let item = data[i];

        let temp = unit.temp == 'c' ? item.day.maxtemp_c + '&deg;C' : item.day.maxtemp_f + '&deg;F';
        
        let wind = unit.speed == 'kmh' ? item.day.maxwind_kph + 'kmh' : item.day.maxwind_mph + 'mph'; 

        html += `
        <div class="daily-weather-item_container">
            <span class="day-name">${i == 0 ? 'Today' : weekday[new Date(item.date).getDay()]}</span>
            <img src="${item.day.condition.icon}" />
            <span class="more-info">${temp} &nbsp; | &nbsp; <i class="fas fa-wind"></i> ${wind}</span>
        </div>  
        `;
    }

    document.getElementById('daily_content').innerHTML = html;
}

function generateHourlyWeather(data, unit){
    let html = '';
    let hoursWeatherArr = data[0].hour.concat(data[1].hour);
    
    // ovde zaokruzujem vreme na manji sat, da bih kasnije pri filtriranju sati koje prikazujem uu prognozi prikazao i sadasnji sat
    let currentTime = new Date();
    currentTime.setMinutes(0);
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);
    
    let i = hoursWeatherArr.findIndex(item => {
        return new Date(item.time) >= currentTime;
    });
    // return;
    
    // izlistavamo prognozu po satima za naredna 24h
    let until = i + 24;
    for(i; i < until; i++){
        let item = hoursWeatherArr[i];
        let hour = new Date(item.time).getHours()
        hour = hour < 10 ? '0' + hour : hour;
        html += `
        <div class="swiper-slide">
            <p>${hour}</p>
            <img src="${item.condition.icon}" />
            <p>${unit.temp == 'c' ? item.temp_c + '&deg;C' : item.temp_f + '&deg;F'}</p>
        </div>
        `;
    }

    document.getElementById("hourly-slider").innerHTML = html;
    
    
    let swiper = new Swiper(".hourlySwipper", {
        slidesPerView: 4,
        spaceBetween: 10,
        breakpoints: {
        460: {
            slidesPerView: 5,
            spaceBetween: 40,
        },
        760: {
            slidesPerView: 6,
            spaceBetween: 20,
        },
        1024: {
            slidesPerView: 5,
            spaceBetween: 50,
        },
        },
    });
}


