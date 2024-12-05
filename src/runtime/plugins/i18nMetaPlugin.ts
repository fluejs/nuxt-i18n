import {
    defineNuxtPlugin,
    useAppConfig,
    useNuxtApp,
    useRoute,
    useHead,
    useRequestURL,
} from '#imports';
import { trailingSlash } from '../../utils/trailingSlash';
import { useLocaleRouteHelpers } from '../composables/useLocaleRouteHelpers';

const joinUrl = (origin: string, path: string) => {
    return `${trailingSlash(origin)}${path}`;
};

export default defineNuxtPlugin({
    name: 'i18nMeta',
    dependsOn: ['i18n'],
    setup(nuxtApp) {
        const route = useRoute();
        const { i18nConfig } = useAppConfig();
        const { $i18n } = useNuxtApp();
        const { routePathApplyLocale } = useLocaleRouteHelpers();

        nuxtApp.hook('app:rendered', () => {
            const origin = i18nConfig.metaOrigin || useRequestURL().origin;

            useHead({
                link: i18nConfig.locales.map((locale) => (
                    locale === $i18n.locale.value ? {
                        rel: 'canonical',
                        href: joinUrl(origin, route.path),
                    } : {
                        rel: 'alternate',
                        hreflang: locale,
                        href: joinUrl(origin, routePathApplyLocale(route.path, locale)),
                    }
                )),
            });
        });
    },
});
