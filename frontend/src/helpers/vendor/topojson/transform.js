import noop from './noop.js';

export function absolute(transform){
    if(!transform) return noop;
    let x0;
    let y0;
    const kx = transform.scale[0];
    const ky = transform.scale[1];
    const dx = transform.translate[0];
    const dy = transform.translate[1];
    return function(point, i){
        if(!i) x0 = y0 = 0;
        point[0] = (x0 += point[0]) * kx + dx;
        point[1] = (y0 += point[1]) * ky + dy;
    };
}

export function relative(transform){
    if(!transform) return noop;
    let x0;
    let y0;
    const kx = transform.scale[0];
    const ky = transform.scale[1];
    const dx = transform.translate[0];
    const dy = transform.translate[1];
    return function(point, i){
        if(!i) x0 = y0 = 0;
        const x1 = Math.round((point[0] - dx) / kx);
        const y1 = Math.round((point[1] - dy) / ky);
        point[0] = x1 - x0;
        point[1] = y1 - y0;
        x0 = x1;
        y0 = y1;
    };
}
