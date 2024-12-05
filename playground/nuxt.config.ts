export default defineNuxtConfig({
    compatibilityDate: '2024-11-28',
    modules: ['../src/module'],
    srcDir: 'src',
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'en',
        dictionary: {
            default: ['~/app/dictionary/default.json'],
            example: '~/app/dictionary/example.json',
        },
        shallowDictionaryRef: true,
        reloadOnSetLocale: true,
        router: true,
        meta: true,
    },
    alias: {
        '@fluejs/nuxt-i18n': '../../src/module',
    },
});
