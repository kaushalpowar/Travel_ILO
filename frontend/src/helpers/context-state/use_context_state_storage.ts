import {useState, useEffect, useContext} from 'react';
import {ContextStateContext} from './context.tsx';
import {ContextStateContent} from './content.ts';
import {objectsEqual} from '../functions/objects.ts';

type dispatcherType = (values: object) => void;
type useContextStateReturnType = [Record<string, unknown>, dispatcherType];

const useContextStateStorage = function(filter: Array<string> = [], showWarning = true):
        useContextStateReturnType{
    const statePath : Array<string> = useContext(ContextStateContext);
    const stateName : (string | null) = statePath ? statePath[statePath.length - 1] : null;
    const [result, setResult] = useState<Record<string, unknown>>(
            stateName ? ContextStateContent.getValues(stateName, filter) : {});

    useEffect(() => {
        if(! stateName){
            return;
        }
        const callback = () => {
            const res = ContextStateContent.extractValues(stateName, filter);
            // Check if anything has changed to filtered values to prevent unrequired updates
            for(const [key, value] of Object.entries(res)){
                // when we have an object, check if the object has different content
                if(typeof value === 'object' && typeof result[key] === 'object'){
                    if(! objectsEqual(value, result[key])){
                        setResult(res);
                        break;
                    }
                }else if(value !== result[key]){
                    setResult(res);
                    break;
                }
            }
        };

        const cbId = ContextStateContent.addStorageCallback(stateName, filter, callback);
        // Check for updates that may have occured before the callback was added
        callback();

        return () => {
            ContextStateContent.removeStorageCallback(stateName, cbId);
        };
    }, [stateName, filter, result]);

    if(! statePath || stateName === null){
        if(showWarning){
            console.warn('Calling useContextStateStorage is outside the context of any ContextState. Make ' +
                'sure to set up an initial ContextState first before calling this hook.');
        }
        return [{}, () => {null;}];
    }

    const dispatcher = (values: object) => {
        ContextStateContent.loadValues(stateName, values);
    };

    for(const key of filter){
        if(! Object.prototype.hasOwnProperty.call(result, key)){
            result[key] = undefined;
        }
    }

    return [result, dispatcher];
};

export {useContextStateStorage, dispatcherType};
