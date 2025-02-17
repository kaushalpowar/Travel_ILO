import {objectHasProperty} from '../functions/objects.ts';

type stateItemType = {
    path: Array<string>,
    preferredName: string,
    values: object,
    callbacks: object,
    storageCallbacks: object,
    children: Array<string>,
    timerId: NodeJS.Timeout | undefined,
    timerDuplicateWarning: NodeJS.Timeout | undefined
};

class ContextStateContent {
    static state: Map<string, stateItemType> = new Map();

    // creates the state, without yet activating it. We reserve the name which can be passed through to its
    // children, but due to the nature of useEffect life-cycle calls, we can only activate it after the
    // children nodes are mounted. Moreover with React.StrictMode enabled, both the create and activation
    // code is trigger twice, but unfortunately not connected. In other words, we create one state, which will
    // not be activated (and needs to be cleaned up) and one state that will be activated twice and removed
    // once.
    static createState(preferredName: string, [...path]: Array<string>, {...values}: object): string{
        const state = ContextStateContent.state;
        let name = preferredName;
        for(let i = 0; i < 10; i++){
            if(state.has(name)){
                i++;
                name = preferredName + '-' + (Math.random() + 1).toString(36).substring(9);
            }
        }

        const newState: stateItemType = {
            path: [...path, name],
            preferredName,
            values,
            callbacks: {},
            storageCallbacks: {},
            children: [],
            // If this state is created, but not added (mounted) to the component, we need to clean it up.
            timerId: setTimeout(() => {ContextStateContent._deleteState(name);}, 100),
            // It can happen that the createState is called twice, but only one is activated. When one of the
            // dupplicates is not activated it will be deleted no need to show a warning.
            timerDuplicateWarning: preferredName === name ?
                    undefined :
                    setTimeout(() => {
                        console.warn('ContextState with name ' + preferredName +
                                ' already exist, renaming to ' + name);
                    }, 200)
        };
        state.set(name, newState);
        const parentName = path.pop();
        if(parentName){
            state.get(parentName)?.children.push(name);
        }

        return name;
    }

    static addState(name: string): void{
        const state = ContextStateContent.getState(name);
        if(state?.timerId){
            clearTimeout(state.timerId);
            state.timerId = undefined;
        }
    }

