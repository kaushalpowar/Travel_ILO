
// Get the current vertical scroll position
export const scrollY = function(){
    const supportPageOffset = window.pageXOffset !== undefined;
    const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

    return supportPageOffset ? window.pageYOffset :
            isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
};

// Get the current horizontal scroll position
export const scrollX = function(){
    const supportPageOffset = window.pageXOffset !== undefined;
    const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

    return supportPageOffset ? window.pageXOffset :
            isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
};

// Function that triggers a scroll to an element. When the last two arguments are ignored, this function will
// immeditly scroll. You can also animate the scrolling, in that case you can make use of the last two
// paramenters in combination of the useAnimation hook.
// The function returns a position element, indicating the position relative to the viewport and the offset
// to get it in view.
// Currently only vertical scroll is supported.
// @todo: add horizontal scroll
export const scrollTo = function(element, toTopOfPage = false, fact = 1, positions = null){
    // if progress is not defined yet, but we have an element, initialize animation
    if(! positions){
        const box = element.getBoundingClientRect();

        const top = box.top;
        const bottom = box.bottom;
        const st = scrollY();

        let offset = 0;
        if(toTopOfPage){
            offset = top;
        }else if(top < 0){
            offset = top;
        }else if(bottom > window.innerHeight){
            offset = Math.min(top, bottom - window.innerHeight);
        }

        positions = {
            x: scrollX(),
            y: st,
            dy: offset,
            dx: 0
        };
    }

    window.scrollTo(
            positions.x + Math.round(fact * positions.dx),
            positions.y + Math.round(fact * positions.dy));

    return positions;
};
