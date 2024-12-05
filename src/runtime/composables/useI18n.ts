import { useNuxtApp } from '#imports';
import type { I18nPluginProvider } from '../../types';

export const useI18n = (): I18nPluginProvider => {
    const { $i18n } = useNuxtApp();
    return $i18n;
};
