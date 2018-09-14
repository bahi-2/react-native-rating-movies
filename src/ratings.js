import {projekcije} from './firebase.js';

export function getIMDBRating(name, year=null) {
  const API_KEY = 'c9604839';
  //Make year equal to current year if not specified otherwise
  let currentYear = (new Date()).getFullYear();
  year = year ? year : currentYear;
  let rating;

  let movieRef = projekcije.child("sve").push();

  return fetch('http://www.omdbapi.com/?t=' + name +
                               '&y=' + year +
                               '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => {
        	movieRef.set({
        		'id': json.imdbID,
        		'rating': json.imdbRating,
        		'name': name,
        	});
        	return json;
        })
        .then(json => json.imdbRating)
        .catch((error)=>{
        	console.log(error);
        })
  if (rating) return rating;

  // Maybe the movie is from last year, but don't recurse further
  if (year === currentYear) {return getIMDBRating(name, year-1)}
}