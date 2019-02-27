/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const cinestar = require('./scrapers/cinestar.js');
const imdb = require('./scrapers/imdb.js');
const progress = require('./util/progressBar.js');
const firebase = require('./storage/firebase.js');


/*************************************************************/
/************************** Execution ************************/
/*************************************************************/
updateFirebase()
    .then(() => process.exit(0))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });


/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

/**  */
async function updateFirebase() {
    let links = await cinestar.getLinksOfAllMovies();
    let current = 0;
    let total = links.length;

    console.log("Scraping and saving movie data to firebase:");
    // for (link of links) {
    //     progress.printProgressBar(current, total);
    //     current++;

    //     let movieItem = await cinestar.scrapeMovieInfo(link);
    //     movieItem = await imdb.addIMDBValuesToMovie(movieItem);
    //     await firebase.addMovieToFirebase(movieItem);
    // }
    progress.printProgressBar(total, total);
}