import { EventjsParams, Filter } from '../types';
export declare class MixinFilter {
    private _filterList;
    constructor(params?: EventjsParams);
    appendFilter(filter: Filter): void;
}
