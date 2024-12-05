import {
    computed,
    defineComponent,
    h,
} from '#imports';
import { useI18n } from '../composables/useI18n';
import { TxTag, type TxTagSlotsType } from '@fluejs/txtag/vue';

export default defineComponent({
    name: 'I18n',
    props: {
        keypath: {
            type: String,
            required: true,
        },
    },
    slots: Object as TxTagSlotsType,
    setup(props, ctx) {
        const { t } = useI18n();

        const source = computed(
            () => t(props.keypath, (ctx.attrs as Record<string, string>)),
        );

        return () => h(TxTag, {
            source: source.value,
        }, {
            ...ctx.slots,
        });
    },
});
