/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const fetch = require('node-fetch');
const cheerio = require('cheerio');


/*************************************************************/
/************************** Constants ************************/
/*************************************************************/

/** Dictionary containing links for each cinema. */
const cinemaLinks = {
    "CineStar Zagreb": "https://www.blitz-cinestar.hr/cinestar-zagreb",
    "CineStar Zagreb (Branimir centar)": "https://www.blitz-cinestar.hr/cinestar-zagreb",
    "CineStar Novi Zagreb (Avenue mall)": "https://www.blitz-cinestar.hr/cinestar-novi-zagreb",
    "CineStar Arena IMAX (Arena centar)": "https://www.blitz-cinestar.hr/cinestar-arena-imax",
    "CineStar Joker Split": "https://www.blitz-cinestar.hr/cinestar-joker-split",
    "CineStar 4DX Mall of Split ": "https://www.blitz-cinestar.hr/cinestar-4dx-mall-of-split",
    "CineStar Rijeka 4DX (Tower Center)": "https://www.blitz-cinestar.hr/cinestar-rijeka-4dx",
    "CineStar Zadar (City Galleria)": "https://www.blitz-cinestar.hr/cinestar-zadar",
    "CineStar Šibenik (Dalmare centar)": "https://www.blitz-cinestar.hr/cinestar-sibenik",
    "CineStar Osijek (Portanova centar)": "https://www.blitz-cinestar.hr/cinestar-osijek",
    "CineStar Varaždin (Lumini centar)": "https://www.blitz-cinestar.hr/cinestar-varazdin",
    "CineStar Dubrovnik (Dvori Lapad)": "https://www.blitz-cinestar.hr/cinestar-dubrovnik",
    "CineStar Sl. Brod (City Colosseum)": "https://www.blitz-cinestar.hr/cinestar-slavonski-brod",
    "CineStar Vukovar (K Centar Golubica)": "https://www.blitz-cinestar.hr/cinestar-vukovar",
    "CineStar Mostar (Mepas Mall)": "https://www.blitz-cinestar-bh.ba/cinestar-mostar",
    "CineStar Bihać (Bingo centar)": "https://www.blitz-cinestar-bh.ba/cinestar-bihac",
    "CineStar Tuzla (Bingo City Center)": "https://www.blitz-cinestar-bh.ba/cinestar-tuzla",
}

/** Root URL of the cinema */
const CINEMA_BASE_URL = "https://www.blitz-cinestar.hr/";
/** Root URL of the rating website */
const IMDB_BASE_URL = "https://www.imdb.com/title/";

const firebase = require('firebase');

var firebaseConfig = {
    apiKey: "AIzaSyAQ9M1m6I3rp6mkuLWsRpBZ6nM3KPaFrgQ",
    authDomain: "cinestar-rating.firebaseapp.com",
    databaseURL: "https://cinestar-rating.firebaseio.com",
    projectId: "cinestar-rating",
    storageBucket: "",
    messagingSenderId: "976755790129"
};

firebase.initializeApp(firebaseConfig);

const databaseRef = firebase.database().ref();

const moviesRef = databaseRef.child("movieData");

/*************************************************************/
/************************** Script ***************************/
/*************************************************************/

updateFirebaseMovies().then(process.exit());


/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

async function getAllMovies() {
    let allMovies = [];
    let distinctTitles = new Set();
    for (day = 0; day < 7; day++) {
        for (cinema in cinemaLinks) {
            cinemaLink = cinemaLinks[cinema];
            let movies = await getMovieItems(cinemaLink, day);
            for (movie of movies) {
                if (!distinctTitles.has(movie.titleEN)) {
                    allMovies.push(movie);
                    distinctTitles.add(movie.titleEN);
                }
            }
        }
    }

    // add the ratings
    for (movieItem of allMovies) {
        // trying both the api and manual scraping
        let id = await getIMDBIdApi(movieItem);
        if (!id) {
            id = await scrapeIMDBId(movieItem);
            if (!id) continue;
        };
        let imdbLink = IMDB_BASE_URL + id;
        movieItem.imdbLink = imdbLink;
        let rating = await getIMDBRating(imdbLink);
        movieItem.imdbRating = rating;
    }

    return allMovies;
}

/** Auxilliary function which formats the date for for cinestar's url encoding. */
function formatDate(date) {
    return date.toISOString().slice(0, 10).replace("-", "").replace("-", "");
}

/** Auxilliary function which calculates the date based on the offset of days. */
function getDate(offset = 0) {
    let date = new Date();
    date.setDate(date.getDate() + offset);
    return formatDate(date);
}

