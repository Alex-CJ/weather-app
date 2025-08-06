import { useState, useCallback, useEffect } from "react";
import "./Weather.css";
import clearIcon from "/assets/clear.png";
import cloudIcon from "/assets/cloud.png";
import drizzleIcon from "/assets/drizzle.png";
import humidityIcon from "/assets/humidity.png";
import rainIcon from "/assets/rain.png";
import searchIcon from "/assets/search.png";
import snowIcon from "/assets/snow.png";
import windIcon from "/assets/wind.png";

const allIcons = {
  "01d": clearIcon,
  "01n": clearIcon,
  "02d": cloudIcon,
  "02n": cloudIcon,
  "03d": cloudIcon,
  "03n": cloudIcon,
  "04d": drizzleIcon,
  "04n": drizzleIcon,
  "09d": rainIcon,
  "09n": rainIcon,
  "10d": clearIcon,
  "10n": clearIcon,
  "13d": snowIcon,
  "13n": snowIcon,
};

interface WeatherDataTypes {
  humidity: number;
  windSpeed: number;
  temperature: number;
  location: string | null;
  icon: string;
  feelsLike: number;
}

interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: keyof typeof allIcons;
    }
  ];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export default function Weather() {
  const cities = [
    { name: "London" },
    { name: "Chișinău" },
    { name: "Bucharest" },
    { name: "New York", searching: true },
  ];

  return (
    <div className="weather-grid">
      {cities.map(({ name, searching }) => (
        <WeatherDisplay key={name} city={name} searching={searching} />
      ))}
    </div>
  );
}

interface WeatherDisplayTypes {
  city: string;
  searching?: boolean;
}

export function WeatherDisplay({
  city,
  searching = false,
}: WeatherDisplayTypes) {
  const [weatherData, setWeatherData] = useState<WeatherDataTypes>({
    humidity: 0,
    windSpeed: 0,
    temperature: 0,
    location: null,
    icon: clearIcon,
    feelsLike: 0,
  });

  const search = useCallback(async (fetchCity: string): Promise<void> => {
    if (fetchCity === "") {
      alert("Enter City Name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${fetchCity}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;

      const response: Response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const _data = data as WeatherData;
      const icon = allIcons[_data.weather[0].icon] || clearIcon;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
        feelsLike: data.main.feels_like,
      });
    } catch (error) {
      console.log("Error in changing data", error);
    }
  }, []);

  useEffect(() => {
    search(city);
  }, [city, search]);

  return (
    <div className="weather">
      {searching ? <SearchBar search={search} /> : null}
      <img
        src={weatherData.icon}
        alt=""
        className="weather-icon"
        width={150}
        height={150}
        style={{ ...(!searching && { marginTop: "auto" }) }}
      />
      <p className="temperature">
        {weatherData ? weatherData.temperature : "--"}°C
      </p>
      <p className="feelsLike">
        Feels like {weatherData ? weatherData.feelsLike : "--"}°C
      </p>
      <p className="location">{weatherData.location ?? "Unknown"}</p>
      <div className="weather-data">
        <div className="col">
          <img src={humidityIcon} alt="" width={26} height={22} />
          <div>
            <p> {weatherData.humidity}%</p>
            <span>Humidity</span>
          </div>
        </div>

        <div className="col">
          <img src={windIcon} alt="" width={26} height={24} />
          <div>
            <p> {weatherData.windSpeed} Km/h</p>
            <span>Wind Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SearchBarTypes {
  search: (city: string) => Promise<void>;
}
export function SearchBar({ search }: SearchBarTypes) {
  const [inputValue, setInputValue] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("geolocation not supported");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;

        try {
          const response: Response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${
              import.meta.env.VITE_GEO_API_KEY
            }`
          );
          const data = await response.json();
          console.log("data", data);
          const components = data.results[0].components;
          console.log(components);

          const cityName: string = components.city;

          console.log(cityName);
          search(cityName);
        } catch (error) {
          console.log("Geolocation error:", error);
        }
      },
      (error) => {
        console.log("Geolocation error:", error);
      }
    );
  }, [search]);

  return (
    <div className="search-bar">
      <input
        value={inputValue}
        type="text"
        placeholder="Search"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") search(inputValue);
        }}
      />
      <img
        src={searchIcon}
        alt=""
        onClick={() => search(inputValue)}
        width={50}
        height={50}
      />
    </div>
  );
}
