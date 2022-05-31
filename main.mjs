// @ts-check
const { validateMnemonic, wordlists, getDefaultWordlist } = require('bip39');
const allWords = wordlists[getDefaultWordlist()];
const levenshtein = require('js-levenshtein')

function filterUniqueAndValid(mnemonics = [['a']]) {
  return [...new Set(mnemonics.map(m => m.join(' ')))].filter(m => validateMnemonic(m))
}

window.form.addEventListener('submit', event => {
  try {
    event.preventDefault();

    /** @type {string} */
    const invalidMnemonic = window.invalidMnemonic.value
      .trim()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ');

    if (invalidMnemonic.split(' ').length % 3 !== 0) throw new Error('Mnemonic length is invalid');

    const wordCounts = invalidMnemonic.split(' ').reduce((agg, word) => {
      agg[word] = (agg[word] || 0) + 1
      return agg
    }, {})
    const dupeWords = Object.entries(wordCounts).filter(([word, count]) => count > 1).map(([word, count]) => word)


    const nearbySwap = invalidMnemonic.split(' ').map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], word, ...arr.slice(ix + 2)] ).slice(0, -1)
    const doubleNearbySwap = nearbySwap.flatMap(m => m.map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], word, ...arr.slice(ix + 2)] ).slice(0, -1))
    const furtherSwap = invalidMnemonic.split(' ').map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], arr[ix + 2], word, ...arr.slice(ix + 3)] ).slice(0, -2)
    const possibleSwapMnemonics = [
      ...nearbySwap,
      ...doubleNearbySwap,
      ...furtherSwap,
    ]


    const possibleTypoMnemonics = invalidMnemonic.split(' ').flatMap((word, ix, arr) => {
      return allWords.filter(altWord => levenshtein(word, altWord) === 1)
        .map(altWord => [...arr.slice(0, ix), altWord, ...arr.slice(ix + 1)])
    })
    const possibleDoubleTypoMnemonics = invalidMnemonic.split(' ').flatMap((word, ix, arr) => {
      return allWords.filter(altWord => levenshtein(word, altWord) === 2)
        .map(altWord => [...arr.slice(0, ix), altWord, ...arr.slice(ix + 1)])
    })

    window.out.textContent = [
      `Possibly mistakenly duplicated words:\n${dupeWords.join('\n')}`,
      `Possible mnemonics with swapped nearby words:\n${filterUniqueAndValid(possibleSwapMnemonics).join('\n')}`,
      `Possible mnemonics with one typo:\n${filterUniqueAndValid(possibleTypoMnemonics).join('\n')}`,
      `Possible mnemonics with one word with two typos:\n${filterUniqueAndValid(possibleDoubleTypoMnemonics).join('\n')}`,
    ].join('\n\n\n')
  } catch (err) {
    window.out.textContent = err;
  }
});
