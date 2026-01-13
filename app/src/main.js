import './style.css';

let userFilters = {
    'yearRange': {
      'start': 2024,
      'end': 2025,
    },
    'location': 'all',
    'depth': {
      'unit': '',
      'min': 'lowest',
      'max': 'highest',
    },
    'magnitude': {
      'min': 0,
      'max': 10,
    },
  }; //default user filters

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
    return titles;

  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
async function getArticleData(title) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&format=json&origin=*`,
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
function getMagnitude(articleData) {
  const htmlString = articleData.parse.text['*'];
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');

  const rows = doc.querySelectorAll('tr');

  for (const row of rows) {
    const label = row.querySelector('.infobox-label');
    if (label && label.textContent.trim().toLowerCase().includes('magnitude')) {
      const text = row.querySelector('.infobox-data').textContent;

      let matches = text.match(/\d+(\.\d+)?/g); 
      // \d+ looks for one or more digits
      // (\.\d+)? looks for an optional decimal point followed by one or more digits,
      // g looks for all matches not js the first 
      matches = matches.filter(m => !/^0{2,}\d+/.test(m));
      //in each match array, there kept being something like 0000009 or 0000002
      //prob wikipedia formatting. i removed leading zeros over 1 digit to fix this
      matches = matches.map(Number).filter(match => match >= 0 && match <= 10);
      //removes impossible magnitudes like 2019 that appeared 

      return Math.max(...matches.map(Number));
      //picks the highest number if multiple afound
      //not a foolproof method but should work for most casesre 
    }
  }
  return 'Unavailable';
}
function getDepth(articleData) {
  const htmlString = articleData.parse.text['*'];
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');

  const rows = doc.querySelectorAll('tr');

  for (const row of rows) {
    const label = row.querySelector('.infobox-label');
    if (label && label.textContent.trim().toLowerCase().includes('depth')) {
      const text = row.querySelector('.infobox-data').textContent;

      let matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(km|mi)\b/gi)];
      //looks for numbers followed by either km or mi
      const depths = matches.map(m => ({
        value: Number(m[1]),
        unit: m[2]
      }));
      
      let depthMetric = 'Unavailable';   
      let depthImperial = 'Unavailable';

      depths.forEach(m => {
        if (m.unit === "km") depthMetric = m.value;
        else if (m.unit === "mi") depthImperial = m.value;
      });

      return {'km': depthMetric, 
        'mi': depthImperial };
    }
  }
  return {'km': 'Unavailable', 
    'mi': 'Unavailable' };
}
function getLocation(title) {
  // not 100% accurate bc the title doesnt always have the location
  //but its the best approximation i can do 
  //since there isnt a location infobox like there is for depth and magnitude 
  //i could do something like get an ai to 
  // scan the body of the page for the location but that's frankly
  //outside the scope of this project

  const location = title.replace(/\b\d+\b|\bearthquake\b|\bearthquakes\b|\beruption\b|\beruptions\b|/gi, '').trim();
  //removes nums and the words earthquake, earthquakes, eruption and eruptions
  return location
}
async function getArticleUrl(title) {
  const formattedTitle = title.replace(/ /g, "_");
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  return `${baseUrl}${formattedTitle}`;
}
async function fetchTitlesBasedOnYearRange(yearStart, yearEnd) {
  const titles = [];

  for (let year = yearStart; year <= yearEnd; year++) {
    try {
    const yearData = await getData(year);
    titles.push(yearData);
    await new Promise(r => setTimeout(r, 500));
    
  } catch (err) {
    console.error("Failed for year:", year, err);
  }
  }
  return titles.flat();
}
function formatDepth(depthObj) {
  // i couldve formatted the object from getDepth as strings in this format in the getDepth function
  //but i put it here bc its easier to use the data in search/filtering later on 
  // if its in earthquake objs have depth in object form
  const { km, mi } = depthObj;

  if (km === 'Unavailable' && mi === 'Unavailable') return 'Unavailable';
  if (km !== 'Unavailable' && mi === 'Unavailable') return `${km} km`;
  if (mi !== 'Unavailable' && km === 'Unavailable') return `${mi} mi`;
  return `${mi} mi (${km} km)`;
}
function insertCard(earthquake) {
  const container = document.getElementById('cards');
  const depth = formatDepth(earthquake.depth || {});

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
      <p class="text-lg font-semibold">${depth}</p>
    </div>
    <div>
      <p class="text-base-content/60">Depth</p>
      <p class="text-lg font-semibold">${depth}</p>
    </div>

  </div>

  <div class="mt-4 flex justify-end">
    <a href="${earthquake.url}" class="text-sm font-medium text-primary hover:underline">
      View Article →
    </a>
  </div>
</div>
`
  container.insertAdjacentHTML('beforeend', html)
}
function insertCards() {
  console.log(userFilters)
  console.log(earthquakesToDisplay)
  const container = document.getElementById('cards');
  container.innerHTML = ''
  for (const earthquake of earthquakesToDisplay) {
    insertCard(earthquake);
  }
}
function showSearchPopup() {
  const filterBtn = document.getElementById('filters');
  filterBtn.addEventListener('click', () => {
    const popup = document.getElementById('searchPopup');
    popup.showModal();
    closeSearchPopup();
  })
}
async function getSearchRequirements() {
  const form = document.getElementById('searchForm'); 

form.addEventListener('submit', async() => {

  let firstYear = document.getElementById('firstYear').value.trim();
  let lastYear = document.getElementById('lastYear').value.trim();
  
  if ((firstYear && !lastYear) || (!firstYear && lastYear)) {
    showError('For ranges, you must leave both fields blank or empty.')
  }
  else if (!firstYear && !lastYear) {
    firstYear = 1804; //the earliest year that can be fetched with getData
    lastYear = 2026;
    //if i wanna make this even better i can update the last year automatically
    //but tbh i think its overkill for this project
  }
  /* to do: ADD ERROR MESSAGE FOR IF MINIMUMS EXCEED MAXIMUM*/
  // also probably get a loading icon bc if you load all the earthquakes it takes sooo long
  //also something to show if there are no earthquakes that meet the criteria
  //prob can js use the message code 
  let location = document.getElementById('location').value.toLowerCase().trim();
  if (!location) {location = 'all'}
  
  const selectedUnit = document.querySelector('input[name="depthUnit"]:checked').value;

  let minDepth = document.getElementById('minDepth')?.value?.trim();
  let maxDepth = document.getElementById('maxDepth')?.value?.trim();

  if ((minDepth && !maxDepth) || (!minDepth && maxDepth))  {
    showError('For ranges, you must leave both fields blank or empty.')
  } else if (!minDepth && !maxDepth) {
    minDepth = 'lowest';
    maxDepth = 'highest';
    //its not worth the effort to figure out the actual lowest/highest depths from all data
    //ill js check if the minDepth is 'lowest' or maxDepth is 'highest' when filtering later on
    //and use that to know not to filter by depth
    //is there a better way? probably but this method should work
  }
  let magnitudeMin = document.getElementById('magnitudeMin')?.value?.trim;
  let magnitudeMax = document.getElementById('magnitudeMax')?.value?.trim();
  if ((magnitudeMin && !magnitudeMax) || (!magnitudeMin && magnitudeMax)) {
    showError('For ranges, you must leave both fields blank or empty..')
  } else if (!magnitudeMin && !magnitudeMax) {
    magnitudeMin = 0;
    magnitudeMax = 10;
    //when getting mag data i filtered out mag not in from 0-10 
    // so these are the min and max 
  }
  userFilters = {
    yearRange: {
      'start': firstYear,
      'end': lastYear,
    },
    location: location,
    depth: {
      'unit': selectedUnit,
      'min': minDepth,
      'max': maxDepth,
    },
    magnitude: {
      'min': magnitudeMin,
      'max': magnitudeMax,
    },
  };
  console.log(userFilters)
  await applyFilters();
});
}
async function applyFilters() {
  let titles = await fetchTitlesBasedOnYearRange(userFilters.yearRange.start, userFilters.yearRange.end);
  earthquakesToDisplay = [];
  console.log(earthquakesToDisplay)
  
  for (const title of titles) {
    if (Array.isArray(title)) continue;

    const url = await getArticleUrl(title);
    const articleData = await getArticleData(title);
    const depth = getDepth(articleData);
    const magnitude = getMagnitude(articleData);
    const location = getLocation(title);

    if (userFilters.depth.unit === 'km') {
      if (depth.km === 'Unavailable') continue;
      if (depth.km > userFilters.depth.max || depth.km < userFilters.depth.min) continue;
    } else if (userFilters.depth.unit === 'mi') {
      if (depth.mi === 'Unavailable') continue;
      if (depth.mi > userFilters.depth.max || depth.mi < userFilters.depth.min) continue;
    }

    if (magnitude > userFilters.magnitude.max || magnitude < userFilters.magnitude.min) continue;

    if (userFilters.location !== 'all' && location.toLowerCase() !== userFilters.location) continue;
    
    createEarthquakeObject(title,location,url,depth,magnitude);
}
  insertCards();
}
function closeSearchPopup() { 
  const closeBtn = document.getElementById('closeSearchPopup');
  closeBtn.addEventListener('click', () => {
    const popup = document.getElementById('searchPopup');
    popup.close();
  })
}
function showError(message) {
  const popup = document.getElementById('errorPopup');
  const messageEl = document.getElementById('errorMessage');
  messageEl.textContent = message;
  popup.showModal(); 
  hideError(); 
}
function hideError() {
  const closeBtn = document.getElementById('closeError');
  closeBtn.addEventListener('click', () => {
    const popup = document.getElementById('errorPopup');
    popup.close();
  })
}
function createEarthquakeObject(title, location, url, depth, magnitude) {
  let earthquake = {
    title: title,
    location: location,
    url: url,
    depth: depth,
    magnitude: magnitude
  };
  earthquakesToDisplay.push(earthquake);    
}
showSearchPopup();
getSearchRequirements();

