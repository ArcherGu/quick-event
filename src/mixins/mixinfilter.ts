import { CallbackNode } from '../helper/node';
import { CallbackList } from '../callbacklist';
import { EventjsParams, Filter } from '../types';

export class MixinFilter {
    private _filterList: CallbackList;
    constructor(params?: EventjsParams) {
        this._filterList = new CallbackList(params);
    }

    public appendFilter(filter: Filter): CallbackNode {
        return this._filterList.append(filter);
    }

    public removeFilter(handle: Filter | CallbackNode): boolean {
        return this._filterList.remove(handle);
    }

    public mixinBeforeDispatch(...args: any[]): boolean {
        if (!this._filterList.empty()) {
            if (!this._filterList.forEachIf((callback) => {
                return callback.call(callback, args);
            })) {
                return false;
            }
        }

        return true;
    }
}
