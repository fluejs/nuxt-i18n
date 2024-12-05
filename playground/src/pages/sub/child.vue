<template>
    <div>
        <h1>Sub child page</h1>
        <NuxtPage v-if="dictionaryLoaded" />
        <p v-else>
            loading dictionary...
        </p>
    </div>
</template>

<script setup lang="ts">
import {
    useI18n,
    ref,
    onMounted,
} from '#imports';

const dictionaryLoaded = ref(false);
const { loadDictionary } = useI18n();

onMounted(async () => {
    await loadDictionary('example');
    dictionaryLoaded.value = true;
});
</script>
