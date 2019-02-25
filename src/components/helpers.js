/** Returns the current date in the format appropriate for cinestar's url encoding. */
export function getCurrentDate() {
	return formatDate(new Date());
}

/** Returns the date in the format appropriate for cinestar's url encoding
based on @param value which should contain a Croatian day String. 
Given an inapropriate value it return's todays date. */
export function getDateForDay(value: string) {
	let selectedDay;
	switch (value) {
	  case 'Ponedjeljak':
	    selectedDay = 1;
	    break;
	  case 'Utorak':
	    selectedDay = 2;
	    break;
	  case 'Srijeda':
	    selectedDay = 3;
	    break;
	  case 'Četvrtak':
	    selectedDay = 4;
	    break;
	  case 'Petak':
	    selectedDay = 5;
	    break;
	  case 'Subota':
	    selectedDay = 6;
	    break;
	  case 'Nedjelja':
	    selectedDay = 7;
	    break;
	  default:
	    return getCurrentDate();
	    break;
	}
	let today = new Date().getDay();
	let diff = selectedDay - today;
	let offset = diff >= 0 ? diff : (7 + diff);
	return formatDate(offsetDate(offset));
}

/** Auxilliary function which calculates the date based on the offset of days. */
function offsetDate(offset) {
	let date = new Date();
	date.setDate(date.getDate()+offset);
	return date;
}

/** Auxilliary function which formats the date for for cinestar's url encoding. */
function formatDate(date: Date) {
	return date.toISOString().slice(0,10).replace("-","").replace("-","");
}
