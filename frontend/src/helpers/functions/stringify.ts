import {objectHasProperty} from './objects.ts';

const stringify = function(input: unknown): string{
    let result = '';
    if(typeof input == 'undefined' || input == null){
        return result;
    }
    if(typeof input == 'function'){
        result = input.toString();
    }else if(typeof input == 'object'){
        if(input instanceof Array){
            for(let k = 0; k < input.length; k++){
                result += stringify(input[k]);
            }
        }else if(input instanceof Map){
            for(const [k, v] of input){
                result += stringify(k) + ': ' + stringify(v) + ',';
            }
        }else if(input instanceof Set){
            for(const v of input){
                result += stringify(v) + ',';
            }
        }else if(input.constructor && input.constructor !== Object){
            // do not stringify class instances, but try to get the unique id
            const uid = objectHasProperty(input, 'uid') ? (input as Record<string, string>).uid : '-';
            result += input.constructor.name + '[' + uid + ']';
        }else{
            // eslint-disable-next-line guard-for-in
            for(const k in input){
                result += k + ': ' + stringify(input[k]);
            }
        }
    }else{
        result = input.toString();
    }
    return result;
};

export {stringify};
