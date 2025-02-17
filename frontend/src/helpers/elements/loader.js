import React from 'react';
import {PropTypes} from 'prop-types';
import './loader.css';

const Loader = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    const borderStyle = Math.round(0.15 * props.size) + 'px solid rgba(' + props.color.join(',') + ',0.2)';
    const style = {
        marginTop: (-0.65 * props.size) + 'px',
        marginLeft: (-0.65 * props.size) + 'px',
        borderTop: Math.round(0.15 * props.size) + 'px solid rgb(' + props.color.join(',') + ')',
        borderRight: borderStyle,
        borderBottom: borderStyle,
        borderLeft: borderStyle,
        width: props.size + 'px',
        height: props.size + 'px'
    };

    return <div className="zol-loader-default" role="progressbar" aria-label="Loading data"
            aria-valuetext="please wait">
        <div style={style}/>
    </div>;
};

const defaultProps = {
    size: 50,
    color: [255, 255, 255]
};

Loader.propTypes = {
    size: PropTypes.number,
    color: PropTypes.arrayOf(PropTypes.number)
};

export {Loader};
