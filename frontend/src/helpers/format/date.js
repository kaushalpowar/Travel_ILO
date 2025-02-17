export const formatDate = function(value, compact=true){
    if(! value || typeof value !== 'string'){
        return '-';
    }
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
            'August', 'September', 'October', 'November', 'December'];
    // transform format dd/mm/yyyy to yyyy-mm-dd
    
    let monthAbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    // for(let i = 0; i < monthAbr.length; i++){
    //     value = value.replace(monthAbr[i], ('0' +(i+1)).substring(0,2));
    // }

    let p = [];
    if(value.indexOf(' ') !== -1){
        value = value.substring(0, value.indexOf(' '));
    }
    if(value.indexOf('/') !== -1){
        p = value.split('/');
    }else if(value.indexOf('-') !== -1){
        p = value.split('-');
    }
    if(p.length === 3){
        if(p[0].length !== 4 || (p[0].length !== 4 && p[2].length !== 4)){   // dd-mm-yy format instead of yyyy-mm-dd, other option is dd-mon-yy
            if(monthAbr.indexOf(p[1].toUpperCase()) !== -1){
                p[1] = ('0' + (monthAbr.indexOf(p[1].toUpperCase())+1)).slice(-2);
            }else{
                p[1] = ('0' + parseInt(p[1], 10)).slice(-2);
            }
            p[0] = ('0' + parseInt(p[0], 10)).slice(-2);
            p[2] = ('20' + p[2]).slice(-4);
            value = p[2] + '-' + p[1] + '-' + p[0];
        }
    }

    let d = new Date(value);
    if(compact){
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }else{
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
}

export const formatDateTime = function(date){
    if(! (date instanceof Date)){
        date = new Date(date);
    }
    
    return date.getFullYear() + "-" + ("0"+(date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + " " +  
            ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
}