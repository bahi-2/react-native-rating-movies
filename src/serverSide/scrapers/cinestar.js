/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const helpers = require('../util/helpers.js');
const parseMovieInfoFromString = helpers.parseMovieInfoFromString;
const { logger } = require('../util/logger.js');

/*************************************************************/
/************************** Constants ************************/
/*************************************************************/

/** Root URL of the cinema */
const CINEMA_BASE_URL = "https://www.blitz-cinestar.hr/";

/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

/** @returns array of links of all movies playing in all Cinestars */
function getLinksOfAllMovies() {
    return fetch(CINEMA_BASE_URL)
        .then((response) => response.text())
        .then(htmlString => {
            const $ = cheerio.load(htmlString);
            let movies = $('select#odabirfilmaselect').find('option');
            let movieLinks = [];
            movies.each(
                function(index, movie) {
                    let link = $(this).attr('value');
                    if (link !== '/cinestar') {
                        movieLinks.push(CINEMA_BASE_URL + link);
                    }
                }
            );
            return movieLinks;
        })
        .catch(err =>
            logger.error("Could not fetch links of all movies, error: " + err)
        );
}

/** @returns schedule scraped from the @param movieURL */
function scrapeMovieSchedule(movieURL) {
  return fetch(movieURL)
        .then(response=>response.text())
        .then(htmlString=>{
          const $ = cheerio.load(htmlString);
          let schedule = {};

          let cinemaList = $('div.kino_menu > ul').children().map(function(i, el) {
              let cinemaName = $(this).text();
              if (cinemaName == 'Sl. Brod') {
                  cinemaName = 'Slavonski Brod';
              }
              return cinemaName;
          }).get();
          
          let scheduleBody = $('#scheduleBody');
          scheduleBody.find('.scheduleBodyWrapper').each(function(i, el) {
              // for each cinema schedule
              let scheduleByDate = {};

              let dayWrappers = $(this).find('.scheduleBodyDayWrapper');
              dayWrappers.each(function(i, el) {
                  let date = $(this).attr('rel');
                  date = date.replace('.', '').replace('.', ''); //dots not allowed in firebase keys
                  let termElems = $(this).find('div.termin > a');
                  let terms = termElems.map(function(i, el) {
                      let term = {
                          time: $(this).text(),
                          link: $(this).attr('href')
                      };
                      return term;
                  }).get();
                  scheduleByDate[date] = terms;
              });

              let cinemaName = cinemaList[i];
              schedule[cinemaName] = scheduleByDate;
          });
          return schedule;
        })
        .catch(err => 
          logger.error(`Error while scraping schedule from [${movieURL}]: ${err}`)
        );
}

/** @returns dictionary with movie data scraped from @param movieURL */
async function scrapeMovieInfo(movieURL) {
    return fetch(movieURL)
        .then((response) => response.text())
        .then(async htmlString => {
            const $ = cheerio.load(htmlString);
            let tbody = $('table.info_movie > tbody');
            let movieInfo = tbody.find('tr > td').map(function(i, el) {
                return $(this).text();
            }).get();

            let titleHR = $('div.movie_title.txt > div.title_box > h1').text().trim();
            let title = parseMovieInfoFromString(movieInfo[0]);

            let columns = movieInfo[1].split("|");
            let director = parseMovieInfoFromString(columns[0]);
            let genre = parseMovieInfoFromString(columns[1]);

            let cast = parseMovieInfoFromString(movieInfo[2]);

            columns = movieInfo[3].split("|");
            let runtime = parseMovieInfoFromString(columns[0]).match('[0-9]+')[0];
            let year = parseMovieInfoFromString(columns[1]);
            let country = parseMovieInfoFromString(columns[2]);
            let releaseDate = parseMovieInfoFromString(movieInfo[4]);
            let summary = movieInfo[6];

            let img = tbody.find("tr > td > span > a.fancybox").attr('href');
            img = img.substring(0, img.length - 3) + "152"; // take the thumbnail version

            let schedule = await scrapeMovieSchedule(movieURL);

            let movieItem = {
                title: title,
                titleHR: titleHR,
                year: year,
                image: img,
                runtime: runtime,
                director: director,
                genre: genre,
                cast: cast,
                country: country,
                imdbRating: '-',
                imdbLink: '-',
                schedule: schedule,
                cinestarLink: movieURL,
                summary: summary,
            };

            return movieItem;
        })
        .catch(err =>
            logger.error(`Could not scrape data from [${movieURL}]. Error: ${err}`)
        );
}


/*************************************************************/
/************************** Exports **************************/
/*************************************************************/

module.exports = {
    getLinksOfAllMovies: getLinksOfAllMovies,
    scrapeMovieInfo: scrapeMovieInfo,
    scrapeMovieSchedule: scrapeMovieSchedule,
    CINEMA_BASE_URL: CINEMA_BASE_URL,
};