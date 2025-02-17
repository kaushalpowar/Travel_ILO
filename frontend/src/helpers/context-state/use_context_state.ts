import {useState, useEffect, useContext} from 'react';
import {ContextStateContext} from './context.tsx';
import {ContextStateContent} from './content.ts';
import {objectsEqual} from '../functions/objects.ts';

type dispatcherType = (keyOrValues: string | object, optValue?: unknown) => void;
type useContextStateReturnType = [Record<string, unknown>, dispatcherType];

const useContextState = function(filter: Array<string> = [], showWarning = true) : useContextStateReturnType{
    const statePath : Array<string> = useContext(ContextStateContext);
    const stateName : (string | null) = statePath ? statePath[statePath.length - 1] : null;
    const [result, setResult] = useState<Record<string, unknown>>(
            stateName ? ContextStateContent.getValues(stateName, filter) : {});

    useEffect(() => {
        if(! stateName){
            return;
        }
        const callback = () => {
            const res = ContextStateContent.getValues(stateName, filter);
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

        const cbId = ContextStateContent.addCallback(stateName, callback);
        // Check for updates that may have occured before the callback was added
        callback();

        return () => {
            ContextStateContent.removeCallback(stateName, cbId);
        };
    }, [stateName, filter, result]);

    if(! statePath || stateName === null){
        if(showWarning){
            console.warn('Calling useContextState outside the context of a ContextState. Make sute to set ' +
                'up a ContextState first before calling the hook.');
        }
        return [{}, () => {null;}];
    }

    const dispatcher = (keyOrValues: (string | object), optValue?: unknown) => {
        ContextStateContent.dispatch(stateName, keyOrValues, optValue);
    };

    for(const key of filter){
        if(! Object.prototype.hasOwnProperty.call(result, key)){
            result[key] = undefined;
        }
    }

    return [result, dispatcher];
};

export {useContextState, dispatcherType};
