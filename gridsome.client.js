import VueI18n from 'vue-i18n'
/**
 * i18n client plugin initialization
 *
 * @param Vue
 * @param options
 */
export default function (Vue, options, { appOptions, router, head }) {
  // Setup options fallback
  options.defaultLocale = options.defaultLocale || options.locales[0]
  options.fallbackLocale = options.fallbackLocale || options.defaultLocale

  // Add VueI18n plugin to Vue instance
  Vue.use(VueI18n)
  const i18n = new VueI18n(Object.assign(options, {
    locale: options.defaultLocale
  }))
  appOptions.i18n = i18n

  // Translate path to correct
  function translatePath(pathToResolve, targetLocale, forceChange) {
    targetLocale = targetLocale || i18n.locale
    if (!targetLocale) {
      return pathToResolve
    }

    // Check path segments
    if (!pathToResolve.startsWith('/')) {
      pathToResolve = '/' + pathToResolve
    }
    const pathSegment = options.pathAliases[targetLocale] || targetLocale
    const pathPrefix = '/' + pathSegment

    // if path already contain path prefix skip rewrite
    const pathToResolveSegments = pathToResolve.split('/')
    const pathToResolveLocale = options.locales.find(locale => {
      const pathSegment = options.pathAliases[locale] || locale
      // First element is an empty string, second is the first path segment
      return pathToResolveSegments[1] === pathSegment
    })

    if (pathToResolveLocale !== undefined){
      if (forceChange !== true) {
        return pathToResolve
      }
      pathToResolve = pathToResolveSegments.slice(2).join('/')
      if (!pathToResolve.startsWith('/')) {
        pathToResolve = '/' + pathToResolve
      }
    }

    return pathPrefix + pathToResolve
  }

  // Add translate path helper
  Vue.prototype.$tp = translatePath

  // Change locale based on route meta tag
  router.beforeEach((to, from, next) => {
    // Change locale
    if ((to.meta && to.meta.locale) && to.meta.locale !== i18n.locale) {
      i18n.locale = to.meta.locale
    }
    next()
  })

  function conditionalLangAttrUpdate(updateFunction) {
      const lang = i18n.locale || options.defaultLocale;
      updateFunction(lang);
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

    // On route load, set the correct lang attribute for html tag using the current locale
    conditionalLangAttrUpdate((lang) => head.htmlAttrs = {lang: lang});

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

  // Update the lang attribute on each route change:
  // head.htmlAttrs = { 'lang' : lang } doesn't seem to work dynamically here, only on page change or refresh
  router.afterEach(() => {
    conditionalLangAttrUpdate((lang) => document.documentElement.setAttribute('lang', lang))
  })
}
