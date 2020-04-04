const path = require('path')

class VueI18n {
  /**
   * Default plugin options
   */
  static defaultOptions () {
    return {
      locales: [],
      messages: {},
      pathAliases: {},
      defaultLocale: null,
      enablePathRewrite: true
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
   * @param {function} param.removePage
   */
  createManagedPages({ findPages, createPage, removePage }) {
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
      const oldPage = Object.assign({}, page)
      removePage(page)
      createPage({
        path: oldPage.path,
        component: route.component,
        context: Object.assign(oldPage.context || {}, {
          locale: this.options.defaultLocale
        })
      })
    }
  }

}

module.exports = VueI18n
