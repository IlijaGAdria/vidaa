
const apiKey = "39b67e288d9971a915d12b2034a702ff";
const city = "Belgrade";

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    
    // Time
    const timestamp = data.dt; 
    const date = new Date(timestamp * 1000); 

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Formated date
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const formatted_date = `${day}.${month}. ${weekday}`;


    // Weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weatherIcon").src = iconUrl;

    console.log("Date:", formatted_date);
    console.log("Temperature:", Math.round(data.main.temp), "°C");
    console.log("Time:", time);
  })
  .catch(error => console.error(error));

  // html
  //<script src="weather.jsA"></script>
// <img id="weatherIcon" />