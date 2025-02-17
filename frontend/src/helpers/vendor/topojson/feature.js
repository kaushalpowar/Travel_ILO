/* eslint-disable*/
import {absolute as transformAbsolute} from './transform.js';
import {reverse} from './array.js';

export function getTopojsonFeature(topology, o) {
    return o.type === 'GeometryCollection' ? {
        type: 'FeatureCollection',
        features: o.geometries.map(function(o){return feature(topology, o);})
    } : feature(topology, o);
}

export function feature(topology, o){
    const f = {
        type: 'Feature',
        id: o.id,
        properties: o.properties || {},
        geometry: object(topology, o)
    };
    if(o.id == null) delete f.id;
    return f;
}

export function object(topology, o){
    const absolute = transformAbsolute(topology.transform);
    const arcs = topology.arcs;

    function arc(i, points){
        if(points.length) points.pop();
        for(var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k){
            points.push(p = a[k].slice());
            absolute(p, k);
        }
        if(i < 0) reverse(points, n);
    }

    function point(p){
        p = p.slice();
        absolute(p, 0);
        return p;
    }

    function line(arcs){
        const points = [];
        for(let i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if(points.length < 2) points.push(points[0].slice());
        return points;
    }

    function ring(arcs){
        const points = line(arcs);
        while(points.length < 4) points.push(points[0].slice());
        return points;
    }

    function polygon(arcs){
        return arcs.map(ring);
    }

    function geometry(o){
        const t = o.type;
        return t === 'GeometryCollection' ? {type: t, geometries: o.geometries.map(geometry)} :
        t in geometryType ? {type: t, coordinates: geometryType[t](o)} :
        null;
    }

    const geometryType = {
        Point(o){return point(o.coordinates);},
        MultiPoint(o){return o.coordinates.map(point);},
        LineString(o){return line(o.arcs);},
        MultiLineString(o){return o.arcs.map(line);},
        Polygon(o){return polygon(o.arcs);},
        MultiPolygon(o){return o.arcs.map(polygon);}
    };

    return geometry(o);
}

export default getTopojsonFeature;
