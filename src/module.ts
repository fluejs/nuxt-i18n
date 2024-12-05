import {
    defineNuxtModule,
    createResolver,
    addPlugin,
    addTypeTemplate,
    addImports,
    extendPages,
    addComponent,
} from '@nuxt/kit';
import type {
    I18nModuleOptions,
    I18nAppConfig,
    I18nRuntimeHooks,
} from './types';
import { addDictionaryModule } from './dictionary';
import { I18N_COOKIE_KEY_DEFAULT, I18N_COOKIE_MAX_AGE_DEFAULT } from './constants';
import { localizeRoutes } from './utils/localizeRoutes';

declare module '@nuxt/schema' {
    interface AppConfig {
        i18nConfig: I18nAppConfig;
    }
}

declare module '#app' {
    interface RuntimeNuxtHooks extends I18nRuntimeHooks {}
}

export default defineNuxtModule<I18nModuleOptions>({
    meta: {
        name: '@fluejs/nuxt-i18n',
        configKey: 'i18n',
    },
    defaults: {
        locales: [],
        defaultLocale: '',
        autoDetectLocale: true,
        dictionary: '',
        router: false,
        meta: false,
        cookieKey: I18N_COOKIE_KEY_DEFAULT,
        cookieMaxAge: I18N_COOKIE_MAX_AGE_DEFAULT,
        reloadOnSetLocale: false,
        shallowDictionaryRef: true,
    },
    async setup(options, nuxt) {
        const { resolve } = createResolver(import.meta.url);

        nuxt.options.appConfig.i18nConfig = {
            locales: options.locales,
            defaultLocale: options.defaultLocale,
            localeLanguages: options.localeLanguages,
            router: options.router ?? false,
            metaOrigin: options.metaOrigin,
            cookieKey: options.cookieKey ?? I18N_COOKIE_KEY_DEFAULT,
            cookieMaxAge: options.cookieMaxAge ?? I18N_COOKIE_MAX_AGE_DEFAULT,
            reloadOnSetLocale: options.reloadOnSetLocale ?? false,
            shallowDictionaryRef: options.shallowDictionaryRef ?? true,
        };

        await addDictionaryModule(options);

        if (options.autoDetectLocale) {
            addPlugin({
                src: resolve('./runtime/plugins/i18nDetectLocalePlugin'),
                order: -1,
            });
        }

        addPlugin(resolve('./runtime/plugins/i18nPlugin'));

        if (options.router) {
            addPlugin(resolve('./runtime/plugins/i18nRouterPlugin'));

            if (options.meta) {
                addPlugin(resolve('./runtime/plugins/i18nMetaPlugin'));
            }

            extendPages((nuxtPages) => {
                const localizedPages = localizeRoutes(nuxtPages, options.locales);

                nuxtPages.splice(0);
                nuxtPages.push(...localizedPages);
            });
        }

        addImports([
            {
                name: 'defineI18nRoutes',
                as: 'defineI18nRoutes',
                from: resolve('./runtime/utils/defineI18nRoutes'),
            },
            {
                name: 'useI18n',
                as: 'useI18n',
                from: resolve('./runtime/composables/useI18n'),
            },
            {
                name: 'useLocaleRoute',
                as: 'useLocaleRoute',
                from: resolve('./runtime/composables/useLocaleRoute'),
            },
            {
                name: 'useLocaleRouteHelpers',
                as: 'useLocaleRouteHelpers',
                from: resolve('./runtime/composables/useLocaleRouteHelpers'),
            },
        ]);

        await addComponent({
            name: 'I18n',
            export: 'default',
            filePath: resolve('./runtime/components/I18n'),
        });

        await addComponent({
            name: 'I18nLink',
            export: 'default',
            filePath: resolve('./runtime/components/I18nLink'),
        });

        addTypeTemplate({
            filename: 'types/i18nPlugin.d.ts',
            getContents: () => `
            import type {I18nPluginProvider} from '@fluejs/nuxt-i18n';

            declare module '#app' {
                interface NuxtApp {
                    $t: I18nPluginProvider['t'];
                    $te: I18nPluginProvider['te'];
                    $i18n: I18nPluginProvider;
                }
            }

            declare module '@vue/runtime-core' {
                interface ComponentCustomProperties {
                    $t: I18nPluginProvider['t'];
                    $te: I18nPluginProvider['te'];
                    $i18n: I18nPluginProvider;
                }
            }

            export {}
            `,
        });
    },
});

export type * from './types';
