<template>
    <div>
        <div>
            <span
                v-for="item in locales"
                :key="item"
                class="item">
                <NuxtLink
                    v-slot="{ href }"
                    :to="localeRoute(route.fullPath, item)"
                    custom>
                    <a
                        :class="{
                            'active': locale === item,
                        }"
                        :href="href"
                        @click.prevent="setLocale(item)">
                        {{ item.toUpperCase() }}
                    </a>
                </NuxtLink>
            </span>
        </div>
        <hr>
        <nav>
            <span
                v-for="(item, index) in nav"
                :key="index"
                class="item">
                <I18nLink
                    :to="item.to"
                    :class="{
                        active: item.active,
                    }">
                    {{ item.label }}
                </I18nLink>
            </span>
        </nav>
        <hr>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import {
    useI18n,
    useLocaleRoute,
    useRoute,
    computed,
} from '#imports';

const route = useRoute();
const {
    locales,
    locale,
    setLocale,
} = useI18n();
const { localeRoute, stripLocalePath } = useLocaleRoute();

const nav = computed(() => [
    {
        to: '/',
        label: 'Index',
        active: route.name === 'index',
    },
    {
        to: '/sub',
        label: 'Sub',
        active: stripLocalePath(route.path).startsWith('/sub'),
    },
    {
        to: '/sub/child',
        label: 'Sub child',
        active: stripLocalePath(route.path).startsWith('/sub/child'),
    },
]);
</script>

<style scoped>
.item:not(:last-child):after {
    content: ' • ';
}

.active {
    color: green;
}
</style>
