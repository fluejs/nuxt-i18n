import {
    defineNuxtPlugin,
    shallowRef,
    useAppConfig,
    useState,
    useCookie,
    useHead,
    useRoute,
    readonly,
} from '#imports';
import { i18nDictionaries } from '#build/i18nDictionaries.mjs';
import type { DictionaryParsed, I18nPluginProvider } from '../../types';
import { compile as txTagCompile } from '@fluejs/txtag';
import { plural } from '../utils/plural';

export default defineNuxtPlugin({
    name: 'i18n',
    async setup(nuxtApp) {
        const { i18nConfig } = useAppConfig();

        const locale = useCookie<string>(i18nConfig.cookieKey, {
            maxAge: i18nConfig.cookieMaxAge,
        });

        const isLocaleValid = () => i18nConfig.locales.includes(locale.value);

        if (i18nConfig.router) {
            const route = useRoute();
            const routeLocale = route.params.locale;

            if (routeLocale && locale.value !== routeLocale) {
                locale.value = String(routeLocale);
            }
        }

        if (!isLocaleValid()) {
            await nuxtApp.callHook('i18n:detectLocale', locale);

            if (!isLocaleValid()) {
                locale.value = i18nConfig.defaultLocale;
            }
        }

        const loadedDictionaryModules = useState<string[]>(
            'loadedDictionaryModules',
            () => shallowRef([]),
        );
        const dictionaryState = useState<Record<string, string>>(
            'i18nDictionaryState',
            () => i18nConfig.shallowDictionaryRef ? shallowRef({}) : ({}),
        );

        const loadDictionaryRaw = (rawData: DictionaryParsed) => {
            Object.assign(dictionaryState.value, rawData);
        };

        const loadDictionary = async (moduleName: string) => {
            if (loadedDictionaryModules.value.includes(moduleName)) {
                return;
            }

            if (!(moduleName in i18nDictionaries)) {
                console.warn(`[nuxt-i18n] Dictionary module "${moduleName}" not found`);

                return;
            }

            if (!(locale.value in i18nDictionaries[moduleName])) {
                console.warn(`[nuxt-i18n] Dictionary module "${moduleName}" with locale "${locale.value}" not found`);

                return;
            }

            const moduleData = await i18nDictionaries[moduleName][locale.value]();
            Object.assign(dictionaryState.value, moduleData);
            loadedDictionaryModules.value.push(moduleName);
        };

        const refreshDictionary = async () => {
            if (loadedDictionaryModules.value.length) {
                const modulesDataPromises: Promise<DictionaryParsed>[] = [];

                loadedDictionaryModules.value.forEach((moduleName) => {
                    modulesDataPromises.push(i18nDictionaries[moduleName][locale.value]());
                });

                const modulesData = await Promise.all(modulesDataPromises);
                dictionaryState.value = Object.assign({}, ...modulesData);
            }

            await nuxtApp.callHook('i18n:refreshDictionary');
        };

        const setLocale = (newLocale: string) => {
            if (locale.value === newLocale) {
                return;
            }

            if (!i18nConfig.locales.includes(newLocale)) {
                console.warn(`[nuxt-i18n] Locale "${newLocale}" not found`);

                return;
            }

            locale.value = newLocale;

            if (!i18nConfig.reloadOnSetLocale) {
                refreshDictionary();
            } else if (!i18nConfig.router) {
                window.location.reload();
            }

            nuxtApp.callHook('i18n:setLocale', locale.value);
        };

        const translate: I18nPluginProvider['t'] = (key, data) => {
            const itemString = dictionaryState.value[key];

            if (!itemString) {
                return key;
            }

            if (!data) {
                return itemString;
            }

            return txTagCompile(
                itemString,
                data,
                // eslint-disable-next-line consistent-return
                ({ args }, value) => {
                    if (args && value !== undefined) {
                        let num = value;

                        if (typeof num === 'string') {
                            num = parseFloat(num);
                        }

                        if (!Number.isNaN(num)) {
                            const pluralArg = plural(num, args);

                            if (pluralArg.includes('%d')) {
                                return pluralArg.replace('%d', String(num));
                            }

                            return `${num} ${pluralArg}`;
                        }
                    }
                },
            );
        };

        const translateExists: I18nPluginProvider['te'] = (key) => {
            return key in dictionaryState.value;
        };

        nuxtApp.provide('t', translate);
        nuxtApp.provide('te', translateExists);
        nuxtApp.provide('i18n', {
            t: translate,
            te: translateExists,
            locales: i18nConfig.locales,
            locale: readonly(locale),
            setLocale,
            dictionaryState,
            loadDictionary,
            loadDictionaryRaw,
        } satisfies I18nPluginProvider);

        if ('default' in i18nDictionaries) {
            await loadDictionary('default');
        }

        useHead(() => ({
            htmlAttrs: {
                lang: locale.value,
            },
        }));
    },
});
