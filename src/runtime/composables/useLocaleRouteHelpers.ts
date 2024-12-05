import { useAppConfig } from '#imports';
import { trailingSlash } from '../../utils/trailingSlash';

export const useLocaleRouteHelpers = () => {
    const { i18nConfig } = useAppConfig();

    const getRoutePathLocale = (path: string) => {
        const pathSeperated = path.split('/');
        return i18nConfig.locales.includes(pathSeperated[1]) ? pathSeperated[1] : undefined;
    };

    const routePathHasLocale = (path: string) => {
        return Boolean(getRoutePathLocale(path));
    };

    const routePathApplyLocale = (path: string, locale: string) => {
        const pathSeperated = path.split('/');

        if (i18nConfig.locales.includes(pathSeperated[1])) {
            pathSeperated[1] = locale;
            return pathSeperated.join('/');
        }

        return trailingSlash(`/${locale}${path}`);
    };

    const routePathRemoveLocale = (path: string) => {
        const locale = getRoutePathLocale(path);

        if (locale) {
            const newPath = path.slice(locale.length + 1);
            return newPath.length ? newPath : '/';
        }

        return path;
    };

    return {
        getRoutePathLocale,
        routePathHasLocale,
        routePathApplyLocale,
        routePathRemoveLocale,
    };
};
