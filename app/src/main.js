let naturalDisasterTypes = ['Earthquakes', 'Tsunamis', 'Hurricanes', 'Tornadoes', 'Floods', 'Wildfires'];
/* to prevent the # of earthquakes from being absurdly long the restrictions are
cmlimit=50, from the past decade
*/
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
    titles.shift(0, 1); //the first entry is always a List of {year} earthquakes page, which isnt needed
    return titles;

  } catch (error) {
    console.error("Error fetching data:", error);
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

async function getImageUrls(page) {

}
getArticleData('1976_Tangshan_earthquake');
async function fetchDecadeData() {
  const data = [];

  for (let year = 2016; year <= 2025; year++) {
    const yearData = await getData(year); 
    data.push(yearData);
  }
  return data.flat();
}
let data = [];
data = await fetchDecadeData();
console.log(data);
function getRandomEarthquakes(amount, array) { 
  let randomEarthquakes = [];
  for (let i = 0; i < amount; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    randomEarthquakes.push(array[randomIndex]); 
    array.splice(randomIndex, 1); 
  }
  return randomEarthquakes;
}
let earthquakesToDisplay = [];
earthquakesToDisplay = getRandomEarthquakes(20, data);

async function insertCard(item) {
  const articleData = await getArticleData(item);
  console.log(articleData)
  const container = document.getElementById('cards');
  const html = `<article>
  <h2>${item}</h2><img src=${item.img}
  </article>'`
  container.insertAdjacentHTML('beforeend', html)
}
insertCard('1976_Tangshan_earthquake');

export class Savefiles {
//saves aren't strictly needed but i dont wanna run out of api keys so im gonna store api data in localstorage
static createSavefile(inventory, theme) {
const userProfile = { 
  'inventory': inventory,
  'theme': theme, 
};
localStorage.setItem('save', JSON.stringify(userProfile));
}

static updateSaveInventory() {
  save.inventory = tempInventory;
  localStorage.setItem('save', JSON.stringify(save));
  console.log(localStorage)
}

static updateTheme(newTheme) {
  const save = this.loadSavefile();
  save.theme = newTheme;
  localStorage.setItem('save', JSON.stringify(save));
  console.log(localStorage)
}

static loadSavefile() {
  return JSON.parse(localStorage.getItem('save'));
}                
}

function getUserSearch() {
  
}
