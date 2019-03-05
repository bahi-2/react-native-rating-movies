import * as firebase from "firebase";

var config = {
  apiKey: "AIzaSyAQ9M1m6I3rp6mkuLWsRpBZ6nM3KPaFrgQ",
  authDomain: "cinestar-rating.firebaseapp.com",
  databaseURL: "https://cinestar-rating.firebaseio.com",
  projectId: "cinestar-rating",
  storageBucket: "",
  messagingSenderId: "976755790129"
};

firebase.initializeApp(config);

const databaseRef = firebase.database().ref();

export const moviesRef = databaseRef.child("movies");
export const scheduleRef = databaseRef.child("schedule");

export function getAllMovies() {
  return moviesRef.once("value").then(snapshot => snapshot.val());
}

export function getSchedule(cinema, date) {
  let filteredSchedule = scheduleRef.child(cinema + "/" + date);
  return filteredSchedule.once("value")
    .then(snapshot => snapshot.val());
}