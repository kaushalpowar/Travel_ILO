import React from 'react';
import './layout.scss';
import {ViewHeader} from './header/header.js';
import {ViewFooter} from './footer/footer.js';

const ViewMain = function(props){
    return <div className="main">
        <ViewHeader/>

        <div className="content-row">
            {props.children}
        </div>

        <ViewFooter/>

    </div>;
};

export {ViewMain};
