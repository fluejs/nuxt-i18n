# @fluejs/nuxt-i18n

[<img src="https://pkg-size.dev/badge/bundle/35629">](https://pkg-size.dev/@fluejs%2Fnuxt-i18n)
[<img src="https://img.shields.io/npm/v/@fluejs/nuxt-i18n.svg">](https://www.npmjs.com/package/@fluejs/nuxt-i18n)
<img src="https://img.shields.io/npm/l/@fluejs/txtag">

[Full documentation](https://nuxt-i18n.fl3nkey.com/)

`@fluejs/nuxt-i18n` is a simple yet flexible module for Nuxt that helps localize your project. Here’s what the module offers:

- Definition of dictionaries (messages) in JSON files, with processing and chunk splitting during the build process
- Language prefixes in routing paths, enhancing SEO localization
- Built-in interpolation and pluralization when accessing the dictionary using [@fluejs/txtag](https://github.com/fluejs/txtag)

## Basic setup

Install the module

```shell [npm]
# via npm
npm install --save-dev @fluejs/nuxt-i18n
# via yarn
yarn add -D @fluejs/nuxt-i18n
```

Register the module

`nuxt.config.ts`
```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'en',
        dictionary: '~/app/dictionary.json',
    },
});
```

Create dictionary file

`app/dictionary.json`
```json
{
    "greeting": {
        "en": "Hello!",
        "ru": "Привет!"
    }
}
```

Display your first message

```vue
<template>
    <p>{{ $t('greeting') }}</p>
</template>
```