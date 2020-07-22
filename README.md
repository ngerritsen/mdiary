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

## Options

You can provide several options to customize the generation:

```
Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --locale, -l  The locale to be used for showing dates          [default: "en"]
  --title, -t   The title of your diary                       [default: "Diary"]
  --input, -i   The input folder containing markdown files    [default: "pages"]
  --output, -o  The output folder for the generated html       [default: "dist"]
```

## Local use

If your diary is also a repository it can be convenient to install `mdiary` as a local dependency to that repo. In that case run:

```
npm install mdiary
```

Then you can use the `mdiary` command in your npm scripts or from the command line with `npx`.
