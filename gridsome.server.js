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
    api._app.pages.hooks.createRoute.tap('i18n', this.createRouteHook.bind(this))
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
        // Skip generation for default language
        if (
          locale === this.options.defaultLocale && 
          this.options.rewriteDefaultLanguage === false
        ) {
          continue
        }
        // Create a page clone on a path with locale segment
        const pathSegment = this.options.pathAliases[locale] || locale
        createPage({
          path: this.mergePathParts(pathSegment, route.path),
          component: route.component,
          context: Object.assign({}, page.context, {
            locale:  `${locale}`
          }),
          route:{
            meta: {
              locale:  `${locale}`
            }
          }
        })
      }
      // Set default locale on pages without locale segment
      const oldPage = Object.assign({}, page)
      removePage(page)
      createPage({
        path: oldPage.path,
        component: route.component,
        context: Object.assign({}, oldPage.context || {}, {
          locale: this.options.defaultLocale
        }),
        route:{
          meta: {
            locale:  this.options.defaultLocale
          }
        }
      })
    }
  }

  /**
   * Merge paths parts into one
   * 
   * @param {string} parts multiple arguments
   * @returns {string}
   */
  mergePathParts() {
    const pathParts = []
    for (var i = 0; i < arguments.length; i++) {
      let pathPart = arguments[i];
      // skip home
      if (pathPart === '/') {
        continue
      }
      // clean leading slash
      if (pathPart.endsWith('/')) {
        pathPart = pathPart.substring(0, pathPart.length - 1)
      }
      // clean trailing slash
      if (pathPart.startsWith('/')) {
        pathPart = pathPart.substring(1, pathPart.length)
      }
      // check if remain somethings
      pathParts.push(pathPart)
    }
    // defending from request to merge / and /
    if (pathParts.length === 0) {
      return '/'
    }
    // ensure leading and trailing slashes
    return '/' + pathParts.join('/') + '/'
  }

  /**
   * Hook into create route process
   * 
   * @param {*} options
   */
  createRouteHook(options) {
    const meta = options.internal.meta
    if (meta && meta.locale) {
      if (options.name === '404' && options.path !== '/404/') {
        options.name = `${options.name}__${meta.locale}`
      }
    }

    return options
  }

}

module.exports = VueI18n
