import VueI18n from 'vue-i18n'
/**
 * i18n client plugin initialization
 * 
 * @param Vue
 * @param options
 */
export default function (Vue, options, { appOptions, isServer }) {
  // Process only client side, if server exit earlier
  if (isServer === true) {
    return
  }
  
  // Setup options fallback
  options.defaultLocale = options.defaultLocale || options.locales[0]
  options.fallbackLocale = options.fallbackLocale || options.defaultLocale

  // Create i18n plugin
  window.Vue = Vue
  const i18n = new VueI18n(Object.assign(options, {
    locale: options.defaultLocale
  }))
  appOptions.i18n = i18n

  // Create mixin to load locale base on context
  Vue.mixin({
    created: function () {
      if (this.$context && this.$context.locale) {
        const currentLocaleCode = this.$context.locale
        if (i18n.locale !== currentLocaleCode) {
          i18n.locale = currentLocaleCode
        }
      }
    }
  })
}
