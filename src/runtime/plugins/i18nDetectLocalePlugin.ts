import {
    defineNuxtPlugin,
    useAppConfig,
    useRequestEvent,
} from '#imports';
import type { I18nAppConfig } from '../../types';
import type { H3Event } from 'h3';

const detectLocale = (
    i18nConfig: I18nAppConfig,
    event?: H3Event,
    navigator?: Navigator,
) => {
    let locale: string | undefined;
    let languages: string[] = [];

    if (event) {
        const acceptLanguageHeader = event?.node?.req?.headers?.['accept-language'];

        if (!acceptLanguageHeader) {
            return i18nConfig.defaultLocale;
        }

        languages = acceptLanguageHeader
            .split(',')
            .map((part) => part.split(';')[0]);
    } else if (navigator) {
        languages = [...navigator.languages];
    }

    if (i18nConfig.localeLanguages) {
        locale = languages.find((lang) => i18nConfig.localeLanguages?.[lang]);
    }

    if (!locale) {
        locale = languages.find((lang) => i18nConfig.locales.includes(lang));
    }

    return locale || i18nConfig.defaultLocale;
};

export default defineNuxtPlugin({
    name: 'i18nDetectLocale',
    setup(nuxtApp) {
        const event = useRequestEvent();
        const { i18nConfig } = useAppConfig();

        nuxtApp.hook('i18n:detectLocale', (locale) => {
            locale.value = detectLocale(i18nConfig, event, navigator);
        });
    },
});
