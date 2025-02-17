import {useState, useEffect} from 'react';
import {useContextStateStorage} from '../context-state/use_context_state_storage.ts';
import {useUrlState} from './use_url_state.ts';

// The timer makes sure that when trying to update the state both from ContextState and UrlState, only one
// will be executed. This prevents an infinite loop of updates. Priority is given to the UrlState, since this
// is the more persistent state.
let timerId: (number | undefined) = undefined;

const useUrlContextState = function(path: string[], query: string[], hash: string[],
        defaultValues: Record<string, string> = {}): Record<string, string>{
    const [state, dispatcher] = useContextStateStorage([...path, ...query, ...hash]);
    const [urlValues, setUrlValues] = useUrlState(path, query, hash);
    const [defaults] = useState<Record<string, string>>(
            {...state, ...defaultValues} as Record<string, string>);

    useEffect(() => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            setUrlValues(state as Record<string, string>);
        }, 100);
    }, [state]);

    useEffect(() => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            const values = Object.keys(urlValues).reduce((obj, key) => {
                obj[key] = (urlValues[key] === null || urlValues[key] === undefined) ?
                        defaults[key] : urlValues[key];
                return obj;
            }, {});
            dispatcher(values);
        }, 100);
    }, [urlValues]);

    return state as Record<string, string>;
};

export {useUrlContextState};
