<template>
    <div>
        <h1>Sub page</h1>
        <p>
            {{ $t('hello_world') }}
        </p>
        <p>
            <I18nLink :to="{ name: 'index' }">
                {{ $t('nav.back') }}
            </I18nLink>
            |
            <I18nLink to="/sub/child">
                {{ $t('nav.go_to', ['Sub child']) }}
            </I18nLink>
        </p>
    </div>
</template>
