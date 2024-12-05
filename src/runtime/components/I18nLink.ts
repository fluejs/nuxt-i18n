import {
    defineComponent,
    h,
    useLocaleRoute,
} from '#imports';
import { NuxtLink } from '#components';
import type { NuxtLinkProps } from '#app';

export default defineComponent<NuxtLinkProps>({
    name: 'I18nLink',
    props: ['to', 'href'],
    setup(props, ctx) {
        const { localeRoute } = useLocaleRoute();

        return () => h(NuxtLink, {
            ...ctx.attrs,
            to: localeRoute(props.to ?? props.href ?? '/'),
        }, {
            ...ctx.slots,
        });
    },
});
