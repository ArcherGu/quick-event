import { MixinFilter } from './mixins/mixinfilter';
export declare type ArgumentPassingMode = 1 | 2;
export interface EventjsParams {
    getEvent?: (...args: any[]) => any;
    canContinueInvoking?: (...args: any[]) => boolean;
    argumentPassingMode?: ArgumentPassingMode;
    argumentsAsArray?: boolean;
    mixins?: MixinFilter[];
}
export declare type Callback = (...args: any[]) => any;
export declare type Filter = (...args: any[]) => boolean;
