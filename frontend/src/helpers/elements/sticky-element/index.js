import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {SimpleEvent} from '../../simple-event.ts';
import './style.scss';

/**
 * This element will stick into view while scrolling. If the element doesn't fit in the view it will scroll
 * until it is completely visible and 'sticks' afterwards. The sticky element set itself 100% of the parent
 * and therefore it typically cannot share the parent container with other siblings.
 * By default it asumes scrolling is done in the window, but it should also support a scrollable container,
 * this has not been tested yet.
 */
const StickyElement = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    const [element, setElement] = useState(null);
    const menuRef = useCallback((node) => {
        if(node !== null){
            setElement(node);
        }
    }, []);

    // stores the previous scroll position of the content inside panel as well as the offset of the element
    const [positions, setPositions] = useState({
        scrollTop: 0,
        offsetTop: 0,
        height: 0
    });

    // Note that the event argument can also be a ResizeObserverEntry.
    const updatePosition = function(event){
        if(element === null){
            return;
        }
        const scrollTop = event.scrollContainer ?
                event.scrollContainer.scrollTop :
                (props.scrollContainer === window ? window.scrollY : props.scrollContainer.scrollTop);

        const viewHeight = event.scrollContainer ?
                (event.scrollContainer.clientHeight || event.scrollContainer.innerHeight || 0) :
                (props.scrollContainer === window ? window.innerHeight : props.scrollContainer.clientHeight);

        // both top and bottom are negative when out of view
        const cb = element.getBoundingClientRect();
        const top = cb.top;
        const bottom = viewHeight - cb.bottom;

        // both top and bottom are negative when out of view
        const pb = element.parentElement.getBoundingClientRect();
        const parentTop = pb.top;
        const parentBottom = viewHeight - pb.bottom;

        const height = cb.bottom - cb.top;

        // the parent is smaller than the child. We do not want this.
        if(pb.bottom - pb.top < cb.bottom - cb.top){
            // rescale parent
            element.parentElement.style.minHeight = (cb.bottom - cb.top) + 'px';
            // put the child at the top of the parent
            setPositions({
                scrollTop,
                offsetTop: 0,
                height
            });
            return;
        }

        setPositions((prev) => {
            const delta = scrollTop - prev.scrollTop;
            let offset = 0;
            if(delta > 0){
                // scrolling down
                if(top < 0 && bottom > 0 && bottom > parentBottom){
                    // push element down into view, but not beyond the bottom of the container
                    offset = (bottom + delta < parentBottom ? parentBottom - bottom : delta);
                }
            }else{
                // scrolling up
                if(top > 0 && top > parentTop){
                    // push element up into view, but not beyond the top of the container
                    offset = prev.offsetTop + delta < 0 ? -prev.offsetTop : delta;
                }
            }

            // check if the content of the stickyMenu is still inside the parent, if not move it up/down
            if(bottom < parentBottom){
                offset = bottom - parentBottom;
            }else if(top < parentTop){
                offset = top - parentTop;
            }else if(offset === 0 && top < 0 && bottom > 0 && bottom > parentBottom){
                // Top is out of view, while there is room at the bottom, push content down
                offset = Math.min(-1 * top, bottom - parentBottom);
            }else if(offset === 0 && bottom < 0 && top > 0 && top > parentTop){
                // Bottom is out of view, whilt there is room at the top, push content up
                offset = Math.max(bottom, parentTop - top);
            }else if(offset === 0 && top > 0 && bottom > 0 && bottom > parentBottom && top > parentTop){
                // both top and buttom are in view, but the content is not aligned to the top or the bottom
                offset = Math.max(-1 * top, parentTop - top);
            }

            // Call height change callback when it is set
            if(height !== prev.height && props.onHeightChange){
                props.onHeightChange(height);
            }

            return {
                scrollTop,
                offsetTop: prev.offsetTop + offset,
                height
            };
        });
    };

    useEffect(() => {
        const e = new SimpleEvent(props.scrollContainer, 'scroll', updatePosition);
        // If ResizeObserver is available, we will also watch the size of element and the parent container.
        // Whenever these change, we may need to reposition the menu too.
        let observer = null;
        if(element && Object.prototype.hasOwnProperty.call(window, 'ResizeObserver')){
            // Put the callback of the ResizeObserver into a timeout, so we prevent too many update loops
            // in a single animation frame (which will throw an exception)
            const updatePositionTimeout = (event) => {
                setTimeout(() => {updatePosition(event);}, 0);
            };
            // calling updatePosition without the event as the function expects a scroll event or nothing
            observer = new ResizeObserver(updatePositionTimeout);
            observer.observe(element);
            observer.observe(element.parentElement);
        }

        return () => {
            e.remove();
            if(observer !== null){
                observer.disconnect();
            }
        };
    }, [element]);

    const stickyElementStyle = {
        top: positions.offsetTop
    };

    return <div className="zol-sticky-element-parent">
        <div className="zol-sticky-element" ref={menuRef} style={stickyElementStyle}>
            {props.children}
        </div>
    </div>;
};

StickyElement.propTypes = {
    // DOM element that does the scrolling
    scrollContainer: PropTypes.oneOfType([PropTypes.instanceOf(Element), PropTypes.instanceOf(Window)]),
    children: PropTypes.node.isRequired,
    onHeightChange: PropTypes.func
};

const defaultProps = {
    scrollContainer: window
};

export {StickyElement};
