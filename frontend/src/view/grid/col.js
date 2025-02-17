import React from 'react';
import {PropTypes} from 'prop-types';
import cssVariables from './grid.module.scss';
import './grid.scss';

const ViewGridCol = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    const width = 'calc(' + props.width + '% - ' + cssVariables.columnSpacing + 'px';
    return <div className="zol-grid-col" style={{width}}>
        {props.children}
    </div>;
};

const defaultProps = {
    width: 100,
    minWidth: 'auto'
};

ViewGridCol.propTypes = {
    width: PropTypes.number
};

export {ViewGridCol};
