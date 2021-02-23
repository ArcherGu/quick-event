import { MixinFilter } from './mixins/mixin_filter';

export enum ArgumentPassingMode {
    IncludeEvent = 1,
    ExcludeEvent
}

export interface QuickEventParams {
    getEvent?: (...args: any[]) => any;
    canContinueInvoking?: (...args: any[]) => boolean;
    argumentPassingMode?: ArgumentPassingMode;
    argumentsAsArray?: boolean;
    mixins?: MixinFilter[];
}

export type Callback = (...args: any[]) => any;

export type Filter = (...args: any[]) => boolean;
