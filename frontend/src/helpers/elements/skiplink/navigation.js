import React, {useState, useCallback, useEffect} from 'react';
import {SkiplinkNavigationBranch} from './navigation-branch.js';
import './skiplink.scss';
import {SimpleEvent} from '../../simple-event.ts';

function SkiplinkNavigation(){
    // Note that we want to update the menu each time it will get focussed (things might have changed).
    const [isOpen, setIsOpen] = useState(false);
    const [element, setElement] = useState(null);
    const measuredRef = useCallback((node) => {
        setElement(node);
    }, []);

    useEffect(() => {
        // When pressing alt + 1 open up the skip link navigation
        const event = new SimpleEvent(document, 'keydown', (event) => {
            if(event.keyCode == 49 && event.altKey){
                element.focus();
            }
        });
        const event2 = new SimpleEvent(window, 'focus', () => {
            if(element){
                setIsOpen(element === document.activeElement || element.contains(document.activeElement));
            }
        }, true);

        return () => {
            event.remove();
            event2.remove();
        };
    }, [element]);

    return <nav tabIndex="5" role="button" aria-expanded={isOpen} className="zol-skiplink-navigation"
            id="zol-skiplink-navigation" ref={measuredRef}>
        <h4>Jump to section (Alt + 1)</h4>
        {isOpen ? <SkiplinkNavigationBranch/> : null}
    </nav>;
}

export {SkiplinkNavigation};
