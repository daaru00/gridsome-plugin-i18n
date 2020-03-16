#  Gridsome i18n plugin

[![npm](https://img.shields.io/npm/v/gridsome-plugin-i18n.svg)](https://www.npmjs.com/package/gridsome-plugin-i18n)

A [i18n](https://kazupon.github.io/vue-i18n/) plugin for [Gridsome](https://gridsome.org/).

## Install

- `yarn add gridsome-plugin-i18n`
- `npm install gridsome-plugin-i18n --save`

## Getting Started

```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        locales: [ // locales list
          'it-it',
          'fr-fr',
          'de-de',
          'en-gb'
        ],
        pathAliases: { // path segment alias for each locales
          'it-it': 'it',
          'fr-fr': 'fr',
          'de-de': 'de',
          'en-gb': 'en'
        },
        fallbackLocale: 'en-gb', // fallback language
        defaultLocale: 'en-gb', // default language
        messages: {
          'it-it': require('./src/locales/it-it.json'), // Messages files
          'fr-fr': require('./src/locales/fr-fr.json'),
          'de-de': require('./src/locales/de-de.json'),
          'en-gb': require('./src/locales/en-gb.json'),
        }
      }
    }
  ]
};
```

## Options

#### locales

- Type: `string[]` _required_

A list of all supported locales.

#### messages

- Type: `object` _required_

Declaration of JSON messages files, for more info check [VueI18n's doc](https://kazupon.github.io/vue-i18n/guide/formatting.html).

#### pathAliases

- Type: `object`

A list of locale's path segment to use, if not provided the locale code will be use to generate url.

#### fallbackLocale

- Type: `string`

Language to use when your preferred language lacks a translation, for more info check [VueI18n's doc](https://kazupon.github.io/vue-i18n/guide/fallback.html).

#### defaultLocale

- Type: `string`

Default locale to use in page's path without locale segment in it.

## Usage

This plugin will install and configure [Vue I18n](https://kazupon.github.io/vue-i18n/introduction.html), so refer to it about usage.

### URL generation

This plugin will load all pages already declared and generate pages for all locales adding a path prefix with the locale code.

For example, if you have these paths:
```
/              -> component home
/about         -> component about
/blog/article1 -> component article
/blog/article2 -> component article
```
this plugin, with these locales:
```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        locales: [
          'it-it',
          'en-gb'
        ],
      }
    }
  ]
};
```
will generate these pages:
```
/                    -> component home
/it-it/              -> component home
/en-gb/              -> component home
/en-gb/about         -> component about
/it-it/about         -> component about
/about               -> component about
/it-it/about         -> component about
/en-gb/about         -> component about
/blog/article1       -> component article
/it-it/blog/article1 -> component article
/en-gb/blog/article1 -> component article
/blog/article2       -> component article
/it-it/blog/article2 -> component article
/en-gb/blog/article2 -> component article
```

using path aliases:
```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        locales: [
          'it-it',
          'en-gb'
        ],
        pathAliases: {
          'it-it': 'it',
          'en-gb': 'en'
        },
      }
    }
  ]
};
```
will generate these pages:
```
/                 -> component home
/it/              -> component home
/en/              -> component home
/en/about         -> component about
/it/about         -> component about
/about            -> component about
/it/about         -> component about
/en/about         -> component about
/blog/article1    -> component article
/it/blog/article1 -> component article
/en/blog/article1 -> component article
/blog/article2    -> component article
/it/blog/article2 -> component article
/en/blog/article2 -> component article
```

### Content translation

This plugin will set a context property to store current locale:
```html
<template>
  <span>
    Current locale: {{ $context.locale }}
  </span>
</template>
```

Using VueI18n:
```html
<template>
  <span>
    Current locale: {{ $i18n.locale }}
  </span>
</template>
```
and translate string using `$t` helper:
```html
<template>
  <span>
    {{ $t('my-message') }}
  </span>
</template>
```

### Using with page query

You can use context property `locale` to filter page queries:
```
<page-query>
query($locale:String) {
  example {
    _allDocuments(lang:$locale) {
      edges {
        node {
          title
        }
      }
    }
  }
}
</page-query>
```

## SSR

Vue i18n does not works on server side rendering due an error on plugin's auto-registration:
> ReferenceError: window is not defined

Client plugin will not load on client side so do not use `$i18n` variable for evaluation in the component like:
```js
export default {
  computed: {
    isEnglishLanguage() {
      return this.$i18n.locale === 'en'; // this will raise and error due $i18n is undefined
    }
  }
};
```
do a proper check:
```js
export default {
  computed: {
    isEnglishLanguage() {
      return this.$i18n && this.$i18n.locale === 'en'; // this works!
    }
  }
};
```
or use `$context`:
```js
export default {
  computed: {
    isEnglishLanguage() {
      return this.$context.locale === 'en'; // this works!
    }
  }
};
```
