import type { NuxtPage } from '@nuxt/schema';
import type { RouteRecordRaw } from 'vue-router';
import { leadingSlash } from './leadingSlash';

type RouteRecord = NuxtPage | RouteRecordRaw;

export const localizeRoutes = <T extends RouteRecord>(
    routes: Readonly<T[]>,
    locales: string[],
) => {
    const localizedPath = `/:locale(${locales.join('|')})`;
    const relativeRoutes = routes.map((route) => ({
        ...route,
        path: leadingSlash(route.path),
    }));

    return [{
        path: localizedPath,
        children: relativeRoutes,
    }];
};
