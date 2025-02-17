import {extend} from '../functions/extend.js';

const SvgArc = {

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    describeArc(x, y, radius, startAngle, endAngle, s='M'){

        let start = SvgArc.polarToCartesian(x, y, radius, endAngle);
        let end = SvgArc.polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
        let sweepFlag = (s==='M')? 0: 1;

        let d = [
            s, start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
        ].join(' ');

        return d;
    },

    getPath(data){
        data = extend(data, {
            x: 0,
            y: 0,
            radius: 10,
            innerRadius: 0,
            a1: 0,
            a2: 360
        });
        let d = SvgArc.describeArc(data.x, data.y, data.radius, data.a1, data.a2);
        if(data.innerRadius === 0){
            d += ' Z'
        }else{
            d += SvgArc.describeArc(data.x, data.y, data.innerRadius, data.a2, data.a1, 'L');
            let p = SvgArc.polarToCartesian(data.x, data.y, data.radius, data.a2);
            d += 'L ' + p.x + ' ' + p.y + ' Z';
        }
        return d;
    }


}

export default SvgArc;
