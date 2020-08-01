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
        enablePathRewrite: true, // rewrite path with locale prefix, default: true
        rewriteDefaultLanguage: true, // rewrite default locale, default: true
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

- Type: `object`

Declaration of JSON messages files, for more info check [VueI18n's doc](https://kazupon.github.io/vue-i18n/guide/formatting.html).

#### pathAliases

- Type: `object`

A list of locale's path segment to use, if not provided the locale code will be use to generate url.

#### fallbackLocale

- Type: `string`

Language to use when your preferred language lacks a translation, for more info check [VueI18n's doc](https://kazupon.github.io/vue-i18n/guide/fallback.html).

#### defaultLocale

- Type: `string`
- Default: first locale

Default locale to use in page's path without locale segment in it.

#### enablePathRewrite

- Type: `boolean`
- Default: `true`

Enable automatic rewrite of path for Vue Router.

#### rewriteDefaultLanguage

- Type: `boolean`
- Default: `true`

Enable path rewrite for default language.

#### enablePathGeneration

- Type: `boolean`
- Default: `true`

Enable translated path automatic generation. Disabling this no additional pages are generated, just include i18n Vue Plugin and let you to manage translated path generation.

#### routes

- Type: `object`
- Default: `{}`

Routes to generate using a custom path.

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

### Route translation

If you want to translate the path of pages for each language, you first need to disable the automatic path generation:
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
        enablePathGeneration: false // disable path generation
      }
    }
  ]
};
```
now you can manually add your routes declaration for each languages. 

It is recommended to use a separate file in order not to enlarge the configuration file, add a file named `routes.js` in the root directory of your project:
```js
module.exports = {
  en: [
    {
      path: '/en/',
      component: './src/pages/Index.vue'
    },
    {
      path: '/en/about/',
      component: './src/pages/About.vue'
    }
  ],
  it: [
    {
      path: '/',
      component: './src/pages/Index.vue'
    },
    {
      path: '/it/chi-siamo/',
      component: './src/pages/About.vue'
    }
  ]
};
```
then load this route file into Gridsome configuration file:
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
        enablePathGeneration: false, 
        routes: require('./routes.js') // load path translation declaration from external file
      }
    }
  ]
};
```
this plugin will generate pages based on provided configurations.

### Route translation using remote routing system

If you have a large project and you manage your page path from data source simply disable path generation:
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
        enablePathGeneration: false, // disable path generation
        routes: {} // disable path generation
      }
    }
  ]
};
```
set `routes` settings as an empty object or directly not set it.

Generate pages from your external source inside your `gridsome.server.js`:
```js
module.exports = function (api) {
  api.createPages(async ({ createPage, graphql }) => {
    
    // query your data source to retrieve pages
    const response = await graphql(`
      query {
        mysource {
          PageItems {
            items {
              id
              name,
              path,
              slug
            }
          }
        }
      }
    `)

    if (response.errors) {
      throw response.errors[0]
    }

    // generate pages from query response
    response.data.mysource.PageItems.items.forEach((page) => {
      createPage({
        path: page.path || page.slug, // here you can handle page's path
        component: './src/templates/DynamicPage.vue',
        context: {
          id: page.id,
          locale: page.locale // set page locale for context variable (used for GraphQL queries)
        },
        route: {
          meta: {
            locale: page.locale // set page locale for frontend routing
          }
        }
      })
    })
  })
}
```
this give you the complete control of routes path translation and management.

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
your data source need to support query based on locale.

### Hot reload

When is messages are declared `gridsome.config.js` will be read once during Gridsome startup and will not be watched by webpack dev server (being outside ./dist folder).

In order to enable hot reload remove messages from `gridsome.config.js`:
```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        // ...
        messages: {}
      }
    }
  ]
};
```
and load it from `main.js` file:
```js
export default function (Vue, { appOptions }) {
  // ...
  appOptions.i18n.setLocaleMessage('it-it', require('./locales/it-it.json'))
  appOptions.i18n.setLocaleMessage('fr-fr': require('./locales/fr-fr.json'))
  appOptions.i18n.setLocaleMessage('de-de': require('./locales/de-de.json'))
  appOptions.i18n.setLocaleMessage('en-gb': require('./locales/en-gb.json'))
}
```
this will use i18n [setLocaleMessage](https://kazupon.github.io/vue-i18n/api/#setlocalemessage-locale-message) API to load message from client side. 
Now messages files are included in webpack bundle and a file change will trigger a page reload having a better development experience.

### Link routing integration

This plugin will add an additional logic to Vue Router when resolving paths, for example is you are using a link like this:
```html
<g-link to="/projects/">Projects</g-link>
```
the resolved route will be found checking for current locale set and add the appropriate path prefix like `/en/projects/`.

It's possible to disable this feature and manage routing on your own:
```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-i18n",
      options: {
        enablePathRewrite: false
      }
    }
  ]
};
```
then you have to properly add path prefix:
```html
<g-link :to="$tp('/projects/')">Projects</g-link>
```
(read more about `$tp` helper in next section)

### Locale switcher components

Here an example of a Vue component to switch locale, creating into `./src/components/LocaleSwitcher.vue`:
```html
<template>
  <select v-model="currentLocale" @change="localeChanged">
    <option v-for="locale in availableLocales" :key="locale" :value="locale">{{ locale }}</option>
  </select>
</template>

<script>
export default {
  name: "LocaleSwitcher",
  data: function () {
    return {
      currentLocale: this.$i18n.locale.toString(),
      availableLocales: this.$i18n.availableLocales
    }
  },
  methods: {
    localeChanged () {
      this.$router.push({
        path: this.$tp(this.$route.path, this.currentLocale, true)
      })
    }
  }
}
</script>
```

## Vue instance helpers

#### $tp

Is a function that accept a path as arguments and return a localized prefixed path version.
```js
// this.$i18n.locale is "en-gp"
const localizedPath = this.$tp('/projects/')
// localizedPath is "/en/projects/"
```

If a localized path prefix is already set it will returns the same path:
```js
// this.$i18n.locale is "en-gp"
const localizedPath = this.$tp('/it/projects/')
// localizedPath is "/it/projects/"
```
this in order to not create redirect loop.

This is useful for render a correct path for builded `<g-link>` directives:
```html
<g-link :to="$tp('/projects/')">Projects</g-link>
```
after build become:
```html
<a href="/en/projects/">Projects</a>
```

It's also possible to select which locale to use during translation passing to second string parameter:
```js
const localizedPath = this.$tp('/projects/', 'fr-fr')
// localizedPath is "/fr/projects/"
```
this will not works when path is already translated:
```js
const localizedPath = this.$tp('/it/projects/', 'fr-fr')
// localizedPath is "/it/projects/" <--- not changed
```

To force changing locale add a third boolean parameter:
```js
const localizedPath = this.$tp('/it/projects/', 'fr-fr', true)
// localizedPath is "/fr/projects/"
```
useful to language selector implementation.

## Use cases

Links and resources for usage with other Gridsome source and plugins

### @gridsome/source-filesystem

Refer to this issue's comments to find an example of usage with Gridsome filesystem source plugin: [#16](https://github.com/daaru00/gridsome-plugin-i18n/issues/16#issuecomment-637499454)
