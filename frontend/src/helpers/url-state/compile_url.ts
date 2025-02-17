// TODO: we want to get rid of this dependency. Is there a better way to set this configuration?
import {CONFIG} from '../../config.js';

export type urlStateType = {
    path: Array<string | null>,
    query: object,
    hash: Array<string | null>
};

export const compileUrl = (state: urlStateType) => {
    const path = compilePath(state.path);
    const query = compileQuery(state.query);
    const hash = compileHash(state.hash);
    let root = CONFIG.application_root;
    if(root.length >= 1 && root.substring(root.length - 1) === '/'){
        root = root.substring(0, root.length - 1);
    }
    return root + path + query + hash;
};

const compilePath = (path: Array<string | null>) => {
    const pathEncoded = path.map((param) => (param === null ? '' : encodeURIComponent(param)));
    return pathEncoded.length > 0 ? ('/' + pathEncoded.join('/')).replace(/\/+$/, '') : '';
};

const compileQuery = (query: object) => {
    const queryEncoded: string[] = [];
    for(const param of Object.keys(query)){
        if(query[param] !== null){
            queryEncoded.push(param + '=' + encodeURIComponent(query[param]));
        }
    }
    return queryEncoded.length > 0 ? '?' + queryEncoded.join('&') : '';
};

const compileHash = (hash: Array<string | null>) => {
    const hashEncoded = hash.map((param) => (param === null ? '' : encodeURIComponent(param)));
    const hashResult = hashEncoded.join(':').replace(/:+$/, '');
    return hashResult.length > 0 ? '#' + hashResult : '';
};
