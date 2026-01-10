import './style.css';

let searchRequirements = [];
let earthquakesToDisplay = [];

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
    titles.forEach(title => {
      earthquakesToDisplay.push({'title': title})
    });
    console.log(earthquakesToDisplay)
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
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    //get mag and casualty data from here
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
async function getArticleUrl(title) {
  const formattedTitle = title.replace(/ /g, "_");
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  console.log(`${baseUrl}${formattedTitle}`);
  return `${baseUrl}${formattedTitle}`;
}

async function fetchDataBasedOnYearRange(yearStart, yearEnd) {
  const data = [];

  for (let year = yearStart; year <= yearEnd; year++) {
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
}

async function insertCard(earthquake) {
  const articleData = await getArticleData(earthquake);
  const container = document.getElementById('cards');
  const html = `
          <div class="w-96 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm m-1">

  <div class="flex items-start justify-between">
    <h2 class="text-lg font-semibold leading-tight">
      ${earthquake.title}
    </h2>
  </div>

  <div class="my-3 h-px bg-base-300"></div>

  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p class="text-base-content/60">Magnitude</p>
      <p class="text-lg font-semibold">7.2</p>
    </div>

    <div>
      <p class="text-base-content/60">Depth</p>
      <p class="text-lg font-semibold">10 km</p>
    </div>

    <div>
      <p class="text-base-content/60">Deaths</p>
      <p class="text-lg font-semibold">~2,200</p>
    </div>
  </div>

  <div class="mt-4 flex justify-end">
    <a href="${earthquake.url}" class="text-sm font-medium text-primary hover:underline">
      View Article →
    </a>
  </div>
</div>
`
  //add severity and death toll? 
  container.insertAdjacentHTML('beforeend', html)
}

function capitalizeTitles(earthquakes) {
  for (const earthquake of earthquakes) {
    earthquake.split
  }
}
function getUserFilters() {
  const filterBtn = document.getElementById('filters');
  filterBtn.addEventListener('click', () => {
    const popup = document.getElementById('searchPopup');
    popup.showModal();
    closeSearchPopup();
    document.body.insertAdjacentHTML('beforeend', html)
  })
}
function closeSearchPopup() { 
  const closeBtn = document.getElementById('closeSearchPopup');
  closeBtn.addEventListener('click', () => {
    const popup = document.getElementById('searchPopup');
    popup.close();
  })
}
async function createEarthquakeObject() {
  for (const earthquake of earthquakesToDisplay) {
  earthquakesToDisplay = earthquakesToDisplay.filter(eq => eq !== earthquake);
  data = data.filter(eq => eq !== earthquake);
  const url = await getArticleUrl(earthquake.title);
  earthquake.url = url;
  //same process as url but for mag and depth
  //wikipedia doesnt have a standard format for casualties so im just gonna do injured + dead
  //i need to remove the earthquakes that dont have mag/depth/casualty data 
  console.log(earthquake)
  earthquakesToDisplay.push(getRandomEarthquakes(1, data));
  insertCard(earthquake);
}
}
getUserFilters();

let data = [];
data = await fetchDataBasedOnYearRange(2015, 2024);
getRandomEarthquakes(20, data);
console.log(earthquakesToDisplay);
createEarthquakeObject();

