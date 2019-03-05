/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const firebase = require('firebase');
const { logger } = require('../util/logger.js');


/*************************************************************/
/************************** Constants ************************/
/*************************************************************/

/** Firebase configuration needed to initialize a connection. */
var firebaseConfig = {
    apiKey: "AIzaSyAQ9M1m6I3rp6mkuLWsRpBZ6nM3KPaFrgQ",
    authDomain: "cinestar-rating.firebaseapp.com",
    databaseURL: "https://cinestar-rating.firebaseio.com",
    projectId: "cinestar-rating",
    storageBucket: "",
    messagingSenderId: "976755790129"
};

firebase.initializeApp(firebaseConfig);
const databaseRef = firebase.database().ref()

const MOVIE_REF_NAME = 'movies';
const movieRef = databaseRef.child(MOVIE_REF_NAME);

const SCHEDULE_REF_NAME = 'schedule';
const scheduleRef = databaseRef.child(SCHEDULE_REF_NAME);

/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

async function addMovieToFirebase(movieItem) {
    let title = movieItem.title;
    if (await movieExists(title)) {
        logger.warn(`Warning: ${title} is already in the database. Skipping...`);
    } else {
        await movieRef
               .child(title)
               .set({...movieItem, schedule: null});
        logger.info(`Successfully added ${title} to movie database.`);
    }
}


async function updateSchedule(movieItem) {
    for (let cinemaName in movieItem.schedule) {
        let cinemaSchedule = movieItem.schedule[cinemaName];
        for (let date in cinemaSchedule) {
            let term = cinemaSchedule[date];
            await scheduleRef
                      .child(cinemaName)
                      .child(date)
                      .child(movieItem.title)
                      .set(term);
        }
    }
    logger.info(`Successfully updated schedule for ${movieItem.title}.`);
}

function movieExists(title) {
    return movieRef
        .once("value")
        .then(snapshot => snapshot.child(title).exists());
}


/*************************************************************/
/************************** Exports **************************/
/*************************************************************/

module.exports = {
    /** Database references **/
    databaseRef: databaseRef,
    movieRef: movieRef,
    scheduleRef: scheduleRef,
    
    /** Functions **/
    addMovieToFirebase: addMovieToFirebase,
    updateSchedule: updateSchedule,
    movieExists: movieExists,
}