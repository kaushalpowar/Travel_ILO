import React from 'react';
import './grid.scss';

const ViewGridRow = function(props){
    return <div className="zol-grid-row">
        {props.children}
    </div>;
};

export {ViewGridRow};
