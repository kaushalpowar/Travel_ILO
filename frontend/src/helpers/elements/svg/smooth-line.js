import React from 'react';
import {PropTypes} from 'prop-types';

const SvgSmoothLine = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    // Properties of a line
    // I:  - pointA (array) [x,y]: coordinates
    //     - pointB (array) [x,y]: coordinates
    // O:  - (object) { length: l, angle: a }: properties of the line
    const getLineProperties = (pointA, pointB) => {
        const lengthX = pointB[0] - pointA[0];
        const lengthY = pointB[1] - pointA[1];
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    };

    // Position of a control point
    // I:  - current (array) [x, y]: current point coordinates
    //     - previous (array) [x, y]: previous point coordinates
    //     - next (array) [x, y]: next point coordinates
    //     - reverse (boolean, optional): sets the direction
    // O:  - (array) [x,y]: a tuple of coordinates
    const getControlPoint = (current, previous, next, reverse) => {
        // When 'current' is the first or last point of the array
        // 'previous' or 'next' don't exist.
        // Replace with 'current'
        const p = previous || current;
        const n = next || current;
        const cref = reverse ? p : n;

        // Properties of the opposed-line
        const o = getLineProperties(p, n);
        const crefl = getLineProperties(current, cref);

        // If is end-control-point, add PI to the angle to go backward
        const angle = o.angle + (reverse ? Math.PI : 0);

        // the larger the difference in angle between the tangent line and the line between the current point
        // and the control point, the less we apply smoothing to allow for a sharper corner.
        const dAngle = (o.angle % (0.5 * Math.PI)) - (crefl.angle % (0.5 * Math.PI));
        const fact = Math.max(0.2, Math.abs(dAngle) / Math.PI);
        // NB the length of the control point is proportional to distance of the current point to the
        // next/previous, not the full distance between previous and next. Any smoothing factor beyond 1 is
        // expected to result in weird shapes.
        const length = crefl.length * props.smoothing;

        // The control point position is relative to the current point
        const x = current[0] + Math.cos(angle) * fact * length;
        const y = current[1] + Math.sin(angle) * fact * length;
        return [x, y];
    };

    // Create the bezier curve command
    // I:  - point (array) [x,y]: current point coordinates
    //     - i (integer): index of 'point' in the array 'a'
    //     - a (array): complete array of points coordinates
    // O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
    const getBezierPath = (point, i, a) => {
        // start control point
        const cps = getControlPoint(a[i - 1], a[i - 2], point);

        // end control point
        const cpe = getControlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
    };

    // build the d attributes by looping over the points
    const d = props.points.reduce((acc, point, i, a) => (
        i === 0 ?
            `M ${point[0]},${point[1]}` :
            `${acc} ${getBezierPath(point, i, a)}`
    ), '');

    return <path d={d} style={props.style} className={props.className} {...props.attributes}/>;
};

SvgSmoothLine.propTypes = {
    points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    smoothing: PropTypes.number,
    style: PropTypes.object,
    attributes: PropTypes.object,
    className: PropTypes.string
};

const defaultProps = {
    smoothing: 0.2,
    style: {},
    attributes: {},
    className: ''
};

export {SvgSmoothLine};
