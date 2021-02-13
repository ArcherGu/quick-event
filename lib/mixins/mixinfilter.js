import { CallbackList } from '../callbacklist';
export class MixinFilter {
    constructor(params) {
        this._filterList = new CallbackList(params);
    }
    appendFilter(filter) {
        this._filterList;
    }
}
