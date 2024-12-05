import type { Ref } from 'vue';
import type { HookResult } from '@nuxt/schema';

export type DictionaryPath = string | string[];

export interface DictionaryPathMap {
    [module: string]: DictionaryPath;
}

export interface NormalizedDictionaryPathMap {
    [module: string]: string[];
}

export interface DictionaryResolvedPaths {
    [resolvedPath: string]: string;
}

export interface DictionaryJSON {
    [key: string]: {
        [locale: string]: string;
    } | DictionaryJSON;
}

export interface DictionaryResolvedData {
    [module: string]: {
        [path: string]: DictionaryJSON;
    };
}

export type DictionaryParsed = Record<string, string>;

export interface I18nModuleOptions {
    locales: string[];
    defaultLocale: string;
    autoDetectLocale?: boolean;
    dictionary?: DictionaryPath | DictionaryPathMap;
    localeLanguages?: Record<string, string>;
    router?: boolean;
    meta?: boolean;
    metaOrigin?: string;
    cookieKey?: string;
    cookieMaxAge?: number;
    reloadOnSetLocale?: boolean;
    shallowDictionaryRef?: boolean;
}

export interface I18nAppConfig {
    locales: string[];
    defaultLocale: string;
    localeLanguages?: Record<string, string>;
    router: boolean;
    metaOrigin?: string;
    cookieKey: string;
    cookieMaxAge: number;
    reloadOnSetLocale: boolean;
    shallowDictionaryRef: boolean;
}

export interface I18nPluginProvider {
    // @todo: "data?: TxTagDataArg"
    t: (key: string, data?: any) => string;
    te: (key: string) => boolean;
    locales: string[];
    locale: Ref<string>;
    setLocale: (locale: string) => void;
    dictionaryState: Ref<DictionaryParsed>;
    loadDictionary: (moduleName: string) => Promise<void>;
    loadDictionaryRaw: (rawData: DictionaryParsed) => void;
}

export interface I18nRuntimeHooks {
    'i18n:setLocale': (locale: string) => HookResult;
    'i18n:refreshDictionary': () => HookResult;
    'i18n:detectLocale': (locale: Ref<string>) => HookResult;
}
