const { validateMnemonic, wordlists, getDefaultWordlist } = require('bip39');
const allWords = wordlists[getDefaultWordlist()];

window.form.addEventListener('submit', event => {
  try {
    event.preventDefault();

    const partialMnemonic = window.partialMnemonic.value
      .trim()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ');

    if (partialMnemonic.split('?').length - 1 < 1) throw new Error('No missing word marked with "?" in mnemonic');
    if (partialMnemonic.split('?').length - 1 > 1) throw new Error('Mnemonic should only contain one missing word marked with "?"');
    if (partialMnemonic.split(' ').length % 3 !== 0) throw new Error('Mnemonic length is invalid');

    const possibleMnemonics = allWords
      .map(w => partialMnemonic.replace('?', w))
      .filter(m => validateMnemonic(m));

    if (possibleMnemonics.length <= 0) throw new Error('Mnemonic is invalid - probably contains invalid words or has invalid length');

    window.out.textContent = `Possible mnemonics:\n${possibleMnemonics.join('\n')}`;
  } catch (err) {
    window.out.textContent = err;
  }
});
