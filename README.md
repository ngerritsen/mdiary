# mdiary

A static diary generator. 📕

## Installation

```
npm install -g mdiary
```

## Generating a diary

Make sure to have the following folder structure:

```
/pages
  2019-12-30.md
  2020-07-12.md
  2020-07-13.md
```

Then run `mdiary` from the root folder. It will create a `/dist` folder next to the `/pages` folder. This is your diary website 😀 .

## Local use

If your diary is also a repository it can be convenient to install `mdiary` as a local dependency to that repo. In that case run:

```
npm install mdiary
```

Then you can use the `mdiary` command in your npm scripts or from the command line with `npx`.