async function parseMovieItems(htmlString) {
    // parsiramo html u konstantu koja podsjeća na JQuery (kao i njena uporaba)
    const $ = cheerio.load(htmlString);

    // lista svih kartica o filmu 
    // kartica ima: 1) tablicu informacija o filmu
    //              2) td.cover sa slikom
    //              3) div.scheduleBody_sub2 rasporeda prikaza
    let movieBoxList = $('div.movie_box');

    // 1) lista svih tablica informacija, sadrži sav text
    let tbodies = movieBoxList.find("table.info_movie_list > tbody");

    var movieItems = []; // završna lista koja će se prikazivati na ekranu

    tbodies.each(async function(index, tbody) {
        // array informacija o jednom filmu
        let movieInfo = [];
        // puni movieInfo sa svim dostupnim field-ovima
        $(this).find('td > a:nth-child(1)')
            .each((index, item) => movieInfo.push(item.firstChild.data));

        let runtime = $(this).text().match(/Trajanje: ([0-9])+/g)[0].match(/[0-9]+/g)[0];

        // nađe sliku povezanu sa tim filmom skačući po DOM-u
        let cover = $(this).parent().parent().prev();
        let img = cover.find('img').attr('src');
        // iz slike također uzmemo href atribut
        let cinestarLink = cover.find('a').attr('href');

        // lista rasporeda prikaza
        let scheduleList = $(this).parent().parent().parent().parent().parent().next();
        var schedule = [];
        scheduleList
            .find('div.scheduleItem > div.vrijeme_sub > div.termin > a.tips')
            .each(async function(index, tag) {
                schedule.push({
                    time: $(this).text(),
                    link: $(this).attr('href')
                })
            });

        // extract-amo varijable iz array-a informacija
        let movieItem = {
            titleHR: movieInfo[0],
            titleEN: movieInfo[1],
            image: img,
            runtime: runtime,
            director: movieInfo[2],
            genre: movieInfo[3],
            // actors: movieInfo[],
            // country: movieInfo[],
            imdbRating: '-',
            schedule: schedule,
            cinestarLink: cinestarLink,
            imdbLink: '-',
        };

        // only display movies that have at least one play
        if (schedule.length !== 0) {
            movieItems.push(movieItem);
        }
    })
    return movieItems;
}

async function getMovieItems(cinemaURL, day) {
    return fetch(cinemaURL + "/" + getDate(day))
        .then((response) => response.text())
        .then(async (htmlString) => {
            return await parseMovieItems(htmlString);
        })
        .catch((error) => {
            console.error("Error while fetching resources from cinestar: " + error);
        });
}

function updateFirebaseSchedule() {}

async function updateFirebaseMovies() {
    moviesRef.remove();
    // get new data & SAVE
    let movieItems = await getAllMovies();
    for (movieItem of movieItems) {
        console.log(movieItem);

        let newRef = moviesRef.child(movieItem.titleEN);
        newRef.set({
            genre: movieItem.genre,
            image: movieItem.image,
            imdbLink: movieItem.imdbLink ? movieItem.imdbLink : '-',
            imdbRating: movieItem.imdbRating ? movieItem.imdbRating : '-',
            director: movieItem.director,
            titleEN: movieItem.titleEN,
            titleHR: movieItem.titleHR,
            runtime: movieItem.runtime,
        });
    }
}


function getIMDBRatingApi(name, year = null) {
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
            console.log(error);
        });

    if (rating) return rating;

    // Maybe the movie is from last year, but don't recurse further
    if (year === currentYear) {
        return getIMDBRating(name, year - 1)
    }
}

function scrapeIMDBId(movieItem, year = null) {
    let currentYear = (new Date()).getFullYear();
    year = year ? year : currentYear;

    const IMDB_SEARCH_URL = "https://www.imdb.com/search/title?";
    const title = movieItem.titleEN.trim().split(" ").join("+");
    const run1 = movieItem.runtime - 10;
    const run2 = parseInt(movieItem.runtime) + 10;
    const FULL_URL = `${IMDB_SEARCH_URL}title=${title}&runtime=${run1},${run2}&release_date=${currentYear-2}-01-01,${currentYear}-12-31`;
    return fetch(encodeURI(FULL_URL))
        .then(response => response.text())
        .then(htmlString => {
            const $ = cheerio.load(htmlString);
            let href = $('#main > div > div.lister.list.detail.sub-list > div > div:nth-child(1) > div.lister-item-content > h3 > a').attr('href');
            let id = href.match(/tt[0-9]+/g)[0];
            return id;
        })
        .catch(err=>{
            console.log(`Error while scraping IMDB id for ${movieItem.titleEN}: ${err}`);
            return null;
        });
}

function getIMDBIdApi(movieItem, year = null) {
    const API_KEY = 'c9604839';
    //Make year equal to current year if not specified otherwise
    let currentYear = (new Date()).getFullYear();
    year = year ? year : currentYear;
    let id = fetch(encodeURI('http://www.omdbapi.com/?t=' + movieItem.titleEN +
            '&y=' + year +
            '&apikey=' + API_KEY))
        .then(response => response.json())
        .then(json => json.imdbID)
        .catch((error) => {
            console.log(`Error while getting IMDB id (API approach) for ${movieItem.titleEN}: ${err}`);
            return null;
        });

    if (id) return id;

    // Maybe the movie is from last year, but don't recurse further
    if (year === currentYear) {
        return getIMDBIdApi(movieItem, year - 1)
    }
}

function getIMDBRating(link) {
    return fetch(link)
        .then(response => response.text())
        .then(htmlString => {
            // parsiramo html u konstantu koja podsjeća na JQuery (kao i njena uporaba)
            const $ = cheerio.load(htmlString);
            let rating = $('#title-overview-widget > div.vital > div.title_block > div > div.ratings_wrapper > div.imdbRating > div.ratingValue > strong > span');
            return rating.text();
        });
}