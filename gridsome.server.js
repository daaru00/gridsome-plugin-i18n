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
    this.pageToGenerate = []
    this.options.defaultLocale = options.defaultLocale || options.locales[0]
    api._app.pages.hooks.createPage.tap('i18n', this.createPageHook.bind(this))
    api._app.pages.hooks.createRoute.tap('i18n', this.createRouteHook.bind(this))
    api.createManagedPages(this.createManagedPages.bind(this))
  }

    /**
   * Create manage pages
   * 
   * @param {function} param.findPages
   * @param {function} param.createPage
   */
  createManagedPages({ createPage }) {
    for (const page of this.pageToGenerate) {
      createPage(page)
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
  createPageHook(options) {
    // prevent a hook loop
    if (options.context.locale !== undefined) {
      return
    }
    options.context.locale = this.options.defaultLocale

    // Retrieve current route
    const route = this.pages.getRoute(options.internal.route)

    // Create a page clone on a path with locale segment
    for (const locale of this.options.locales) {
      const pathSegment = this.options.pathAliases[locale] || locale
      this.pageToGenerate.push({ 
        path: path.join(`/${pathSegment}/`, options.path),
        component: route.component,
        context: Object.assign({}, options.context || {},{
          locale: `${locale}`
        }),
        route: {
          name: route.name ? `${route.name}__${locale}` : undefined,
          meta: Object.assign({}, options.meta || {},{
            locale:  `${locale}`
          })
        },
        queryVariables: options.internal.queryVariables
      })
    }

    return options
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

    if (!meta.locale) {
      // FIXME: this currently not working, using i18n internal fallback
      options.internal.meta.locale = this.options.defaultLocale
    }

    return options
  }

}

module.exports = VueI18n
