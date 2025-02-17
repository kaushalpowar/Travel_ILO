// TODO: we want to get rid of this dependency. Is there a better way to set this configuration?
import {CONFIG} from '../../config.js';
import {urlStateType} from './compile_url.ts';

export const parseUrl = function(url: string): urlStateType{
    const location = new URL(url);
    const path = location.pathname.length <= CONFIG.application_root.length ?
            '' : location.pathname.substring(CONFIG.application_root.length);
    return {
        path: parsePath(path),
        query: parseQuery(location.search),
        hash: parseHash(location.hash)
    };
};

const parsePath = (path: string): Array<string | null> => {
    if(path.length <= 1){
        return [];
    }
    const result: string[] = [];
    // remove the trailing and starting slash when present
    const l = path.length;
    if(l >= 1 && path.substring(l - 1) === '/'){
        path = path.substring(0, l - 1);
    }
    if(l >= 1 && path.substring(0, 1) === '/'){
        path = path.substring(1);
    }
    const parts = path.split('/');
    for(let i = 0; i < parts.length; i++){
        result.push(decodeURIComponent(parts[i]));
    }
    return result;
};

const parseQuery = (query: string): object => {
    if(query.length <= 1){
        return {};
    }
    const parts = query.substring(1).split('&');
    const queryParams = {};
    for(const part of parts){
        const param = part.split('=');
        queryParams[decodeURIComponent(param[0])] = param.length > 1 ? decodeURIComponent(param[1]) : null;
    }
    return queryParams;
};

// values in the hash are stored separated with a collon
const parseHash = (hash: string): Array<string | null> => (
    parsePath(hash.replace('#', '/').replace(/:/g, '/'))
);
