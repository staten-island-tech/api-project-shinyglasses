import './style.css';

let userFilters = {
    'yearRange': {
      'start': 2024,
      'end': 2025,
    },
    'location': 'All',
    'depth': {
      'unit': '',
      'min': 'Lowest',
      'max': 'Highest',
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
function getMagnitudeAndDepth(articleData) {
  const htmlString = articleData.parse.text['*'];
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  
  let magnitude = 'Unavailable';
  let depth = { km: 'Unavailable', mi: 'Unavailable' };
  
  doc.querySelectorAll('tr').forEach(row => {
    const label = row.querySelector('.infobox-label');
    const data = row.querySelector('.infobox-data')?.textContent || '';
    if (!label) return;
    
    const text = label.textContent.trim().toLowerCase();
    
    // Magnitude
    if (text.includes('magnitude')) {
      let matches = data.match(/\d+(\.\d+)?/g) || [];
      // \d+ looks for one or more digits
      // (\.\d+)? looks for an optional decimal point followed by one or more digits,
      // g looks for all matches not js the first 
      matches = matches.filter(m => !/^0{2,}\d+/.test(m));
      //in each match array, there kept being something like 0000009 or 0000002
      //prob wikipedia formatting. i removed leading zeros over 1 digit to fix this
      matches = matches.map(Number).filter(n => n >= 0 && n <= 10);
      //removes impossible magnitudes like 2019 that appeared 

      if (matches.length) magnitude = Math.max(...matches);
    }
    
    
    if (text.includes('depth')) {
      const matches = [...data.matchAll(/(\d+(?:\.\d+)?)\s*(km|mi)\b/gi)];
      //looks for numbers followed by either km or mi
      matches.forEach(m => {
        if (m[2] === 'km') depth.km = Number(m[1]);
        if (m[2] === 'mi') depth.mi = Number(m[1]);
      });
    }
  });
  
  return { magnitude, depth };
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
  const { km, mi } = depthObj;

  if (km === 'Unavailable' && mi === 'Unavailable') return 'Unavailable';
  if (km !== 'Unavailable' && mi === 'Unavailable') return `${km} km`;
  if (mi !== 'Unavailable' && km === 'Unavailable') return `${mi} mi`;
  return `${mi} mi (${km} km)`;
}

function insertCards() {
  const container = document.getElementById('cards');
  container.innerHTML = earthquakesToDisplay.map(eq => {
    const depth = formatDepth(eq.depth);
    
    //differs from the usual insertAdjacentHTML method bc
    //that method takes longer to load than this one
    //speed is a concern because it was taking a long time to
    //load hundreds of earthquakes
    return `
      <div class="w-96 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm m-1">
        <div class="flex items-start justify-between">
          <h2 class="text-lg font-semibold leading-tight">
            ${eq.title}
          </h2>
        </div>

        <div class="my-3 h-px bg-base-300"></div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-base-content/60">Magnitude</p>
            <p class="text-lg font-semibold">${eq.magnitude}</p>
          </div>
          <div>
            <p class="text-base-content/60">Depth</p>
            <p class="text-lg font-semibold">${depth}</p>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <a href="${eq.url}" target="_blank"
             class="text-sm font-medium text-primary hover:underline">
            View Article/Wikipedia Section →
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function showSearchPopup() {
  const filterBtn = document.getElementById('filters');
  filterBtn.addEventListener('click', () => {
    const popup = document.getElementById('searchPopup');
    popup.showModal();
    closeSearchPopup();
  })
}
function formRangeErrorHandling(firstValue, lastValue) {
  let updateCurrentFilters = true;
  if ((firstValue && !lastValue) || (!firstValue && lastValue)) {
    showError('For ranges, you must leave both fields blank or empty.');
    updateCurrentFilters = false;
  }
  else if (!firstValue && !lastValue) {
    firstYear = 1804; //the earliest year that can be fetched with getData
    lastYear = 2026;
    //if i wanna make this even better i can update the last year automatically
    //but tbh i think its overkill for this project
  } else if (typeof firstValue === 'number' && typeof lastValue === 'number' && firstValue > lastValue) {
    showError("Your max values can't be smaller than your min values");
    updateCurrentFilters = false;
  } else if (firstValue < 0 || lastValue < 0) {
    showError("You can't have any negative values");
  }
  return updateCurrentFilters
}
async function getSearchRequirements() {
  const form = document.getElementById('searchForm'); 
form.addEventListener('submit', async() => {
  let updateCurrentFilters = true;
  let firstYear = document.getElementById('firstYear').value.trim();
  let lastYear = document.getElementById('lastYear').value.trim();
  
  if (!firstYear && !lastYear) {
    firstYear = 1950; 
    //the real first year whose data can be fetched is 1804
    //but it took 3.2 min to load all the 1k+ earthquakes if the start year is 1804
    //1.4 min for start year=1900
    //0.84 min for start year=1950
    lastYear = 2026;
    //if i wanna make this even better i can update the last year automatically
    //but tbh i think its overkill for this project
  } 
  
  // to do: 
  // also probably get a loading icon bc if you load all the earthquakes it takes sooo long
  //also something to show if there are no earthquakes that meet the criteria
  //prob can js use the message code 
  let location = document.getElementById('location').value.toLowerCase().trim();
  if (!location) {location = 'All'}
  if (/\d/.test(location)) {
    //sees if it has numbers
    showError("Numbers aren't allowed in locations")
  }
  
  const selectedUnit = document.querySelector('input[name="depthUnit"]:checked').value;

  let minDepth = document.getElementById('minDepth')?.value?.trim();
  let maxDepth = document.getElementById('maxDepth')?.value?.trim();

  if (!minDepth && !maxDepth) {
    minDepth = 'Lowest';
    maxDepth = 'Highest';
    //its not worth the effort to figure out the actual lowest/highest depths from all data
    //ill js check if the minDepth is 'lowest' or maxDepth is 'highest' when filtering later on
    //and use that to know not to filter by depth
    //is there a better way? probably but this method should work
  } 

  let magnitudeMin = document.getElementById('magnitudeMin')?.value?.trim();
  let magnitudeMax = document.getElementById('magnitudeMax')?.value?.trim();
  if (!magnitudeMin && !magnitudeMax) {
    magnitudeMin = 'Lowest';
    magnitudeMax = 'Highest';
    //lowest is 0
    //highest is 10 
  } 
    updateCurrentFilters =
  formRangeErrorHandling(firstYear, lastYear) &&
  formRangeErrorHandling(minDepth, maxDepth) &&
  formRangeErrorHandling(magnitudeMin, magnitudeMax);

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

  if (updateCurrentFilters) {
    editCurrentFilters(); 
    await applyFilters();
  }
});
}
async function applyFilters() {
  console.time('applyFilters');
  console.log('loading')
  showLoading();

  const titles = await fetchTitlesBasedOnYearRange(
    userFilters.yearRange.start,
    userFilters.yearRange.end
  );

  const filteredTitles = titles.filter(title => {
    if (!title || Array.isArray(title)) return false;

    const location = getLocation(title)?.toLowerCase();
    if (!location) return false;

    if (userFilters.location !== 'All' && location !== userFilters.location.toLowerCase()) {
      return false;
    }
    return true;
  });

  const results = await Promise.all(
    filteredTitles.map(async title => {
      try {
        const articleData = await getArticleData(title);
        const {magnitude, depth} = getMagnitudeAndDepth(articleData)
        const location = getLocation(title);
        const url = await getArticleUrl(title);

        return { title, location, url, depth, magnitude };
      } catch {
        return null;
      }
    })
  );
  console.log(results)
  earthquakesToDisplay = [];

  for (const eq of results) {
    if (!eq) continue;

    if (userFilters.depth.min !== 'Lowest') {
      if (userFilters.depth.unit === 'km') {
        if (eq.depth.km === 'Unavailable') continue;
        if (eq.depth.km < userFilters.depth.min || eq.depth.km > userFilters.depth.max) continue;
      } else {
        if (eq.depth.mi === 'Unavailable') continue;
        if (eq.depth.mi < userFilters.depth.min || eq.depth.mi > userFilters.depth.max) continue;
      }
    }

    if (userFilters.magnitude.min !== 'Lowest') {
      if (
        eq.magnitude < userFilters.magnitude.min ||
        eq.magnitude > userFilters.magnitude.max
      ) continue;
    }

    earthquakesToDisplay.push(eq);
  }

  insertCards();
  hideLoading();

  console.timeEnd('applyFilters');
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

function editCurrentFilters() {
  document.getElementById('yearRange').textContent = `${userFilters.yearRange.start} to ${userFilters.yearRange.end}` //
  document.getElementById('locationDisplay').textContent = userFilters.location; //need to capitalize

  let depthString =  `${userFilters.depth.min} ${userFilters.depth.unit} to ${userFilters.depth.max}  ${userFilters.depth.unit}` 
  if (userFilters.depth.min === 'Lowest' && userFilters.depth.max === 'Highest') {
    depthString = `${userFilters.depth.min} to ${userFilters.depth.max} ` 
  } 
  document.getElementById('depthRange').textContent = depthString
  document.getElementById('magnitudeRange').textContent = `${userFilters.magnitude.min} to ${userFilters.magnitude.max}`
  
}
function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}
showSearchPopup();
getSearchRequirements();
editCurrentFilters();
applyFilters();
insertCards();

