import './style.css';
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
/* function getTempImageUrl(data) {
  console.log(data)
  for (const img of data.parse.images) {
    if (img.toLowerCase().includes('map')) {
      const imgUrl = img;
      if (imgUrl) {
      console.log(imgUrl);
      return imgUrl;
    }
    }
  }
} */

/* async function getFinalImageUrl(tempUrl) {
try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:${tempUrl}&format=json&origin=*`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    //error handling for if there arent any images
    if (!data.query.pages[-1].imageinfo) {
      console.error("No images");
      return null;
    } else {
      return data.query.pages[-1].imageinfo[0].url;
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
} */
/*{
    "batchcomplete": "",
    "query": {
        "normalized": [
            {
                "from": "File:undefined",
                "to": "File:Undefined"
            }
        ],
        "pages": {
            "-1": {
                "ns": 6,
                "title": "File:Undefined",
                "missing": "",
                "imagerepository": ""
            }
        }
    }
}*/
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

async function insertCard(item) {
  const articleData = await getArticleData(item);
  console.log(articleData)
  const container = document.getElementById('cards');
  const html = `
          <div class="w-96 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">

  <div class="flex items-start justify-between">
    <h2 class="text-lg font-semibold leading-tight">
      ${item}
    </h2>
    <span class="text-sm font-mono text-base-content/60">
      YEAR
    </span>
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

    <div>
      <p class="text-base-content/60">Location</p>
      <p class="text-lg font-semibold">Haiti</p>
    </div>
  </div>


  <div class="mt-4 flex justify-end">
    <a
      href="#"
      class="text-sm font-medium text-primary hover:underline"
    >
      View Article →
    </a>
  </div>
</div>
`
  //add severity and death toll? 
  container.insertAdjacentHTML('beforeend', html)
}

function getUserFilters() {
  const filterBtn = document.getElementById('filters');
  filterBtn.addEventListener('click', () => {
    const popup = document.getElementById('filter__popup');
    popup.showModal()
    document.body.insertAdjacentHTML('beforeend', html)
    //year, location text areas
    //submit btn
    //need to make it so can't get multiple filter pop ups
  })
}
getUserFilters();

let data = [];
data = await fetchDecadeData();
let earthquakesToDisplay = [];
earthquakesToDisplay = getRandomEarthquakes(20, data);
console.log(earthquakesToDisplay);


for (const earthquake of earthquakesToDisplay) {
  const articleData = await getArticleData(earthquake);
  console.log(articleData);
  //const imgUrl = getTempImageUrl(articleData);
  
    earthquakesToDisplay = earthquakesToDisplay.filter(eq => eq !== earthquake);
    data = data.filter(eq => eq !== earthquake)
    earthquakesToDisplay.push(getRandomEarthquakes(1, data));

  
  // const finalImageUrl = await getFinalImageUrl(imgUrl);
  insertCard(earthquake);
}