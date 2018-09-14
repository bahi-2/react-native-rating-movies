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

export const projekcije = databaseRef.child("projekcije");
