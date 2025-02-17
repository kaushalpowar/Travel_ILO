const orderBy = function(data, field, sortOrder, returnCopy = false){
    if(! (data instanceof Array)){
        console.warn('Trying to sort ' + (typeof object) + '. Array expected.');
        return;
    }
    const result = returnCopy ? data.slice(0) : data;
    if(! field){
        return result;
    }
    result.sort((a, b) => {
        const bf = b[field] ? b[field] : '';
        const af = a[field] ? a[field] : '';
        if(sortOrder && sortOrder.toLowerCase() === 'desc'){
            return bf.toString().trim().localeCompare(af.toString().trim(), undefined, {numeric: true});
        }
        return af.toString().trim().localeCompare(bf.toString().trim(), undefined, {numeric: true});
    });

    return result;
};

export {orderBy};
