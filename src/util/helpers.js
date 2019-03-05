import { croatianDays } from '../config/storage.js';


/** Returns an array of movieItems which have schedules as properties */
export function mapScheduleToMovies(movieSchedules, movieItems) {
  let mappedResult = [];
  for (const movieName in movieSchedules) {
    let movieSchedule = movieSchedules[movieName];
    let movieItem = movieItems[movieName];
    movieItem['schedule'] = movieSchedule;
    mappedResult.push(movieItem);
  }
  return mappedResult;
}

/** Returns the current date in the format appropriate for cinestar's url encoding. */
export function getCurrentDate() {
  return formatDate(new Date());
}

export function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/** Returns the date (ddmm format) for day of week in Croatian. */
export function getDateForDay(value: string) {
  let dayOfWeek = croatianDays.indexOf(value) + 1;
  let today = new Date().getDay();
  let diff = dayOfWeek - today;
  let offset = diff >= 0 ? diff : (7 + diff);
  return formatDate(offsetDate(offset));
}

/** Returns the string Croatian day of the week */
export function getCurrentDay(date) {
  return croatianDays[new Date().getDay() - 1];
}

/** Auxilliary function which calculates the date based on the offset of days. */
function offsetDate(offset) {
  let date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

/** Auxilliary function which formats the date to ddmm format.
TODO: fix timezone */
function formatDate(date: Date) {
  date.setHours(date.getHours() + 1); // Timezone fix

  let dateStr = date.toISOString().slice(5,10);
  return dateStr.substring(3,5) + dateStr.substring(0, 2);
}