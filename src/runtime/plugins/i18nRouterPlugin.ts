import {
    defineNuxtPlugin,
    useAppConfig,
    useRoute,
    useRouter,
    addRouteMiddleware,
    navigateTo,
    useNuxtApp,
    useLocaleRoute,
} from '#imports';

export default defineNuxtPlugin({
    name: 'i18nRouter',
    dependsOn: ['i18n'],
    setup(nuxtApp) {
        const route = useRoute();
        const router = useRouter();
        const { i18nConfig } = useAppConfig();
        const { $i18n } = useNuxtApp();
        const { localeRoute } = useLocaleRoute();

        nuxtApp.hook('i18n:setLocale', async (locale) => {
            const newRoute = localeRoute(route, locale);

            if (i18nConfig.reloadOnSetLocale) {
                window.location.href = router.resolve(newRoute).fullPath;
            } else {
                await router.push(newRoute);
            }
        });

        // eslint-disable-next-line consistent-return
        addRouteMiddleware('i18n', (to) => {
            if (!to.params.locale) {
                return navigateTo(localeRoute(to, $i18n.locale.value));
            }
        }, {
            global: true,
        });
    },
});
