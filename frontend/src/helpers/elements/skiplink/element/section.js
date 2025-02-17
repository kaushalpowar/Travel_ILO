import React from 'react';
import {PropTypes} from 'prop-types';

function SkiplinkElementSection(props){
    const {forwardRef, ...otherProps} = props;
    return <section ref={forwardRef} {...otherProps}/>;
}

SkiplinkElementSection.propTypes = {
    forwardRef: PropTypes.func
};

SkiplinkElementSection.defaultTypes = {
    forwardRef: () => {null;}
};

export {SkiplinkElementSection};
