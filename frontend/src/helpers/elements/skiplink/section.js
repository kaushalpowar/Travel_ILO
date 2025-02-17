import React, {useState, useEffect, useCallback} from 'react';
import {PropTypes} from 'prop-types';
import {SkiplinkIndex} from './index.js';
import {ContextState} from '../../context-state/context-state.tsx';
import {useContextState} from '../../context-state/use_context_state.ts';
import {SkiplinkElementSection} from './element/section.js';
import {SkiplinkElementAside} from './element/aside.js';
import {SkiplinkElementNav} from './element/nav.js';
import {SkiplinkElementArticle} from './element/article.js';

function SkiplinkSection(inputProps){
    const props = {...defaultProps, ...inputProps};
    const [uid] = useState('sls-' + (Math.random() + 1).toString(36).substring(7));
    const [parentValues] = useContextState(['skiplinkSectionPath'], false);
    const [element, setElement] = useState(null);
    const skiplinkSectionPath = [...(parentValues?.skiplinkSectionPath || []), uid];
    const {labelledby, label, Element, forwardRef, includeButton, ...otherProps} = props;

    const measuredRef = useCallback((node) => {
        if(node !== element){
            setElement(node);
        }
        if(forwardRef){
            forwardRef(node);
        }
    }, []);

    useEffect(() => {
        if(element !== null){
            SkiplinkIndex.addSection(uid, {element, path: skiplinkSectionPath, label, labelledby});
        }
        return () => {
            SkiplinkIndex.removeSection(uid);
        };
    }, [element, skiplinkSectionPath, label, labelledby]);

    const attributes = {
        forwardRef: measuredRef,
        focusable: 'true',
        tabIndex: -1, // setting this to -1 makes the element focussable, but it will be skipped while tabbing
        ...otherProps
    };
    if(labelledby){
        attributes['aria-labelledby'] = labelledby;
    }else{
        attributes['aria-label'] = label;
    }

    const openSkiplink = () => {
        const element = document.getElementById('zol-skiplink-navigation');
        if(element){
            element.focus();
        }
    };

    return <ContextState initial={{skiplinkSectionPath}}>
        <Element {...attributes}>
            {props.children}
            {includeButton ?
                <button className="btn-transparent zol-skiplink-open" onClick={openSkiplink}>
                    Open skip-link navigation
                </button> :
                null
            }
        </Element>
    </ContextState>;
}

SkiplinkSection.propTypes = {
    label: PropTypes.string,
    labelledby: PropTypes.string,
    forwardRef: PropTypes.func,
    Element: PropTypes.elementType,
    includeButton: PropTypes.bool
};

const defaultProps = {
    Element: SkiplinkElementSection,
    includeButton: false
};

export {SkiplinkSection, SkiplinkElementAside, SkiplinkElementNav, SkiplinkElementArticle};
