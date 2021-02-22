import { MixinFilter } from './mixins/mixinfilter';

export type ArgumentPassingMode = 1 | 2;

export interface QuickEventParams {
    getEvent?: (...args: any[]) => any;
    canContinueInvoking?: (...args: any[]) => boolean;
    argumentPassingMode?: ArgumentPassingMode;
    argumentsAsArray?: boolean;
    mixins?: MixinFilter[];
}

export type Callback = (...args: any[]) => any;

export type Filter = (...args: any[]) => boolean;
