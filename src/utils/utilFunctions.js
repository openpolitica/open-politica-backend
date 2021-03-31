module.exports = {
  /**
   * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
   * See https://github.com/coolaj86/knuth-shuffle
   * @param {*} array Array to shuffle
   * @returns  Shuffled array
   */
  shuffle: function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  /**
   * Group an array of objects defined by a key on every object
   * @param {*} array Array of objects to group
   * @param {*} key key of every single object used to group
   * @returns Object with the agrupation separated by values of the key provided
   */
  groupObjectListByKey: function (array, key) {
    return array.reduce(function (r, a) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }
}
