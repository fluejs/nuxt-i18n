# Guide

## What is `@fluejs/nuxt-i18n`?

`@fluejs/nuxt-i18n` is a simple yet flexible module for Nuxt that helps localize your project. Here’s what the module offers:

- Definition of dictionaries (messages) in JSON files, with processing and chunk splitting during the build process
- Language prefixes in routing paths, enhancing SEO localization
- Built-in interpolation and pluralization when accessing the dictionary using [@fluejs/txtag](https://github.com/fluejs/txtag)

### Do I need it?

It’s partly inspired by `nuxt-i18n` and `nuxt-i18n-micro`, but this module is not fully compatible with them.

If you’re planning to migrate from `nuxt-i18n`, I’d recommend choosing [nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro). However, if you’re starting from scratch or have a small to medium-sized project, I believe `@fluejs/nuxt-i18n` would be an excellent alternative.

## Installation

::: code-group

```shell [npm]
npm install --save-dev @fluejs/nuxt-i18n
```

```shell [yarn]
yarn add -D @fluejs/nuxt-i18n
```

:::

## Basic setup

Because `@fluejs/nuxt-i18n` is a module for Nuxt, it needs to be registered.

`nuxt.config.ts`
```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    /* locales and defaultLocale is required */
    i18n: {
        // list of locales
        locales: ['en', 'ru'],
        // default/fallback locale
        defaultLocale: 'en',
        /* path to your dictionary */
        dictionary: '~/app/dictionary.json',
    },
});
```

Now we need to create the dictionary JSON file, the path to which we specified in the configuration. A simple dictionary would look like this:

`app/dictionary.json`
```json
{
    "greeting": {
        "en": "Hello!",
        "ru": "Привет!"
    }
}
```

In this case, we declare the key `greeting` with locale keys `en` and `ru` (the locales correspond to those specified in the module's configuration).

Now we can access this key, for example, using the global `$t` method in the component template. Depending on the user's preferred language, the corresponding text will be displayed based on the dictionary.

```vue
<template>
    <p>{{ $t('greeting') }}</p>
</template>
```

## Usage

### $t
*Type:* `(key: string, data: object | array) => string`

A global property for accessing dictionary keys.

```json
{
    "greeting": {
        "en": "Hello!",
        "ru": "Привет!"
    },
    "nested": {
        "greeting": {
            "en": "Hello!",
            "ru": "Привет!"
        }
    }
}
```

```vue
<template>
    <p>{{ $t('greeting') }}</p>
    <!-- access to nested property with dot notation -->
    <p>{{ $t('nested.greeting') }}</p>
</template>
```

#### Interpolation

You can pass data as the second argument, either as an `object` or an `array`, enabling interpolation.

```json
{
    "author": {
        "en": "Author: {name}"
    },
    "time": {
        "en": "Time is {0}:{1}:{2}"
    }
}
```

```vue
<template>
    <p>{{ $t('author', { name: 'fl3nkey' }) }}</p>
    <p>{{ $t('time', [12,55,01]) }}</p>
</template>
```

#### Pluralization

This method also has built-in pluralization, which works as follows:

```json
{
    "apples": {
        "en": "{count}[apple|apples]",
        "ru": "{count}[яблоко|яблока|яблок]"
    },
    "apples_with_custom_position": {
        "en": "{count}[apple: %d|apples: %d]",
        "ru": "{count}[яблоко: %d|яблока: %d|яблок: %d]"
    }
}
```

```vue
<template>
    <!-- output: "12 apples" -->
    <p>{{ $t('apples', { count: 12 }) }}</p>
    <!-- output: "apple: 1" -->
    <p>{{ $t('apples_with_custom_position', { count: 1 }) }}</p>
</template>
```

### $te
*Type:* `(key: string) => boolean`

A global property for checking whether a key exists in the dictionary.

```vue
<template>
    <article>
        <h1 v-if="$te('page.title')">
            {{ $t('page.title') }}
        </h1>
        <p>
            {{ $t('page.text') }}
        </p>
    </article>
</template>
```

### useI18n

A composable that provides an API for working with the `i18n` plugin.

```ts
const {
    t,
    te,
    locales,
    locale,
    setLocale,
    dictionaryState,
    loadDictionary,
    loadDictionaryRaw,
} = useI18n();
```

#### t
*Type:* `(key: string, data: object | array) => string`

Same as [$t](#t)

#### te
*Type:* `(key: string) => boolean`

Same as [$te](#te)

#### locales
*Type:* `string[]`

The array of available locales.

#### locale
*Type:* `Ref<string>`

The current locale ref variable.

#### setLocale
*Type:* `(locale: string) => void`

A method for changing the current locale.

#### dictionaryState
*Type:* `Ref<Record<string, string>>`

The current dictionary ref object.

#### loadDictionary
*Type:* `(moduleName: string) => Promise<void>`

A method for load a dictionary module.

[Read more about modular dictionary](#modular-dictionary)

#### loadDictionaryRaw
*Type:* `(data: Record<string, string>) => void`


A method to load a custom dictionary object into the state.

[Read more about externalize dictionary](#externalize-dictionary)

### useLocaleRoute

A composable for working with locale paths. Useful when you use a locale prefix in routing paths.

```ts
const {localeRoute, stripLocalePath} = useLocaleRoute();

localeRoute('/'); // /en
localeRoute({ name: 'dashboard' }); // /en/dashboard
localeRoute('/', 'ru'); // /ru
localeRoute({ name: 'dashboard' }, 'ru'); // /ru/dashboard

stripLocalePath('/en/dashboard'); // /dashboard
```

### defineI18nRoutes

If you use custom routing with `router.options.(ts|js)`, the module will not automatically add locale prefixes to the routes. For this, you can use this utility function.

```ts
import type { RouterConfig } from '@nuxt/schema';

export default {
    routes: () => defineI18nRoutes([{
        name: 'index',
        path: '/',
        component: () => import('~/pages/index.vue'),
    }]),
} satisfies RouterConfig;
```

### Components

#### I18n

A global component which allows expressions to be replaced with an attribute or a slot

```json
{
    "privacy_link": {
        "en": "You are agree with our {link}Privacy policy{/link}"
    }
}
```

```vue
<template>
    <I18n keypath="privacy_link">
        <template #link="{ body }">
            <a href="/privacy">{{ body }}</a>
        </template>
    </I18n>
</template>
```

[Read more about TxTag component API](https://txtag.fl3nkey.com/guide.html#using-with-vue)

#### I18nLink

A global component that wraps `NuxtLink` and automatically adds the current locale to the provided route.

```vue
<template>
    <!-- <a href="/en">Go to home</a> -->
    <I18nLink to="/">
        Go to home
    </I18nLink>
    <!-- <a href="/en/dashoard">Go to dashboard</a> -->
    <I18nLink :to="{ name: 'dashboard' }">
        Go to dashboard
    </I18nLink>
</template>
```

### Hooks

#### i18n:setLocale
*Type:* `(locale: string) => HookResult`

A hook that will be triggered after the `setLocale` method is called.

```ts
nuxtApp.hook('i18n:setLocale', (locale) => {
    console.log(locale); // new locale
});
```

#### i18n:refreshDictionary
*Type:* `() => HookResult`

A hook that will be called when the dictionary state needs to be updated, such as when switching locales.

```ts
nuxtApp.hook('i18n:refreshDictionary', () => {
    // load your external dictionary
});
```

#### i18n:detectLocale
*Type:* `(locale: Ref<string>) => HookResult`

A hook that will be called when a user locale needs to be determined.

> [!NOTE]
> This hook must be registered **BEFORE** the module registers the `i18n` plugin.

> [!NOTE]
> Use only if `autoDetectLocale` is `false`.

```ts
nuxtApp.hook('i18n:detectLocale', (locale) => {
    locale.value = 'your locale';
});
```

## Dictionary

A dictionary is an object that describes messages for each locale. The module accepts only JSON files as the source. The object described in the JSON file can also be nested, but in the end, the property should consist of an object in the format `"{locale}": "{message}"`.

```json
{
    "message": {
        "en": "Message",
        "ru": "Сообщение"
    },
    "nested": {
        "message": {
            "en": "Message",
            "ru": "Сообщение"
        }
    }
}
```

After build, this dictionary is converted into a flat object and split into chunks per module and per locale.

`_nuxt/example_default_en_chunk.js`
```js
export default {
    "message": "Message",
    "nested.message": "Message"
}
```

`_nuxt/example_default_ru_chunk.js`
```js
export default {
    "message": "Сообщение",
    "nested.message": "Сообщение"
}
```

These chunks will be loaded at runtime based on the current locale.

### Modular dictionary

The dictionary can also be "modular," and modules can be lazily loaded, for example, for a specific page or section of the application. Modules are defined in advance in `nuxt.config.(ts|js)`.

> [!NOTE]
> `default` module will be automatically loaded during initialization

> [!NOTE]
> For modules, a prefix for the key **will not** be created automatically, so if you have identical keys between dictionary modules, they will overwrite each other

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        dictionary: {
            default: '~/app/dictionary/default.json',
            auth: '~/app/dictionary/auth.json',
            dashboard: '~/app/dictionary/dashboard.json',
        }
    },
});
```

Afterward, you can load the module using the [loadDictionary](#loaddictionary) method.

`pages/auth.vue`
```vue
<template>
    <p>${{ $t('auth_greeting') }}</p>
</template>

<script setup lang="ts">
    const {loadDictionary} = useI18n();
    
    await loadDictionary('auth');
</script>
```

`pages/dashboard.vue`
```vue
<template>
    <h1>${{ $t('dashboard.title') }}</h1>
</template>

<script setup lang="ts">
    const {loadDictionary} = useI18n();
    
    await loadDictionary('dashboard');
</script>
```

### Externalize dictionary

The module also supports scenarios where you plan to store, manage, and retrieve the dictionary on the other side (e.g., API, CMS).

In this case, you can omit the `dictionary` property in the module configuration.

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'en'
    },
});
```

Create your own plugin for example. Use [loadDictionaryRaw](#loaddictionaryraw) for load data to dictionary state.

```ts
export default defineNuxtPlugin(async (nuxtApp) => {
    const {locale, loadDictionaryRaw} = useI18n();
    
    const loadDictionary = async () => {
        const data = await $fetch('/api/dictionary', {
            query: {
                locale: locale.value,
            }
        });

        // pass data to dictionary state
        loadDictionaryRaw(data);
    }
    
    // refresh dictionary state with new data (e.g. on setLocale)
    nuxtApp.hook('i18n:refreshDictionary', loadDictionary);
    
    await callOnce(loadDictionary);
});
```

## Routing

If you need a unique path per locale for each page, this module provides such functionality. To enable it, set `router: true` in the module configuration.

After that, all pages will be wrapped in a parent dynamic route, where the first parameter will accept the locale.

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'en',
        router: true,
    },
});
```

```ts
// now available as /:locale
"/pages/index.vue"

// now available as /:locale/dashboard
"/pages/dashboard.vue"
```

Additionally, if no valid locale is found in the path, the user will be redirected to their preferred locale (from the available ones).

You’ll now need to keep in mind that locales are included in the paths when creating and working with routes. To simplify this, you can use [I18nLink](#i18nlink) and [useLocaleRoute](#uselocaleroute).

```vue
<template>
    <I18nLink to="/dashboard">Go to dashboard</I18nLink>
    
    <NuxtLink :to="localeRoute('/catalog')">Go to catalog</NuxtLink>
</template>

<script setup lang="ts">
    const {localeRoute, stripLocalePath} = useLocaleRoute();
    
    const route = useRoute();
    const isIndexRoute = computed(() => stripLocalePath(route.path) === '/');
</script>
```

Changing the locale in the route using `router.push` will not update the current locale. You still need to call [setLocale](#setlocale)

```vue
<template>
    <!-- wont work -->
    <NuxtLink :to="localeRoute($route.fullPath, 'en')">
        change to en
    </NuxtLink>

    <!-- will work -->
    <NuxtLink :to="localeRoute($route.fullPath, 'en')"
              custom
              v-slot="{ href }">
        <a :href="href"
           @click.prevent="setLocale('en')">
            change to en
        </a>
    </NuxtLink>
</template>

<script setup lang="ts">
    const {setLocale} = useI18n();
    const {localeRoute} = useLocaleRoute();
</script>
```

## Module options

Below are the properties that the module accepts. To configure it, use the `i18n` key in `nuxt.config.(ts|js)`.

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        /* ... */
    },
});
```

### locales
*Type:* `string[]`
<br>
*Required*

List of available locales. It is recommended to use values from the ISO standard ([ISO 639](https://wikipedia.org/wiki/ISO_639)), as these values will also be used to determine the user's preferred language (based on `Accept-Language` and `navigator.languages`).

### defaultLocale
*Type:* `string`
<br>
*Required*

The default locale. It should match the value specified in `locales`. It will be used as a fallback if the user's language cannot be determined or if the corresponding locale is not found in the dictionary.

### localeLanguages
*Type:* `Record<string, string>`
<br>
*Default:* `undefined`

An object that additionally describes which language a locale belongs to when determining the user's language. The key represents the language, and the value represents the corresponding locale.

Here are a few examples:

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'ru',
        localeLanguages: {
            'en-GB': 'en',
            'en-US': 'en',
        }
    },
});
```

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        locales: ['en-GB', 'en-US'],
        defaultLocale: 'en-US',
        localeLanguages: {
            en: 'en-GB',
        }
    },
});
```

### autoDetectLocale
*Type:* `boolean`
<br>
*Default:* `true`

A property that indicates whether to automatically detect the user's locale based on `Accept-Language` and `navigator.languages`.

For custom locale detection, you can use the [i18n:detectLocale](#i18n-detectlocale) hook.

### dictionary
*Type:* `string | string[] | Record<string, string | string[]>`
<br>
*Default:* `undefined`

This property is a reference to the JSON files of your dictionary.

```ts
export default defineNuxtConfig({
    modules: ['@fluejs/nuxt-i18n'],
    i18n: {
        // as string
        dictionary: '~/app/dictionary.json',
        // as array
        dictionary: [
            '~/app/dictionary1.json',
            '~/app/dictionary2.json'
        ],
        // as modules
        dictionary: {
            default: ['~/app/dictionary1.json', '~/app/dictionary2.json'],
            auth: '~/app/auth.json',
        }
    },
});
```

If you are using only an "external" dictionary, this property can be left undefined.

[Read more about dictionary](#dictionary-1)

### router
*Type:* `boolean`
<br>
*Default:* `false`

A property that indicates whether to use a locale prefix in routing paths.

[Read more about routing](#routing)

### meta
*Type:* `boolean`
<br>
*Default:* `false`


A property that indicates whether to embed meta tags for locales. Works only when `router` property is `true`.

The module will add `<link rel="canonical">` and `<link rel="alternate" hreflang="{locale}">` to the `<head>` of your page.

### metaOrigin
*Type:* `string`
<br>
*Default:* `undefined`

The URL origin for meta tags.

### cookieKey
*Type:* `string`
<br>
*Default:* `i18n-locale`

The cookie key where the user's preferred locale is stored.

### cookieMaxAge
*Type:* `number`
<br>
*Default:* `31536000` (1 year)

### reloadOnSetLocale
*Type:* `boolean`
<br>
*Default:* `false`

If `true`, the page will reload with the new locale when [setLocale](#setlocale) is called.

### shallowDictionaryRef
*Type:* `boolean`
<br>
*Default:* `true`

If `true`, the dictionary ref state will not deep reactivity but will be more performance-optimized.

The nuance is that calling [loadDictionary](#loaddictionary) or [loadDictionaryRaw](#loaddictionaryraw) will not trigger changes when `shallowDictionaryRef` is `true`. If you expect deeply reactive behavior from the dictionary state, set it to `false`.

```vue
<template>
    <div>
        {{ $t('example') }}
    </div>
</template>

<script setup lang="ts">
    const {loadDictionaryRaw, dictionaryState} = useI18n();

    const load = () => {
        loadDictionaryRaw({ example: 'Hello!' });
        // trigger dictionary ref if shallow
        triggerRef(dictionaryState);
    }
    
    onMounted(() => load());
</script>
```