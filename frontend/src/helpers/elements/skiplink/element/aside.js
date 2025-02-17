import React from 'react';
import {PropTypes} from 'prop-types';

function SkiplinkElementAside(props){
    const {forwardRef, ...otherProps} = props;
    return <aside ref={forwardRef} {...otherProps}/>;
}

SkiplinkElementAside.propTypes = {
    forwardRef: PropTypes.func
};

SkiplinkElementAside.defaultTypes = {
    forwardRef: () => {null;}
};

export {SkiplinkElementAside};
