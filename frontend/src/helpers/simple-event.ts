
type eventElementType = (HTMLElement | (Window & typeof globalThis) | Document);

type eventStackType = {
    element: eventElementType,
    eventTypes: Array<string>,
    callback: (e: Event) => void,
    capture: boolean
};

class SimpleEvent {
    static eventStack: Map<string, eventStackType> = new Map();

    stackId: string;

    static add(element: eventElementType,
            eventType: (Array<string> | string),
            callback: (e: Event) => void,
            capture = false): string{
        const uid = Math.random().toString(36).substring(2, 9);
        const eventStackItem : eventStackType = {
            element,
            eventTypes: (eventType instanceof Array) ? eventType : [eventType],
            callback,
            capture
        };

        for(const et of eventStackItem.eventTypes){
            element.addEventListener(et, callback, capture);
        }
        SimpleEvent.eventStack.set(uid, eventStackItem);
        return uid;
    }

    static remove(stackId: string){
        const item = SimpleEvent.eventStack.get(stackId);
        if(item && item.element){
            for(const et of item.eventTypes){
                item.element.removeEventListener(et, item.callback, item.capture);
            }
        }else{
            console.warn('unable to delete event listener');
            console.log(stackId);
        }
        SimpleEvent.eventStack.delete(stackId);
    }

    constructor(element: eventElementType,
            eventType: (Array<string> | string),
            callback: (e: Event) => void,
            capture = false){
        this.stackId = SimpleEvent.add(element, eventType, callback, capture);
    }

    remove(){
        SimpleEvent.remove(this.stackId);
    }
}

export {SimpleEvent};
