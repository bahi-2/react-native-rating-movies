import cheerio from 'react-native-cheerio';

export function getIMDBRatingApi(name, year=null) {
  const API_KEY = 'c9604839';
  //Make year equal to current year if not specified otherwise
  let currentYear = (new Date()).getFullYear();
  year = year ? year : currentYear;

  let rating = fetch('http://www.omdbapi.com/?t=' + name +
                               '&y=' + year +
                               '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => json.imdbRating)
        .catch((error)=>{
          console.log(error);
        });

  if (rating) return rating;

  // Maybe the movie is from last year, but don't recurse further
  if (year === currentYear) {return getIMDBRating(name, year-1)}
}

export function getIMDBId(name, year=null) {
  const API_KEY = 'c9604839';
  //Make year equal to current year if not specified otherwise
  let currentYear = (new Date()).getFullYear();
  year = year ? year : currentYear;
  let id = fetch('http://www.omdbapi.com/?t=' + name +
                               '&y=' + year +
                               '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => json.imdbID)
        .catch((error)=>{
          console.log(error);
        });

  if (id) return id;

  // Maybe the movie is from last year, but don't recurse further
  if (year === currentYear) {return getIMDBId(name, year-1)}
}

export function getIMDBRating(link) {
  return fetch(link)
    .then(response => response.text())
    .then(htmlString => {
      // parsiramo html u konstantu koja podsjeća na JQuery (kao i njena uporaba)
      const $ = cheerio.load(htmlString);
      let rating = $('#title-overview-widget > div.vital > div.title_block > div > div.ratings_wrapper > div.imdbRating > div.ratingValue > strong > span');
      return rating.text();
    });
}

