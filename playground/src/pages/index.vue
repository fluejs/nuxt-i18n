<template>
    <div>
        <h1>Index page</h1>
        <p>
            {{ $t('hello_world') }}
        </p>
        <p>
            {{ $t('today_is', { date }) }}
        </p>
        <div>
            <button @click="apples -= 1">
                -
            </button>
            {{ $t('apples', [apples]) }}
            <button @click="apples += 1">
                +
            </button>
        </div>
        <p>
            <I18n
                keypath="author"
                name="FL3NKEY">
                <template #link="{ Component }">
                    <a
                        href="https://github.com/fl3nkey"
                        target="_blank">
                        <component :is="Component" />
                    </a>
                </template>
            </I18n>
        </p>
    </div>
</template>

<script setup lang="ts">
import { useState, ref } from '#imports';

const date = useState('date', () => Date.now());
const apples = ref(0);
</script>
