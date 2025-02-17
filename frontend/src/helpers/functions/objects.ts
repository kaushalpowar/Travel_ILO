
const objectsEqual = function(x: unknown, y: unknown){
    const jsonOrdered = function(obj: unknown){
        return JSON.stringify(obj,
                function(key: string, value: unknown){
                    if(value instanceof Object && ! Array.isArray(value)){
                        return Object.keys(value).sort().reduce(function(ret: object, key: string){
                            ret[key] = value[key];
                            return ret;
                        }, {});
                    }else if(Array.isArray(value)){
                        value.sort(function(a: unknown, b: unknown){
                            if(typeof a === 'object' && typeof b === 'object' && a !== null && b !== null){
                                if(objectHasProperty(a, 'order') && objectHasProperty(b, 'order')){
                                    return (a as Record<string, number>).order -
                                            (b as Record<string, number>).order;
                                }
                            }
                            if(typeof a === 'number' && typeof b === 'number'){
                                return a < b ? -1 : 1;
                            }
                            if(typeof a === 'string' && typeof b === 'string'){
                                return a.localeCompare(b);
                            }
                            return 0;
                        });
                    }
                    return value;
                });
    };
    return jsonOrdered(x) === jsonOrdered(y);
};

const objectHasProperty = function(obj: object, key: string): boolean{
    return Object.prototype.hasOwnProperty.call(obj, key);
};

export {objectsEqual, objectHasProperty};
