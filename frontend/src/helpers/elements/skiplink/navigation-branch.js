import React from 'react';
import {PropTypes} from 'prop-types';
import {SkiplinkIndex} from './index.js';
import './skiplink.scss';

function SkiplinkNavigationBranch(props){
    const branch = props.branch ? props.branch : SkiplinkIndex.getIndex();

    const toElement = (element) => {
        element.focus();
    };

    return <ul>
        {branch.children.map((node) => (
            <li key={node.id}>
                <button tabIndex="5" onClick={() => {toElement(node.element);}}
                        className="btn-transparent">
                    {node.label}
                </button>
                {node.children.length > 0 ?
                    <SkiplinkNavigationBranch branch={node}/> :
                    null
                }
            </li>
        ))}
    </ul>;
}

SkiplinkNavigationBranch.propTypes = {
    branch: PropTypes.object
};

export {SkiplinkNavigationBranch};
