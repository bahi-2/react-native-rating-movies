export function getIMDBRating(name, year=null) {
  const API_KEY = 'c9604839';
  //Make year equal to current year if not specified otherwise
  let currentYear = (new Date()).getFullYear();
  year = year ? year : currentYear;
  let rating;

  return fetch('http://www.omdbapi.com/?t=' + name +
                               '&y=' + year +
                               '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => json.imdbRating)
        .catch((error)=>{
          console.log(error);
        })
  if (rating) return rating;

  // Maybe the movie is from last year, but don't recurse further
  if (year === currentYear) {return getIMDBRating(name, year-1)}
}

export function getIMDBId(name, year=null) {
  const API_KEY = 'c9604839';
  //Make year equal to current year if not specified otherwise
  let currentYear = (new Date()).getFullYear();
  year = year ? year : currentYear;
  let id;

  return fetch('http://www.omdbapi.com/?t=' + name +
                               '&y=' + year +
                               '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => json.imdbID)
        .catch((error)=>{
          console.log(error);
        })
  if (id) return id;

  // Maybe the movie is from last year, but don't recurse further
  if (year === currentYear) {return getIMDBRating(name, year-1)}
}
