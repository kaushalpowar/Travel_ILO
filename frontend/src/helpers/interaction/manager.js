import {
    Manager as HammerManager,
    Pan as HammerPan,
    // Pinch as HammerPinch,
    Tap as HammerTap,
    default as Hammer
} from 'hammerjs';
import {SimpleEvent} from '../simple-event.ts';

class InteractionManager {
    constructor(element, callback, settings){
        // setting up the event listeners using Hammerjs for touch gestures
        const hm = new HammerManager(element);

        // TODO: quick fix to enable only horizontal panning and allow vertical scrolling on the page. This
        // should be configurable in the settings.
        const Pan = new HammerPan({
            direction: Hammer.DIRECTION_HORIZONTAL
        });
        hm.add(Pan);

        // const Pinch = new HammerPinch({enable: true});
        // hm.add(Pinch);

        const Tap = new HammerTap({taps: 2});
        hm.add(Tap);

        hm.on('panstart panmove panend', (e) => {
            this.mouseDownTime = 0;
            if(e.type === 'panstart'){
                this.startTransformation();
            }else if(e.type === 'panmove'){
                this.changeTransformation({x: e.deltaX, y: e.deltaY});
            }else if(e.type === 'panend'){
                this.endTransformation({x: e.deltaX, y: e.deltaY});
            }
        });
        // hm.on('pinchstart pinchmove pinchend', (e) => {
        //     // needs to be tested
        //     const c = [e.center.x, e.center.y]; // position of the pinch zoom
        //     if(e.type === 'pinchstart'){
        //         this.startTransformation();
        //     }else if(e.type === 'pinchmove'){
        //         this.changeTransformation({x: e.deltaX, y: e.deltaY, z: e.scale}, false, c);
        //     }else if(e.type === 'pinchend'){
        //         this.endTransformation({x: e.deltaX, y: e.deltaY, z: e.scale}, c);
        //     }
        // });
        hm.on('tap', (e) => {
            const c = [e.center.x, e.center.y]; // position of the tap
            this.mouseDownTime = 0;
            this.endTransformation({z: 2}, c);
        });

        const events = [
            new SimpleEvent(element, 'mousedown', () => {
                this.mouseDownTime = (new Date()).getTime();
            })
        ];
        if(settings.enableScrollWheel){
            events.push(new SimpleEvent(element, 'wheel', (e) => {
                // TODO: we might want to include a way to re-enable the propagation of event
                e.preventDefault();
                e.stopPropagation();
                const c = [e.clientX, e.clientY]; // position of the pinch zoom
                this.endTransformation({z: e.deltaY > 0 ? 0.5 : 2}, c);
            }));
        }

        this.hm = hm;
        this.events = events;
        this.callback = callback;
        this.animationDuration = settings.animationDuration || 0;
        this.transformation = {x: 0, y: 0, z: 1};
        this.activeEvents = 0;
        this.mouseDownTime = 0;
    }

    startTransformation(){
        this.activeEvents++;
    }

    // When changing transformation we can allow multiple handlers to update [x,y] and [z] dimensions
    // simultanously, but we can't allow multiple handlers to update the position or the scale. Only one at
    // the time should be changing this or they will interfere.
    changeTransformation(currentTransform, enableAnimation = false, cursorLocation = false){
        const delta = {};
        for(const [k, v] of Object.entries(currentTransform)){
            if(k === 'z'){
                delta[k] = v / this.transformation[k];
            }else{
                delta[k] = v - this.transformation[k];
            }
        }
        this.callback(delta, enableAnimation ? this.animationDuration : 0, cursorLocation);
        for(const k of Object.keys(delta)){
            this.transformation[k] = currentTransform[k];
        }
    }

    endTransformation(currentTransform, cursorLocation = false){
        // Based on the inertia (speed of the gesture) we could interpolate the movement in an animation
        this.activeEvents--;
        this.changeTransformation(currentTransform, true, cursorLocation);
        if(this.activeEvents <= 0){
            this.activeEvents = 0;
            this.transformation = {x: 0, y: 0, z: 1};
        }
    }

    isActive(){
        return this.activeEvents > 0;
    }

    validateClick(){
        // Check if we have been moving the map since we pressed down the mouse, if so we are not considering
        // this event a click. Also if we hold the button down for more than a second we no longer accept it
        // as a click.
        // TODO: we might also want to wait if we have another click just after before triggering the click
        // event. That would help seperate double click and single click events.
        if(this.mouseDownTime === 0){
            return false;
        }
        return (new Date()).getTime() - this.mouseDownTime < 1000;
    }

    remove(){
        if(this.hm){
            this.hm.stop(true);
            this.hm.destroy();
        }
        if(this.events){
            for(const event of this.events){
                if(event){
                    event.remove();
                }
            }
        }
        for(const prop of Object.getOwnPropertyNames(this)){
            delete this[prop];
        }
    }
}

export {InteractionManager};
