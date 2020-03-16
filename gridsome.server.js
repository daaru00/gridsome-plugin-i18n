const path = require('path')

class VueI18n {
  /**
   * Default plugin options
   */
  static defaultOptions () {
    return {
      locales: [],
      pathAliases: [],
      defaultLocale: null,
      i18n: {}
    }
  }

  /**
   * 
   * @param {*} api 
   * @param {*} options 
   */
  constructor (api, options) {
    this.api = api
    this.pages = api._app.pages
    this.options = options
    this.options.defaultLocale = options.defaultLocale || options.locales[0]
    api.createManagedPages(this.createManagedPages.bind(this))
  }

  /**
   * Create manage pages
   * 
   * @param {function} param.findPages
   * @param {function} param.createPage
   */
  createManagedPages({ findPages, createPage }) {
    // List all pages
    const pages = findPages();
    for (const page of pages) {
      // Load page's route
      const route = this.pages.getRoute(page.internal.route)
      for (const locale of this.options.locales) {
        // Create a page clone on a path with locale segment
        const pathSegment = this.options.pathAliases[locale] || locale
        createPage({
          path: path.join(`/${pathSegment}/`, route.path),
          component: route.component,
          context: {
            locale:  `${locale}`
          }
        })
      }
      // Set default locale on pages without locale segment
      page.context = Object.assign(page.context || {}, {
        locale: this.options.defaultLocale
      })
    }
  }

}

module.exports = VueI18n
