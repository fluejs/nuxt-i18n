import type { Plugin } from 'vite';
import type {
    DictionaryJSON,
    DictionaryParsed,
    DictionaryPath,
    DictionaryPathMap,
    DictionaryResolvedData,
    DictionaryResolvedPaths,
    I18nModuleOptions,
    NormalizedDictionaryPathMap,
} from './types';
import { isNil } from './utils/isNil';
import { asArray } from './utils/asArray';
import {
    addTemplate,
    addVitePlugin,
    resolvePath,
    addTypeTemplate,
    useNuxt,
} from '@nuxt/kit';
import fs from 'fs-extra';

interface DictionaryVirtualModule {
    dictionaryModule: string;
    locale: string;
    virtualId: string;
    resolvedVirtualId: string;
}

const VIRTUAL_MODULE_PATH = 'virtual:i18n-dictionary';

const normalizeDictionary = (
    dictionaryPaths: DictionaryPath | DictionaryPathMap,
): NormalizedDictionaryPathMap => {
    if (typeof dictionaryPaths === 'string' || Array.isArray(dictionaryPaths)) {
        return {
            default: asArray(dictionaryPaths),
        };
    }

    return Object.entries(dictionaryPaths)
        .reduce((result, path) => Object.assign(result, {
            [path[0]]: asArray(path[1]),
        }), {});
};

const eachDictionary = async (
    dictionary: NormalizedDictionaryPathMap,
    cb: (dictionaryModule: string, dictionaryPath: string) => void | Promise<void>,
) => {
    for (const [dictionaryModule, dictionaryPaths] of Object.entries(dictionary)) {
        for (const dictionaryPath of dictionaryPaths) {
            await cb(dictionaryModule, dictionaryPath);
        }
    }
};

const eachDictionaryLocale = (
    dictionary: NormalizedDictionaryPathMap,
    locales: string[],
    cb: (dictionaryModule: string, locale: string) => void,
) => {
    Object.keys((dictionary)).forEach((dictionaryModule) => {
        locales.forEach((locale) => {
            cb(dictionaryModule, locale);
        });
    });
};

const prepareDictionaryData = (
    dictionary: NormalizedDictionaryPathMap,
): DictionaryResolvedData => Object.keys(dictionary).reduce(
    (result, dictionaryModule) => Object.assign(result, { [dictionaryModule]: {} }),
    {},
);

const prepareDictionaryPaths = async (dictionary: NormalizedDictionaryPathMap) => {
    const resolvedPaths: DictionaryResolvedPaths = {};

    await eachDictionary(dictionary, async (dictionaryModule, dictionaryPath) => {
        resolvedPaths[dictionaryPath] = await resolvePath(dictionaryPath);
    });

    return resolvedPaths;
};

const prepareDictionaryVirtualModules = (
    dictionary: NormalizedDictionaryPathMap,
    locales: string[],
) => {
    const virtualModules: DictionaryVirtualModule[] = [];

    eachDictionaryLocale(
        dictionary,
        locales,
        (dictionaryModule, locale) => {
            virtualModules.push({
                dictionaryModule,
                locale,
                virtualId: `${VIRTUAL_MODULE_PATH}/${dictionaryModule}/${locale}`,
                resolvedVirtualId: `\0${VIRTUAL_MODULE_PATH}/${dictionaryModule}/${locale}`,
            });
        },
    );

    return virtualModules;
};

