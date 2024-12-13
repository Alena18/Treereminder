import { quotes } from "./quotes.js";
import { useState, useEffect } from "react"; // Ensure required hooks are imported.

export default function Random() {
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [Location, setLocation] = useState("Location");

  let location = [
    { location: "Berlin" },
    { location: "Glasgow" },
    { location: "Madrid" },
    { location: "Dublin" },
    { location: "Maynooth" },
    { location: "Belfast" },
    { location: "London" },
    { location: "Lisbon" },
    { location: "Rome" },
    { location: "Dubai" },
  ];

  function handleLocationChange(event) {
    setLocation(event.target.value);
  }

  useEffect(() => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${Location}&appid=86177d215bf9de5db664fd01bd0e9bb7&units=metric`;

    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        console.log(json);
        setData(json);
        setIsLoading(false);
      } catch (errorMessage) {
        setError(errorMessage);
        setIsLoading(false);
        console.log(errorMessage);
      }
    }

    fetchData();
  }, [Location]);

  if (isLoading) {
    return <h3>Loading ... Please wait</h3>;
  } else if (error) {
    return <h3> Error occurred: {error.toString()}</h3>;
  } else {
    return (
      <div>
        <h6>
          <LocationDropDown
            handleLocationChange={handleLocationChange}
            location={location}
            locationForMenu={Location}
          />
          <Display APIData={data} Error={error} IsLoading={isLoading} />
          <Quotes />
        </h6>
      </div>
    );
  }
}

// START RH

export function Display({ APIData }) {
  if (
    !APIData ||
    !APIData.main ||
    !APIData.main.temp ||
    !APIData.weather ||
    !APIData.weather[0].description
  ) {
    return <p>No data available</p>;
  }

  const temperatureData = APIData.main.temp;
  const weatherDescription = toSentenceCase(APIData.weather[0].description);

  if (temperatureData < 0) {
    return (
      <>
        <div className="display-linebreak">
          <b>Temp: {Math.round(temperatureData)}℃</b>
        </div>
        <br />
        <div className="display-linebreak">
          <h7>It's freezing! Wrap up warm!</h7>
        </div>
        <br />
        <div className="display-linebreak">
          <h7>{weatherDescription}</h7>
        </div>
      </>
    );
  } else if (temperatureData >= 10) {
    return (
      <>
        <div className="display-linebreak margt">
          <>
            Temp: {Math.round(temperatureData)}℃ ~ Conditions:{" "}
            {weatherDescription}
          </>
        </div>
        <br />
        <div className="display-linebreak">
          <h6>"Don't forget your sun cream!"</h6>
        </div>
      </>
    );
  } else if (temperatureData < 10) {
    return (
      <>
        <div className="display-linebreak margt">
          <>
            Temp: {Math.round(temperatureData)}℃ ~ Conditions:{" "}
            {weatherDescription}
          </>
        </div>
        <br />
        <div className="display-linebreak">
          <h6>"Brrr...don't forget your coat!"</h6>
        </div>
      </>
    );
  }

  function toSentenceCase(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

export function LocationDropDown({
  handleLocationChange,
  location,
  locationForMenu,
}) {
  return (
    <>
      <form className="margt">
        <label>Pick location: </label>
        <div className="display-linebreak margt"></div>
        <select value={locationForMenu} onChange={handleLocationChange}>
          {location.map((a, index) => (
            <option key={index} value={a.location}>
              {a.location}
            </option>
          ))}
        </select>
      </form>
    </>
  );
}

export function Quotes() {
  const [randomQuote, setRandomQuote] = useState(null);
  const [isMotivational, setIsMotivational] = useState(true);

  const getRandomQuote = () => {
    const arrayToUse = isMotivational
      ? quotes.motivational_and_tree_facts.motivational_tips
      : quotes.motivational_and_tree_facts.tree_facts;

    const randomIndex = Math.floor(Math.random() * arrayToUse.length); // Changed Math.round to Math.floor.
    setRandomQuote(arrayToUse[randomIndex]);
    setIsMotivational(!isMotivational);
  };

  return (
    <div className="quotes-container">
      <button
        className="btn btn-success btn-outline-light margt"
        onClick={getRandomQuote}
      >
        Facts / Tips
      </button>
      {randomQuote && (
        <p className="quote">
          <b>{isMotivational ? "Motivational Tip:" : "Tree Fact:"}</b>{" "}
          {randomQuote}
        </p>
      )}
    </div>
  );
}
