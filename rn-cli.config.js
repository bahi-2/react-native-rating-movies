/** React Native packager blacklists folders defined here from bundling. */

const blacklist = require('metro-config/src/defaults/blacklist');

var config = {
  getBlacklistRE(platform) {
    return blacklist(platform, [
      /src\/serverSide\/.*/
    ]);
  }
};

module.exports = config;