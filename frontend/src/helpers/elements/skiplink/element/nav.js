import React from 'react';
import {PropTypes} from 'prop-types';

function SkiplinkElementNav(props){
    const {forwardRef, ...otherProps} = props;
    return <nav ref={forwardRef} {...otherProps}/>;
}

SkiplinkElementNav.propTypes = {
    forwardRef: PropTypes.func
};

SkiplinkElementNav.defaultTypes = {
    forwardRef: () => {null;}
};

export {SkiplinkElementNav};
