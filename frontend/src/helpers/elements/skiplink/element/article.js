import React from 'react';
import {PropTypes} from 'prop-types';

function SkiplinkElementArticle(props){
    const {forwardRef, ...otherProps} = props;
    return <article ref={forwardRef} {...otherProps}/>;
}

SkiplinkElementArticle.propTypes = {
    forwardRef: PropTypes.func
};

SkiplinkElementArticle.defaultTypes = {
    forwardRef: () => {null;}
};

export {SkiplinkElementArticle};
