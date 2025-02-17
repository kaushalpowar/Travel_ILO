export function reverse(array, n){
    let t; let j = array.length; let i = j - n;
    while(i < --j){
        t = array[i];
        array[i++] = array[j];
        array[j] = t;
    }
}

export function bisect(a, x){
    let lo = 0; let hi = a.length;
    while(lo < hi){
        const mid = lo + hi >>> 1;
        if(a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
