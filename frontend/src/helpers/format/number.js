
export const formatNumber = function(value, shorten = false, precision = 4){
    if(value === null){
        return '';
    }
    value = parseFloat(value);
    if(isNaN(value)){
        return '-';
    }

    if(shorten && Math.abs(value) >= 1000000000){
        value = (value / 1000000000) + ' B';
    }else if(shorten && Math.abs(value) >= 1000000){
        value = (value / 1000000) + ' M';
    }else if(shorten === 'kilo' && Math.abs(value) >= 1000){
        value = (value / 1000) + ' k';
    }

    const parts = value.toString().split('.');
    const decimals = precision - parts[0].length;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if(parts[1] !== undefined){
        let d = parts[1].split(' ');
        if(decimals <= 0){
            d = d[1] ? [' ' + d[1]] : [];
        }else{
            d[0] = '.' + d[0].substring(0, decimals);
        }
        parts[1] = d.join(' ');
    }
    return parts.join('');
};