export const addDictionaryModule = async (options: I18nModuleOptions) => {
    addTypeTemplate({
        filename: 'types/i18nDictionaries.d.ts',
        getContents: () => `
        declare module '#build/i18nDictionaries.mjs' {
            export const i18nDictionaries: Record<string, Record<string, () => Promise<Record<string, string>>>>;
        }`,
    });

    if (!options.dictionary) {
        addTemplate({
            filename: 'i18nDictionaries.mjs',
            getContents: () => {
                return 'export const i18nDictionaries = {}';
            },
        });

        return;
    }

    const nuxt = useNuxt();

    const dictionaryMap = normalizeDictionary(options.dictionary);
    const dictionaryCache = prepareDictionaryData(dictionaryMap);
    const dictionaryResolvedPaths = await prepareDictionaryPaths(dictionaryMap);
    const dictionaryVirtualModules = prepareDictionaryVirtualModules(dictionaryMap, options.locales);

    const deleteDictionaryFromCache = (resolvedDictionaryPath: string) => {
        for (const moduleCacheKey in dictionaryCache) {
            if (resolvedDictionaryPath in dictionaryCache[moduleCacheKey]) {
                delete dictionaryCache[moduleCacheKey][resolvedDictionaryPath];
                break;
            }
        }
    };

    const loadDictionaries = async () => {
        const dictionaries = prepareDictionaryData(dictionaryMap);

        await eachDictionary(dictionaryMap, async (dictionaryModule, dictionaryPath) => {
            const resolvedDictionaryPath = dictionaryResolvedPaths[dictionaryPath];

            if (!(resolvedDictionaryPath in dictionaryCache[dictionaryModule])) {
                const json: DictionaryJSON = await fs.readJson(resolvedDictionaryPath);
                dictionaryCache[dictionaryModule][resolvedDictionaryPath] = json;
            }

            Object.assign(
                dictionaries[dictionaryModule],
                dictionaryCache[dictionaryModule][resolvedDictionaryPath],
            );
        });

        return dictionaries;
    };

    const parseDictionary = (
        locale: string,
        rawData: DictionaryJSON,
        parentKey?: string,
    ) => {
        const data: DictionaryParsed = {};
        const prefixKey = parentKey ? `${parentKey}.` : '';

        for (const key in rawData) {
            const item = rawData[key];
            const itemByLocale = item[locale] ?? item[options.defaultLocale];

            if (!isNil(itemByLocale)) {
                data[`${prefixKey}${key}`] = String(itemByLocale);
            } else if (Object.keys(item).filter((key) => !options.locales.includes(key)).length) {
                Object.assign(
                    data,
                    parseDictionary(locale, item as DictionaryJSON, `${prefixKey}${key}`),
                );
            }
        }

        return data;
    };

    const dictionaryVitePlugin: Plugin = {
        name: 'i18nDictionary',
        enforce: 'pre',
        configureServer(server) {
            server.watcher.add(Object.values(dictionaryResolvedPaths));

            server.watcher.on('all', (event, file) => {
                if (Object.values(dictionaryResolvedPaths).includes(file)) {
                    deleteDictionaryFromCache(file);

                    dictionaryVirtualModules.forEach(({ resolvedVirtualId }) => {
                        const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualId)!;
                        server.moduleGraph.invalidateModule(virtualModule);
                    });

                    server.hot.send({ type: 'full-reload' });

                    if (nuxt.options.ssr) {
                        // force for rebuild ssr
                        nuxt.server.reload();
                    }
                }
            });
        },
        resolveId(id) {
            if (!id.startsWith(VIRTUAL_MODULE_PATH)) {
                return;
            }

            const virtualModule = dictionaryVirtualModules
                .find(({ virtualId }) => virtualId === id);

            if (!virtualModule) {
                return;
            }

            // eslint-disable-next-line consistent-return
            return virtualModule.resolvedVirtualId;
        },
        async load(id) {
            if (!id.startsWith(`\0${VIRTUAL_MODULE_PATH}`)) {
                return;
            }

            const virtualModule = dictionaryVirtualModules
                .find(({ resolvedVirtualId }) => resolvedVirtualId === id);

            if (!virtualModule) {
                return;
            }

            const dictionariesData = await loadDictionaries();
            const dictionaryData = parseDictionary(
                virtualModule.locale,
                dictionariesData[virtualModule.dictionaryModule],
            );

            // eslint-disable-next-line consistent-return
            return `export default ${JSON.stringify(dictionaryData)}`;
        },
    };

    addVitePlugin(dictionaryVitePlugin);

    addTemplate({
        filename: 'i18nDictionaries.mjs',
        getContents: () => {
            const modulesContent: Record<string, string> = {};

            eachDictionaryLocale(
                dictionaryMap,
                options.locales,
                (dictionaryModule, locale) => {
                    if (!(dictionaryModule in modulesContent)) {
                        modulesContent[dictionaryModule] = '';
                    }

                    modulesContent[dictionaryModule] += `
                    '${locale}': () => import('${VIRTUAL_MODULE_PATH}/${dictionaryModule}/${locale}').then(m => m.default || m),
                    `;
                },
            );

            const content = Object.entries(modulesContent)
                .reduce(
                    // eslint-disable-next-line no-return-assign
                    (result, item) => result += `'${item[0]}': {${item[1]}},`,
                    '',
                );

            return `export const i18nDictionaries = {${content}}`;
        },
    });
};
