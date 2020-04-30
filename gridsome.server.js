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
  constructor(api, options) {
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
  createManagedPages ({ findPages, createPage, removePage }) {
    // List all pages
    const pages = findPages();
    for (const page of pages) {
      // Load page's route
      let _hasParams = false

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

        // define path & context
        let _path = `/${pathSegment}/`;
        let _context = Object.assign({}, page.context, {
          locale: `${locale}`
        })
        let _meta = { locale: `${locale}` };
        // check if exist parameters - need to improve this rotine
        var queryString = route.path.split('/')
        queryString.map(r => {
          if (r[0] === ':') {
            const _tempParam = page.internal && page.internal.queryVariables && page.internal.queryVariables[r.split(':')[1]] ? page.internal.queryVariables[r.split(':')[1]] : null
            if (_tempParam) {
              _hasParams = true;
              _path += '/' + _tempParam;
              _context[r.split(':')[1]] = _tempParam;
              _meta[r.split(':')[1]] = _tempParam;
            }
          } else {
            _path += r;
          }
        })

        createPage({
          path: _path,
          component: route.component,
          context: _context,
          route: {
            meta: _meta
          }
        })
      }

      if (!_hasParams) {
        // Set default locale on pages without locale segment
        const oldPage = Object.assign({}, page)
        removePage(page.id)
        createPage({
          path: oldPage.path,
          component: route.component,
          context: Object.assign({}, oldPage.context || {}, {
            locale: this.options.defaultLocale
          }),
          route: {
            meta: {
              locale: this.options.defaultLocale
            }
          }
        })
      }
    }
  }

  /**
   * Hook into create route process
   * 
   * @param {*} options
   */
  createRouteHook (options) {
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
