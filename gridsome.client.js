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
}