    static removeState(name: string): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to remove non-existing ContextState ' + name);
            return;
        }
        // If this state may be added again directly after. In that case we should not have removed it. Only
        // when it's not added (mounted) directly after, we delete it.
        state.timerId = setTimeout(() => {ContextStateContent._deleteState(name);}, 100);
    }

    static _deleteState(name: string): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to remove non-existing ContextState ' + name);
            return;
        }
        clearTimeout(state.timerId);

        // first check if the children are also staged for removal, in that case, delete them first before
        // proceeding with the parent
        if(state.children.length > 0){
            let triggerWarning = false;
            // making a copy of children, because we will be manipulating this list when removing children
            const children = [...state.children];
            for(const childName of children){
                const child = ContextStateContent.getState(childName);
                if(! child){
                    console.warn('Child ' + childName + ' of deleted state ' + name + ' not found.');
                    continue;
                }
                if(child.timerId){
                    ContextStateContent._deleteState(childName);
                }else{
                    triggerWarning = true;
                }
            }
            if(triggerWarning){
                console.warn('Removing ContextState \'' + name + '\' which has children attached. ' +
                        'This is not allowed.');
            }
        }

        clearTimeout(state.timerDuplicateWarning);

        // remove the link in the parent
        const parentName = state.path.length >= 2 ? state.path[state.path.length - 2] : null;
        if(parentName){
            const s = ContextStateContent.getState(parentName);
            if(! s){
                console.warn('Parent ' + parentName + ' of ContextState object ' + name + ' not found.');
            }else{
                const index = s.children.indexOf(name);
                s.children.splice(index, 1);
            }
        }
        // remove the state object.
        ContextStateContent.state.delete(name);

        // see if there's another item with the same preferredName, if so we can clear the warning
        for(const st of ContextStateContent.state.values()){
            if(st.preferredName === state.preferredName){
                clearTimeout(st.timerDuplicateWarning);
                break;
            }
        }
    }

    static getState(name: string): stateItemType | undefined{
        return ContextStateContent.state.get(name);
    }

    static getValues(name: string, filter: Array<string>, includeParentValues = true):
            Record<string, unknown>{
        const result = {};
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            return {};
        }
        const statePath = includeParentValues ? state.path : state.path.slice(-1);
        for(const p of statePath){
            const s = ContextStateContent.getState(p);
            if(! s){
                console.warn('Parent ' + p + ' missing in ContextState ' + name + '.');
                continue;
            }
            for(const k of Object.keys(s.values)){
                let value = s.values[k];
                // create a shallow copy to prevent unexpected changes in the state values. Since we are only
                // copying the first level, potential issues can still occur when changes are made at a deeper
                // level. We try to hit a balance between performance and safety.
                if(value instanceof Array){
                    value = [...value];
                }else if(typeof value === 'object' && value !== null){
                    value = {...value};
                }
                result[k] = value;
            }
        }

        if(filter.length > 0){
            return filter.reduce((obj, k) => {
                obj[k] = objectHasProperty(result, k) ? result[k as string] : null;
                return obj;
            }, {});
        }

        return result;
    }

    static getValue(name: string, key: string, includeParentValues = true): unknown{
        const result = ContextStateContent.getValues(name, [key], includeParentValues);
        return objectHasProperty(result, key) ? result[key] : null;
    }

    static setValues(name: string, newValues: object): boolean{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            return false;
        }
        let hasChanges = false;
        for(const [key, value] of Object.entries(newValues)){
            if(objectHasProperty(state.values, key) && state.values[key] !== value){
                state.values[key] = value;
                hasChanges = true;
            }
        }
        return hasChanges;
    }

    static triggerCallbacks(name: string, updateChildren = true): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            return;
        }
        for(const cbName of Object.keys(state.callbacks)){
            // Because previous callbacks may have cleared out the current callback, we need to
            // check its availability
            if(state.callbacks[cbName]){
                state.callbacks[cbName]();
            }
        }
        if(updateChildren){
            for(const childName of state.children){
                ContextStateContent.triggerCallbacks(childName);
            }
        }
    }

    static addCallback(name: string, callback: () => void): string{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to attach callback to non-existing ContextState ' + name);
            return '';
        }
        const cbId = (Math.random() + 1).toString(36).substring(2);
        state.callbacks[cbId] = callback;
        return cbId;
    }

    static removeCallback(name: string, cbId: string): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to attach callback to non-existing ContextState ' + name);
            return;
        }
        if(! objectHasProperty(state.callbacks, cbId)){
            console.warn('Trying to remove unknown callback with id ' + cbId);
            return;
        }
        delete state.callbacks[cbId];
    }

    static triggerStorageCallbacks(name: string, updatedKeys: string[]): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            return;
        }
        const path = [...state.path];
        while(path.length > 0){
            const nodeName = path.pop() as string;
            const currentState = ContextStateContent.getState(nodeName);
            if(currentState){
                for(const cbName of Object.keys(currentState.storageCallbacks)){
                    if(state.storageCallbacks[cbName]?.filter.some((f: string) => (updatedKeys.includes(f)))){
                        state.storageCallbacks[cbName].callback();
                    }
                }
            }
        }
    }

    static addStorageCallback(name: string, filter: string[], callback: () => void): string{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to attach parent callback to non-existing ContextState ' + name);
            return '';
        }
        const cbId = (Math.random() + 1).toString(36).substring(2);
        state.storageCallbacks[cbId] = {callback, filter};
        return cbId;
    }

    static removeStorageCallback(name: string, cbId: string): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to rempove parent callback to non-existing ContextState ' + name);
            return;
        }
        if(! objectHasProperty(state.storageCallbacks, cbId)){
            console.warn('Trying to remove unknown parent callback with id ' + cbId);
            return;
        }
        delete state.storageCallbacks[cbId];
    }

    static dispatch(name: string, keyOrValues: (string | object), optValue?: unknown, updateParents = true):
            void{
        const newValues: object = typeof keyOrValues === 'object' ? keyOrValues : {[keyOrValues]: optValue};
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Dispatching values on non-existing ContextState ' + name);
            return;
        }

        // NB. Below we talk about an upside down tree. Highest values are at the trunc, while lower memebers
        // are at the different branches.So the tree is traversing down.
        // We want to set the state values from the highest to the lowest listener in the tree, but we need to
        // find them in reverse order, because lower members can overload properties from higher members. We
        // need to find the lowest member who can answer to all property updates
        const stack = {};
        const setStateValues = (stateName: string, remainingValues: object, stack: object): void => {
            const state = ContextStateContent.getState(stateName);
            if(state === undefined){
                console.warn('Trying to set values on non-existing ContextState ' + stateName);
                return;
            }
            stack[stateName] = {};
            for(const k of Object.keys(state.values)){
                if(objectHasProperty(remainingValues, k)){
                    stack[stateName][k] = remainingValues[k];
                    delete remainingValues[k];
                }
            }
            if(updateParents && Object.keys(remainingValues).length > 0 && state.path.length > 1){
                const parentName: string = state.path[state.path.length - 2];
                setStateValues(parentName, remainingValues, stack);
            }
        };
        setStateValues(name, {...newValues}, stack);

        // We only apply the change at the highest member in the tree. From there the tree might change,
        // so we are going to traverse back it's children and update values from there. Note that this
        // will give a different effect when two children have set the same property. We assume the user
        // considers this when setting the state values. It's probably the most intuitive like this.
        const setNewStateValues = (nodeName: string, {...remainingValues}, isUpdate = false):
                Array<string> => {
            const state = ContextStateContent.getState(nodeName);
            if(state === undefined){
                console.warn('Trying to set values on non-existing ContextState ' + nodeName);
                return [];
            }
            const stateName: string = state.path[state.path.length - 1];
            const matchedValues = Object.keys(state.values).reduce((obj, k) => {
                if(objectHasProperty(remainingValues, k)){
                    obj[k] = remainingValues[k];
                    delete remainingValues[k];
                }
                return obj;
            }, {});
            isUpdate = isUpdate || ContextStateContent.setValues(stateName, matchedValues);
            if(isUpdate){
                ContextStateContent.triggerCallbacks(stateName, false);
                ContextStateContent.triggerStorageCallbacks(stateName, Object.keys(matchedValues));
            }
            // By now (after the triggerCallbacks) the state value should have been updated with new children
            // so traversing over them will give the latest tree of nodes.
            const itemsLeft: Array<Array<string>> = [];
            for(const childName of state.children){
                const left: Array<string> = setNewStateValues(childName, remainingValues, isUpdate);
                itemsLeft.push(left);
            }
            return Object.keys(remainingValues).filter((k) => (
                itemsLeft.every((l) => (l.includes(k)))
            ));
        };

        const parentName: (string | undefined) = state.path.find(
                (p) => (Object.keys(stack[p] || {}).length > 0));
        const keysLeft: Array<string> = parentName ? setNewStateValues(parentName, newValues) : [];

        if(keysLeft.length > 0){
            console.warn('Properties \'' + keysLeft.join('\', \'') +
                    '\' could not be set in ContextState and will be ignored.');
        }
    }

    // Loads the values from this node down to children in lower branches, ignoring the values of any parents
    // TODO: this does not support multiple items with the same key down in the tree, only the lowest one will
    // be set.
    static loadValues(name: string, values: object): void{
        const state = ContextStateContent.getState(name);
        if(state === undefined){
            console.warn('Trying to load values to a non-existing ContextState ' + name);
            return;
        }
        ContextStateContent.dispatch(name, values, undefined, false);
    }

    // Extracting all values from this node down to all the children branches. It will not return any parent
    // values.
    // TODO: this does not support multiple items with the same key down in the tree, only the lowest one will
    // be returned.
    static extractValues(name: string, filter: Array<string> = []): Record<string, unknown>{
        const stack: stateItemType[] = [];
        for(const state of ContextStateContent.state.values()){
            if(state.path.includes(name)){
                stack.push(state);
            }
        }
        stack.sort((a, b) => (b.path.length - a.path.length));
        const values = {};
        for(const node of stack){
            for(const [key, value] of Object.entries(node.values)){
                if(filter.length > 0 && ! filter.includes(key)){
                    continue;
                }
                values[key] = value;
            }
        }
        return values;
    }
}

export {ContextStateContent};
