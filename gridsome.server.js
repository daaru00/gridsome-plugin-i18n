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
      enablePathGeneration: true,
      routes: {}
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
    this.pagesToGenerate = []
    this.pagesToReplace = {}
    this.options.defaultLocale = options.defaultLocale || options.locales[0]

    this.pages.hooks.createPage.tap('i18n', this.createPageHook.bind(this))
    this.pages.hooks.createRoute.tap('i18n', this.createRouteHook.bind(this))
    this.pages.hooks.pageContext.tap('i18n', this.pageContextHook.bind(this))

    api.createManagedPages(this.createManagedPages.bind(this))
  }

    /**
   * Create manage pages
   *
   * @param {function} param.findPages
   * @param {function} param.createPage
   */
  createManagedPages({ createPage, removePage }) {

    // Create custom localized routes
    this.options.locales.forEach(locale => {
      const routes = this.options.routes[locale]
      if (!routes) {
        return
      }
      
      routes.forEach(customRoute => {
        customRoute.route = customRoute.route || {}
        customRoute.route.meta = customRoute.route.meta || {}
        customRoute.route.meta.locale = locale
    
        customRoute.context = customRoute.context || {}
        customRoute.context.locale = locale
    
        createPage(customRoute);
      })
    
    })

    // Disallow the automatic creation of the localized routes
    if (this.options.enablePathGeneration === false) return;
    
    // Create new pages
    for (const page of this.pagesToGenerate) {
      createPage(page)
    }
    // Edit existing pages
    for (const pageId in this.pagesToReplace) {
      const page = this.pagesToReplace[pageId]
      removePage(pageId)
      createPage(page)
    }

    // Set correct locale for unknown (404) pages with locale segment
    const pageFor404 = this.pages.findPage({ path: '/404' });
    if (pageFor404) {
      const route = this.pages.getRoute(pageFor404.internal.route)
      let componentPathFor404 = route.component;

      for (const locale of this.options.locales) {
        const pathSegment = this.options.pathAliases[locale] || locale
        createPage({
          path: `/${pathSegment}/:slug+`,
          component: componentPathFor404,
          context: {
            locale
          },
          route: {
            meta: {
              locale
            }
          }
        })
      }
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
      return options
    }
    options.context.locale = this.options.defaultLocale

    // Retrieve current route
    const route = this.pages.getRoute(options.internal.route)

    // Create a page clone on a path with locale segment
    for (const locale of this.options.locales) {
      const pathSegment = this.options.pathAliases[locale] || locale
      this.pagesToGenerate.push({
        path: this.mergePathParts(pathSegment, options.path),
        component: route.component,
        context: Object.assign({}, options.context || {},{
          locale: `${locale}`
        }),
        route: {
          name: route.name ? `${route.name}__${locale}` : undefined,
          meta: Object.assign({}, options.meta || {}, route.internal.meta || {}, {
            locale: `${locale}`
          })
        },
        queryVariables: options.internal.queryVariables
      })
    }

    // need to removed and created again for these pages
    if (options.path !== '/404' && options.internal.isDynamic === false && options.internal.isManaged === false) {
      this.pagesToReplace[options.id] = {
        path: options.path,
        component: route.component,
        context: Object.assign({}, options.context || {},{
          locale: this.options.defaultLocale
        }),
        route: {
          name: route.name,
          meta: Object.assign({}, options.meta || {}, route.internal.meta || {}, {
            locale: this.options.defaultLocale
          })
        },
        queryVariables: options.internal.queryVariables
      }
    }

    return options
  }

  /**
   * Hook into create page context
   *
   * @param {*} options
   */
  pageContextHook(context) {
    if (!context.locale) {
      context.locale = this.options.defaultLocale
    }
    return context
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
      options.internal.meta.locale = this.options.defaultLocale
    }

    return options
  }

}

module.exports = VueI18n
