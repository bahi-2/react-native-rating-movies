/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { logger } = require('../util/logger.js');


/*************************************************************/
/************************** Constants ************************/
/*************************************************************/

/** Root URL of the rating website */
const IMDB_BASE_URL = "https://www.imdb.com/";
const IMDB_MOVIE_URL_BASE = IMDB_BASE_URL + "title/";

/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

/** Deprecated in favor of getIMDBRating */
function getRatingFromApi(name, year = null) {
    const API_KEY = 'c9604839';
    //Make year equal to current year if not specified otherwise
    let currentYear = (new Date()).getFullYear();
    year = year ? year : currentYear;

    let rating = fetch('http://www.omdbapi.com/?t=' + name +
            '&y=' + year +
            '&apikey=' + API_KEY)
        .then(response => response.json())
        .then(json => json.imdbRating)
        .catch((error) => {
            logger.error('Error fetchin rating from OMDB: ' + error);
        });

    if (rating) return rating;

    // Maybe the movie is from last year, but don't recurse further
    if (year === currentYear) {
        return getIMDBRating(name, year - 1)
    }
}

/** Uses IMDB title search to find the ID of the movie. */
function scrapeId(movieItem) {
    const IMDB_SEARCH_URL = "https://www.imdb.com/search/title?";
    const title = movieItem.title.trim().split(" ").join("+");
    const run1 = movieItem.runtime - 10;
    const run2 = parseInt(movieItem.runtime) + 10;
    const FULL_URL = `${IMDB_SEARCH_URL}
                    title=${title}
                    &runtime=${run1},
                             ${run2}
                    &release_date=${movieItem.year}`;

    return fetch(encodeURI(FULL_URL))
        .then(response => response.text())
        .then(htmlString => {
            const $ = cheerio.load(htmlString);
            let href = $('#main > div > div.lister.list.detail.sub-list > div > div:nth-child(1) > div.lister-item-content > h3 > a').attr('href');
            let id = href.match(/tt[0-9]+/g)[0];
            return id;
        })
        .catch(err => {
            logger.error(`Error while scraping IMDB id for ${movieItem.title}: ${err}`);
            return null;
        });
}

/** 
Uses OMDB API to get the id of the movie. 
Unreliable, but faster than scraping it manually.
@Returns id or null 
*/
function getIdApi(movieItem) {
    const API_KEY = 'c9604839';

    let id = fetch(encodeURI(
            'http://www.omdbapi.com/?t=' + movieItem.title +
            '&y=' + movieItem.year +
            '&apikey=' + API_KEY))
        .then(response => response.json())
        .then(json => json.imdbID)
        .catch((error) => {
            logger.error(`Error while getting IMDB id (API approach) for ${movieItem.title}: ${err}`);
            return null;
        });

    if (id) return id;
}

/** Scrapes rating from the IMDB @param link. */
function scrapeRating(link) {
    return fetch(link)
        .then(response => response.text())
        .then(htmlString => {
            // parsiramo html u konstantu koja podsjeća na JQuery (kao i njena uporaba)
            const $ = cheerio.load(htmlString);
            let rating = $('#title-overview-widget > div.vital > div.title_block > div > div.ratings_wrapper > div.imdbRating > div.ratingValue > strong > span');
            return rating.text();
        })
        .catch(err => {
            logger.error(`Error scraping IMDB rating from ${link}: ${err}`);
        });
}

/** @returns movieItem Object with the IMDB rating and link fields. */
async function addIMDBValuesToMovie(movieItem) {
    let id = await scrapeId(movieItem);
    if (!id) return movieItem;
    let link = IMDB_MOVIE_URL_BASE + id;
    movieItem['imdbLink'] = link;
    
    let rating = await scrapeRating(link);
    movieItem['imdbRating'] = rating;
    return movieItem;
};


/*************************************************************/
/************************** Exports **************************/
/*************************************************************/

module.exports = {
    scrapeId: scrapeId,
    getIdApi: getIdApi,
    scrapeRating: scrapeRating,
    addIMDBValuesToMovie: addIMDBValuesToMovie,
    IMDB_BASE_URL: IMDB_BASE_URL,
};