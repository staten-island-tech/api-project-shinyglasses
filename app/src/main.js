let inventory = [];

async function getData(year) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${year}_earthquakes&cmlimit=50&cmtype=page&cmnamespace=0&format=json&origin=*`,
    );
    //catmembers only gives meta data -> need to make another api call or js restructure this call
    //probably up cmlimit and filter later
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const earthquakes = data.query.categorymembers;
    const titles = earthquakes.map(earthquake => earthquake.title);
    titles.shift(); //the first entry is always a List of {year} earthquakes page, which isnt needed
    return titles;

  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
async function getArticleData(page) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&format=json&origin=*`,
    );
    //catmembers only gives meta data -> need to make another api call or js restructure this call
    //probably up cmlimit and filter later
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
function getTempImageUrl(data) {
  console.log(data)
  const imgUrl = data.parse.images[0];
  console.log(imgUrl);
  return imgUrl;
}

async function getFinalImageUrl(tempUrl, page) {
try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:${tempUrl}&format=json&origin=*`,
    );
    //catmembers only gives meta data -> need to make another api call or js restructure this call
    //probably up cmlimit and filter later
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
/*{
    "continue": {
        "iistart": "2018-08-22T00:07:08Z",
        "continue": "||"
    },
    "query": {
        "normalized": [
            {
                "from": "File:2018_Venezuela_earthquake.jpg",
                "to": "File:2018 Venezuela earthquake.jpg"
            }
        ],
        "pages": {
            "-1": {
                "ns": 6,
                "title": "File:2018 Venezuela earthquake.jpg",
                "missing": "",
                "known": "",
                "imagerepository": "shared",
                "imageinfo": [
                    {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/2018_Venezuela_earthquake.jpg",
                        "descriptionurl": "https://commons.wikimedia.org/wiki/File:2018_Venezuela_earthquake.jpg",
                        "descriptionshorturl": "https://commons.wikimedia.org/w/index.php?curid=71855383"
                    }
                ]
            }
        }
    }
} */
async function fetchDecadeData() {
  const data = [];

  for (let year = 2016; year <= 2025; year++) {
    try {
    const yearData = await getData(year);
    data.push(yearData);
  } catch (err) {
    console.error("Failed for year:", year, err);
  }

  }
  return data.flat();
}

function getRandomEarthquakes(amount, array) { 
  let randomEarthquakes = [];
  for (let i = 0; i < amount; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    randomEarthquakes.push(array[randomIndex]); 
    array.splice(randomIndex, 1); 
  }
  return randomEarthquakes;
}

async function insertCard(item,imgUrl) {
  const articleData = await getArticleData(item);
  console.log(articleData)
  const container = document.getElementById('cards');
  const html = `<article>
  <h2>${item}</h2><img src=${imgUrl}>
  </article>'`
  container.insertAdjacentHTML('beforeend', html)
}

function getUserSearch() {
  
}

let data = [];
data = await fetchDecadeData();
let earthquakesToDisplay = [];
earthquakesToDisplay = getRandomEarthquakes(20, data);
console.log(earthquakesToDisplay);


for (const earthquake of earthquakesToDisplay) {
  const articleData = await getArticleData(earthquake);
  console.log(articleData);
  const imgUrl = getTempImageUrl(articleData);
  const finalImageUrl = await getFinalImageUrl(imgUrl, earthquake);
  insertCard(earthquake, finalImageUrl);
}