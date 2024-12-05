import { defineConfig } from 'vitepress';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

export default defineConfig({
    appearance: 'force-dark',
    title: '@fluejs/nuxt-i18n',
    description: 'Simple internationalization module for Nuxt',
    markdown: {
        config(md) {
            md.use(tabsMarkdownPlugin);
        },
    },
    themeConfig: {
        nav: [{
            text: 'Home',
            link: '/',
        },
        {
            text: 'Guide',
            link: '/guide',
        }],
        outline: {
            level: [2, 3],
        },
        socialLinks: [{
            icon: 'github',
            link: 'https://github.com/fluejs/nuxt-i18n',
        }],
    },
});
