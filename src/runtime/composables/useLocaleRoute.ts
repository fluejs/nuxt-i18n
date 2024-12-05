import { useI18n } from './useI18n';
import { useLocaleRouteHelpers } from './useLocaleRouteHelpers';
import type { RouteLocationRaw } from 'vue-router';
import { useAppConfig } from '#imports';

export const useLocaleRoute = () => {
    const { i18nConfig } = useAppConfig();
    const { locale: localeRef } = useI18n();
    const {
        routePathApplyLocale,
        routePathRemoveLocale,
    } = useLocaleRouteHelpers();

    const localeRoute = <T extends RouteLocationRaw>(to: T, locale: string = localeRef.value) => {
        if (!i18nConfig.router) {
            return to;
        }

        let toLocation: RouteLocationRaw;

        if (typeof to === 'string') {
            toLocation = routePathApplyLocale(to, locale);
        } else {
            toLocation = { ...to };
            if ('name' in toLocation && toLocation.name) {
                toLocation.params = {
                    ...(toLocation.params ?? {}),
                    locale: locale,
                };

                delete toLocation.path;
            } else if ('path' in toLocation && toLocation.path) {
                toLocation.path = routePathApplyLocale(toLocation.path, locale);
            }
        }

        return toLocation as T;
    };

    const stripLocalePath = (path: string) => {
        if (!i18nConfig.router) {
            return path;
        }

        return routePathRemoveLocale(path);
    };

    return {
        localeRoute,
        stripLocalePath,
    };
};
