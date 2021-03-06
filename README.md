# Emoji Finder

> Quickly find and copy emoji to the clipboard via the command-line

- inspired by [emoj](https://www.npmjs.com/package/emoj)
- interactive UI that allows for manually composing sequences of emoji that you can copy to the clipboard
- fuzzy, offline search supporting multiple input languages (currently English and German)
- based on [unicode-emoji-data](https://www.npmjs.com/package/unicode-emoji-data) and [unicode-emoji-annotations](https://www.npmjs.com/package/unicode-emoji-annotations)
- NEW: 🤖🎓 machine learning involved (use the experimental `--dango` flag)

Works best on Mac OS. Works great on Linux after installing [Emoji One](https://github.com/eosrei/emojione-color-font#install-on-linux). [Doesn't really work on Windows](https://github.com/sindresorhus/emoj/issues/5).

## Usage

```
$ emoji-finder --help

  Usage
    $ emoji-finder [de|en]

  Options
    --dango Use dango (https://getdango.com/),
            internet connectivity required,
            sets input language to 'en'.

  Run without arguments to use the input language set in
  your environment (echo $LANG). Falls back to 'en' if
  not available or not supported.
```

## Install

`npm install -g emoji-finder`

## License

[MIT](https://github.com/dematerializer/unicode-emoji-annotations/blob/master/LICENSE)

## Development

### Status

[![Travis](https://img.shields.io/travis/dematerializer/emoji-finder.svg?style=flat-square)](https://travis-ci.org/dematerializer/emoji-finder)
[![Codecov](https://img.shields.io/codecov/c/github/dematerializer/emoji-finder.svg?style=flat-square)](https://codecov.io/gh/dematerializer/emoji-finder)
