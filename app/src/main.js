const tastyKey = import.meta.env.VITE_API_KEY_TASTY;
console.log(tastyKey);  

async function getData(query) {
  try {
    const response = await fetch(
      `https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=${query}`,
      {
        method: "GET",
        headers: {
          'x-rapidapi-key': tastyKey,
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

/* const data = getData('chicken soup');
data.array.forEach(element => {console.log(element.beauty_url)
  console.log(element.cook_time_minutes);
  console.log(element.description);
  console.log(element.keywords);
  console.log(element.name);
  console.log(element.num_servings);
  console.log(element.nutrition);
  console.log(element.price);
  console.log(element.tags);
  console.log(element.tips_summary);
  console.log(element.total_time_minutes);
  console.log(element.topics);
  console.log(element.yields);
  console.log(element.original_video_url);
  console.log(element.prep_time_minutes);
}); */
const parameters = ['beauty_url', 'cook_time_minutes', 'description',
  'keywords', 'name', 'num_servings', 'nutrition',
  'price', 'tags', 'tips_summary', 'total_time_minutes',
  'topics', 'yields', 'original_video_url', 'prep_time_minutes'];

/* beauty url, cook time, description, 
keywords (not an array, its a string), name, num_servings,
nutrition & price are [Object] gotta actually make the data available,tags, tips summary?, total time minutes, topics, yield,
original video url, prep time*/

/* 

{
      approved_at: 1542683016,
      aspect_ratio: '1:1',
      beauty_url: 'https://img.buzzfeed.com/video-api-prod/assets/61a5464d4574449a94d7c785e85708ad/beauty.jpg',
      brand: null,
      brand_id: null,
      buzz_id: null,
      canonical_id: 'recipe:4563',
      compilations: [Array],
      cook_time_minutes: 25,
      country: 'US',
      created_at: 1542416110,
      credits: [Array],
      description: "Warm up with this comforting Chicken Meatball Soup that's loaded with tender veggies and savory meatballs. It's a hearty, flavorful meal that'll leave you feeling satisfied and cozy.",
      draft_status: 'published',
      facebook_posts: [],
      id: 4563,
      inspired_by_url: 'https://damndelicious.net/2018/07/29/italian-wedding-soup/',
      instructions: [Array],
      is_app_only: false,
      is_one_top: false,
      is_shoppable: true,
      is_subscriber_content: false,
      keywords: 'chicken soup, chicken stock, easy, fall soup, italian wedding soup, meatball recipe, orzo, swiss chard, winter',
      language: 'eng',
      name: 'Chicken Meatball Soup',
      num_servings: 6,
      nutrition: [Object],
      nutrition_visibility: 'auto',
      original_video_url: 'https://s3.amazonaws.com/video-api-prod/assets/a957d0c5ffe14dc8aaf478d2fdd38367/SoupOO.mp4',
      prep_time_minutes: 20,
      price: [Object],
      promotion: 'full',
      renditions: [Array],
      sections: [Array],
      seo_path: '8757513,9295874,64453',
      seo_title: '',
      servings_noun_plural: 'servings',
      servings_noun_singular: 'serving',
      show: [Object],
      show_id: 17,
      slug: 'chicken-meatball-soup',
      tags: [Array],
      thumbnail_alt_text: '',
      thumbnail_url: 'https://s3.amazonaws.com/video-api-prod/assets/6ec67fc6adc0425d9e0216ec0d0e8797/FBthumb.jpg',
      tips_and_ratings_enabled: true,
      tips_summary: [Object],
      topics: [Array],
      total_time_minutes: 45,
      total_time_tier: [Object],
      updated_at: 1683237600,
      user_ratings: [Object],
      video_ad_content: 'none',
      video_id: 70524,
      video_url: 'https://vid.tasty.co/output/117803/hls24_1543624762.m3u8',
      yields: 'Servings: 6-8'
    }
*/

function insertCards() {
}