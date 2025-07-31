import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./weather.css";
import clearIcon from "../assets/clear.png";
import cloudIcon from "../assets/cloud.png";
import drizzleIcon from "../assets/drizzle.png";
import humidityIcon from "../assets/humidity.png";
import rainIcon from "../assets/rain.png";
import searchIcon from "../assets/search.png";
import snowIcon from "../assets/snow.png";
import windIcon from "../assets/wind.png";

interface WeatherDataTypes {
  humidity: number;
  windSpeed: number;
  temperature: number;
  location: string;
  icon: string;
}
// interface WeatherDataAPITypes{

// }
const Weather: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [weatherData, setWeatherData] = useState<WeatherDataTypes | null>({
    humidity: 0,
    windSpeed: 0,
    temperature: 0,
    location: "",
    icon: clearIcon,
  });

  const allIcons = useMemo<Record<string, string>>(
    () => ({
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
    }),
    []
  );

  const search = useCallback(
    async (city: string): Promise<void> => {
      if (city === "") {
        alert("Enter City Name");
        return;
      }
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
          import.meta.env.VITE_APP_ID
        }`;

        const response: Response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        console.log(data);
        const icon = allIcons[data.weather[0].icon] || clearIcon;
        setWeatherData({
          humidity: Number(data.main.humidity),
          windSpeed: Number(data.wind.speed),
          temperature: Math.floor(data.main.temp),
          location: data.name,
          icon: icon,
        });
      } catch (error) {
        setWeatherData(null);
        console.error("Error in changing data", error);
      }
    },
    [allIcons]
  );

  useEffect(() => {
    search("London");
  }, [search]);

  return (
    <div className="weather">
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search" />
        <img
          src={searchIcon}
          alt=""
          onClick={() => search(inputRef.current ? inputRef.current.value : "")}
        />
      </div>

      {weatherData != null ? (
        <>
          <img src={weatherData.icon} alt="" className="weather-icon" />
          <p className="temperature">
            {weatherData ? weatherData.temperature : "--"}°C
          </p>
          <p className="location">{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidityIcon} alt="" />
              <div>
                <p> {weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className="col">
              <img src={windIcon} alt="" />
              <div>
                <p> {weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Weather;
