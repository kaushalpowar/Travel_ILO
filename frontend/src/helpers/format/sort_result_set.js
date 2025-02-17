
// resultset is an array of objects, order is a string with column name a space and the sort order, like:
// 'year asc' or 'country desc'.
const sortResultSet = function(resultSet, order){
    if(! (resultSet instanceof Array)){
        return [];
    }
    const cleanUpNumber = (raw) => (
        raw.replaceAll('%', '').replaceAll(',', '').replaceAll('$', '').replace(/\s/g, '')
    );
    const o = order.split(' ');
    const direction = o.length > 1 ? (o.pop() === 'desc' ? -1 : 1) : 1;
    const column = o.join(' ');
    return [...resultSet].sort((a, b) => {
        if(a[column] === b[column]){
            return 0;
        }
        if(typeof a[column] === 'string' && typeof b[column] === 'string'){
            // check if the value is numeric anyway, so we sort it correctly
            const cA = cleanUpNumber(a[column]);
            const cB = cleanUpNumber(b[column]);
            if(! isNaN(cA) && ! isNaN(cB)){
                return (parseFloat(cA) - parseFloat(cB)) * direction;
            }
            return a[column].localeCompare(b[column]);
        }
        return a[column] > b[column] ? direction : -direction;
    });
};

export {sortResultSet};
