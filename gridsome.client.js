import VueI18n from 'vue-i18n'
/**
 * i18n client plugin initialization
 * 
 * @param Vue
 * @param options
 */
export default function (Vue, options, { appOptions, router }) {  
  // Setup options fallback
  options.defaultLocale = options.defaultLocale || options.locales[0]
  options.fallbackLocale = options.fallbackLocale || options.defaultLocale

  // Add VueI18n plugin to Vue instance
  Vue.use(VueI18n)
  const i18n = new VueI18n(Object.assign(options, {
    locale: options.defaultLocale
  }))
  appOptions.i18n = i18n

  // Create mixin to load locale base on context
  Vue.mixin({
    created: function () {
      if (process.isServer && !this.$ssrContext) {
        // something does not works here..
        return
      }
      const currentLocaleCode = this.$context.locale
      if (i18n.locale !== currentLocaleCode) {
        i18n.locale = currentLocaleCode
      }
    }
  })

  // Translate path to correct
  function translatePath(pathToResolve) {
    const currentLocale = i18n.locale
    if (!currentLocale) {
      return pathToResolve
    }

    // Check path segments
    if (!pathToResolve.startsWith('/')) {
      pathToResolve = '/' + pathToResolve
    }
    const pathSegment = options.pathAliases[currentLocale] || currentLocale
    const pathPrefix = '/' + pathSegment

    // if path already contain path prefix skip rewrite
    const pathToResolveSegments = pathToResolve.split('/')
    const pathToResolveLocale = options.locales.find(locale => {
      const pathSegment = options.pathAliases[locale] || locale
      // First element is an empty string, second is the first path segment
      return pathToResolveSegments[1] === pathSegment
    })

    if (pathToResolveLocale !== undefined) {
      return pathToResolve
    }

    return pathPrefix + pathToResolve
  }

  // Maintain path prefix during router change
  router.beforeResolve((to, from, next) => {
    // do not rewrite build paths
    if (process.isServer) {
      next()
      return 
    }

    // if option is disabled skip whole logic
    if (options.enablePathRewrite === false) {
      next()
      return 
    }

    const translatedPath = translatePath(to.path || '/')
    // If path is has valid locale prefix skip rewrite
    if (translatedPath === to.path) {
      next()
      return 
    }

    // Rewrite path
    next({
      path: translatePath(to.path || '/')
    })
  })

  // Add translate path helper
  Vue.prototype.$tp = translatePath
}
