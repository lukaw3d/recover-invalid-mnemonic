// @ts-check
const { validateMnemonic, wordlists, getDefaultWordlist } = require('bip39');
const allWords = wordlists[getDefaultWordlist()];

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

    const nearbySwap = invalidMnemonic.split(' ').map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], word, ...arr.slice(ix + 2)] ).slice(0, -1)
    const doubleNearbySwap = nearbySwap.flatMap(m => m.map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], word, ...arr.slice(ix + 2)] ).slice(0, -1))
    const furtherSwap = invalidMnemonic.split(' ').map((word, ix, arr) => [...arr.slice(0, ix), arr[ix + 1], arr[ix + 2], word, ...arr.slice(ix + 3)] ).slice(0, -2)
    const possibleSwapMnemonics = [
      ...nearbySwap,
      ...doubleNearbySwap,
      ...furtherSwap,
    ]

    window.out.textContent = [
      `Possible mnemonics with swapped nearby words:\n${filterUniqueAndValid(possibleSwapMnemonics).join('\n')}`,
    ].join('\n\n\n')
  } catch (err) {
    window.out.textContent = err;
  }
});
