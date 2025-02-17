import {stringify} from './stringify.ts';

const getHash = function(input?: unknown): string{
    // when no input is given, generate a random hash
    if(input === undefined){
        input = Math.random().toString(36).substring(2, 15);
    }
    if(typeof input !== 'string'){
        input = stringify(input);
    }
    const inputStr = input as string;
    if(inputStr.length === 0){
        return '0';
    }
    let hash = 0;
    for(let i = 0; i < inputStr.length; i++){
        const char = inputStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return ((hash < 0) ? 'a' : 'b') + Math.abs(hash).toString(36);
};

export {getHash};
