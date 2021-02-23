import { CallbackNode } from '../callback_node';
import { CallbackList } from '../callback_list';
import { QuickEventParams, Filter } from '../types';

export class MixinFilter {
    public filterList: CallbackList;
    constructor(params?: QuickEventParams) {
        this.filterList = new CallbackList(params);
    }

    public appendFilter(filter: Filter): CallbackNode {
        return this.filterList.append(filter);
    }

    public removeFilter(handle: Filter | CallbackNode): boolean {
        return this.filterList.remove(handle);
    }

    public mixinBeforeDispatch(args: any[]): boolean {
        if (!this.filterList.empty()) {
            if (!this.filterList.forEachIf((callback) => {
                return callback.call(callback, args);
            })) {
                return false;
            }
        }

        return true;
    }
}
