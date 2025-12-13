async function getData(query) {
  try {
    const response = await fetch(
      `https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=${query}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": "YOUR_RAPIDAPI_KEY", //get actual api key
          "x-rapidapi-host": "tasty.p.rapidapi.com"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Error fetching Tasty data:", error);
  }
}

getData('chicken soup');

function insertCards() {
}