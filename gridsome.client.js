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

  // Maintain path prefix during router change
  router.beforeResolve((to, from, next) => {
    // do not rewrite build paths
    if (process.isServer) {
      next()
      return 
    }

    // if option is disabled, skip whole logic
    if (options.enablePathRewrite === false) {
      next()
      return 
    }

    // if is first page load, skip whole logic
    const currentLocale = i18n.locale
    if (!currentLocale) {
      next()
      return 
    }

    // Elaborate path prefix
    let pathToResolve = to.path || '/'
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
    
    // Path already contain a valid locale prefix, skip rewrite
    if (pathToResolveLocale !== undefined) {
      next()
      return
    }

    // Rewrite path
    next({
      path: pathPrefix + pathToResolve
    })
  })
}
