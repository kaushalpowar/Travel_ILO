import {useState, useEffect} from 'react';
import {SimpleEvent} from '../simple-event.ts';
import {urlStateType, compileUrl} from './compile_url.ts';
import {parseUrl} from './parse_url.ts';
import {objectsEqual} from '../functions/objects.ts';

type dispatcherType = (values: Record<string, string>) => void;
type useUrlStateReturnType = [Record<string, string>, dispatcherType];

const useUrlState = function(path: string[], query: string[], hash: string[]): useUrlStateReturnType{
    const getUrlState = (): Record<string, string> => {
        const urlState: urlStateType = parseUrl(window.location.href);
        const values = {};
        for(const key of hash){
            values[key] = urlState.hash.shift() || null;
        }
        for(const key of query){
            values[key] = query[key] || null;
        }
        for(const key of path){
            values[key] = urlState.path.shift() || null;
        }
        return values;
    };
    const [result, setResult] = useState<Record<string, string>>(getUrlState());

    useEffect(() => {
        const event = new SimpleEvent(window, 'popstate', () => {
            const values = getUrlState();
            // Check if anything has changed to filtered values to prevent unrequired updates
            for(const [key, value] of Object.entries(values)){
                if(value !== result[key]){
                    setResult(values);
                    break;
                }
            }
        });

        const urlState: urlStateType = {path: [], query: {}, hash: []};
        for(const key of hash){
            urlState.hash.push(result[key] || null);
        }
        for(const key of query){
            urlState.query[key] = result[key] || null;
        }
        for(const key of path){
            urlState.path.push(result[key] || null);
        }
        const url = compileUrl(urlState);
        if(! objectsEqual(getUrlState(), result)){
            window.history.pushState(urlState, '', url);
        }

        return () => {
            event.remove();
        };
    }, [path, query, hash, result]);

    return [result, setResult];
};

export {useUrlState};
