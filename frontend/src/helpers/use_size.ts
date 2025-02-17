import {useState, useCallback, useEffect} from 'react';
import {objectsEqual, objectHasProperty} from './functions/objects.ts';
import {SimpleEvent} from './simple-event.ts';

interface CallbackInterface <T> {
    (width: number, height: number): T;
}

type SizeType = {width: number, height: number};

/* eslint-disable-next-line */
const defaultParseValueCallback: CallbackInterface<any> = (width: number, height: number) : SizeType => {
    return {width, height};
};

const useSize = function<T>(parseValueCallback: CallbackInterface<T> = defaultParseValueCallback,
        initialSize: SizeType = {width: 200, height: 200}):
        [T, (node: (HTMLElement | null)) => void, (HTMLElement | undefined)]{
    // return parseValueCallback(initialSize.width, initialSize.height) as T;

    const [size, setSize] = useState<T>(parseValueCallback(initialSize.width, initialSize.height) as T);
    const [element, setElement] = useState<(HTMLElement | undefined)>(undefined);

    useEffect(() => {
        let observer: (ResizeObserver | SimpleEvent | undefined) = undefined;
        if(element === undefined){
            return;
        }

        const onResize = () => {
            const width: number = element.clientWidth || element.offsetWidth || initialSize.width;
            const height: number = element.clientHeight || element.offsetHeight || initialSize.height;
            const newSize: T = parseValueCallback(width, height) as T;
            if(! objectsEqual(newSize, size)){
                setSize(newSize);
            }
        };

        if(objectHasProperty(window, 'ResizeObserver')){
            observer = new ResizeObserver(onResize);
            observer.observe(element);
        }else{
            observer = new SimpleEvent(document, 'resize', onResize);
        }
        onResize();

        return () => {
            if(observer instanceof ResizeObserver){
                observer.disconnect();
            }else if(observer instanceof SimpleEvent){
                // Remove simple event
                observer.remove();
            }
        };
    // Dependency on initialSize not required. A changed value will not have any effect
    // eslint-disable-next-line
    }, [element, size, parseValueCallback]);

    const measuredRef = useCallback((node: (HTMLElement | null)) => {
        setElement(node === null ? undefined : node);
    }, []);

    return [size, measuredRef, element];
};

export {useSize, SizeType};
