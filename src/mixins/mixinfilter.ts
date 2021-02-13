import { CallbackList } from '../callbacklist';
import { EventjsParams, Filter } from '../types';

export class MixinFilter {
    private _filterList: CallbackList;
    constructor(params?: EventjsParams) {
        this._filterList = new CallbackList(params);
    }

    appendFilter(filter: Filter) {
        this._filterList;
    }
}
