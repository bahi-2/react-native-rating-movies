/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const cinestar = require('./scrapers/cinestar.js');
const imdb = require('./scrapers/imdb.js');
const progress = require('./util/progressBar.js');
const firebase = require('./storage/firebase.js');
const { logger } = require('./util/logger.js');


/*************************************************************/
/************************** Execution ************************/
/*************************************************************/
updateFirebase()
    .then(() => process.exit(0))
    .catch(err => {
        console.log('\nCritical error occurred, check the logs.');
        logger.log({
            level: 'critical',
            message: err,
            traceback: err.stack,
        });
        logger.error('Critical: ' + err);
        process.exit(1);
    });

/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

/** Enters new movie&schedule data in the database. */
async function updateFirebase() {
    logger.info("Started firebase update job.");

    let links = await cinestar.getLinksOfAllMovies();
    logger.info("Success fetching all cinestar links.");

    let current = 0;
    let total = links.length;

    console.log("Scraping and saving movie data to firebase:");
    for (let link of links) {
        progress.printProgressBar(current, total);
        current++;

        let movieItem = await cinestar.scrapeMovieInfo(link);

        let movieExists = await firebase.movieExists(movieItem.title);
        if (!movieExists) {
            movieItem = await imdb.addIMDBValuesToMovie(movieItem);
            await firebase.addMovieToFirebase(movieItem);
        }
        await firebase.updateSchedule(movieItem);
    }
    progress.printProgressBar(total, total);
    logger.info("Successfully updated the database.");
}