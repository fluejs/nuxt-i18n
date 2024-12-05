<template>
    <div>
        <h2>Child page</h2>
        <p>
            {{ $t('example.greeting') }}
        </p>
        <p>
            <I18nLink to="/sub">
                {{ $t('nav.back') }}
            </I18nLink>
        </p>
    </div>
</template>
