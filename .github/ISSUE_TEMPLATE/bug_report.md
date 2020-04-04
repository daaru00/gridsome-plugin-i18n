---
name: Bug report
about: Create a report to help plugin improvement and stability
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete the following information):**
 - OS: [e.g. iOS]
 - NodeJS Version [e.g. v10.19.0]
 - Gridsome Version Version [e.g. 0.7.13 ]
 - Browser [e.g. chrome, firefox, safari]
 - Plugin Version [e.g. 1.1.1]

**Plugin configuration**
```js
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
```
