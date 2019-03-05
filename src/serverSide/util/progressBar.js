/*************************************************************/
/************************** Functions ************************/
/*************************************************************/

/** 
Prints a progress bar to STOUT. Like below:
progress: [==-----------] 11% | 10/23 
*/
function printProgressBar(current, total) {
    let lineFill = '[' + '='.repeat(current) + "-".repeat(total - current) + ']';
    let percentage = Math.floor((current * 1.0 / total) * 100);

    process.stdout.write(`\rProgress: ${lineFill} ${percentage}% | ${current}/${total}`);
    if (percentage === 100) console.log("\x1b[32m", "\nSuccess!");
}


/*************************************************************/
/************************** Exports **************************/
/*************************************************************/

module.exports = {
  printProgressBar: printProgressBar,
};