import {useEffect, useCallback, useState} from 'react';
import {SimpleEvent} from './simple-event.ts';

const useClickOutsideElement = function(callback, rootElement = document.body, isActive = true){
    const [element, setElement] = useState(null);
    const measuredRef = useCallback((node) => {
        setElement(node);
        // We need to make the parent element focusable, to when clicking inside the element either this
        // element or one of its children will get the focus.
        // TODO: check if there could be a reason for React to reset these attributes at some point.
        if(node !== null){
            if(! node.getAttribute('tabindex')){
                node.setAttribute('tabindex', '-1');
            }
            node.setAttribute('focasable', 'true');
        }
    }, []);

    useEffect(() => {
        const onRootElementClick = (event) => {
            let node = event.target;
            if(element !== null && node !== element){
                while(node.parentNode && node.parentNode !== rootElement &&
                        node.parentNode !== document.body){
                    node = node.parentNode;
                    if(node === element){
                        // click inside the element, do not trigger the callback
                        return;
                    }
                }
                // element not found, so the click was outside the element. Apply the callback
                callback(event);
            }
        };

        // We are using the focus event rather than a click, so that this also works with keyboard navigation
        const eventFocus = isActive ? new SimpleEvent(rootElement, 'focus', onRootElementClick, true) : null;
        // However when we click an element that cannot receive focus (e.g. body), the focus is not moved, but
        // we still want to close the element.
        const eventClick = isActive ? new SimpleEvent(rootElement, 'click', onRootElementClick) : null;

        return () => {
            if(eventFocus){
                eventFocus.remove();
            }
            if(eventClick){
                eventClick.remove();
            }
        };
    }, [rootElement, callback, element, isActive]);

    return measuredRef;
};

export {useClickOutsideElement};
