import type { RouterConfig } from '@nuxt/schema';
import { defineI18nRoutes } from '#imports';

export default {
    routes: () => defineI18nRoutes([{
        name: 'index',
        path: '/',
        component: () => import('~/customPages/example.vue'),
    }]),
} satisfies RouterConfig;
