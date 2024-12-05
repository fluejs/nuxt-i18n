import type { RouterOptions } from 'vue-router';
import { localizeRoutes } from '../../utils/localizeRoutes';
import { useAppConfig } from '#imports';

export const defineI18nRoutes = (routes: RouterOptions['routes']) => {
    const { i18nConfig } = useAppConfig();

    if (i18nConfig.router) {
        return localizeRoutes(routes, i18nConfig.locales);
    }

    return routes;
};
