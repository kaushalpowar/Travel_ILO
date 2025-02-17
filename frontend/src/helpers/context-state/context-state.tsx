import React, {useEffect, useState, useContext} from 'react';
import {ContextStateContext} from './context.tsx';
import {ContextStateContent} from './content.ts';

type ContextStateProps = {
    initial: object,
    name?: string,
    children: JSX.Element
};

/**
 * - We want the state to be accessible by all children
 * - We want the ability to add new state values or even overload existing values down the DOM tree
 * - We want to be able to set values at different levels at once (lowest first)
 * - We want to set values of states that are not yet initialized (because another value changes the DOM tree)
 * - We want only trigger updates in a component when relevant state values change
 * TODO: when the props.initial changes, it is not updated in the ContextState
 */
const ContextState = function(props: ContextStateProps): JSX.Element{
    const currentStatePath: Array<string> = useContext(ContextStateContext);
    const [preferredName] = useState<string>(props.name || (Math.random() + 1).toString(36).substring(2));
    const [stateName, setStateName] = useState<string | undefined>(undefined);
    const appliedName = stateName ||
            ContextStateContent.createState(preferredName, currentStatePath || [], props.initial);
    const statePath: Array<string> = [...(currentStatePath || []), appliedName];

    /**
     * Note that within React.StrictMode, both components and useEffects will be called twice. However the
     * useEffect and the useState scope are not connected. Meaning we will get two useEffect calls on the
     * second appliedName, and none on the first one. Inside ContextState we clean it up accordingly.
     */
    useEffect(() => {
        setStateName(appliedName);
        ContextStateContent.addState(appliedName);

        return () => {
            ContextStateContent.removeState(appliedName);
            setStateName(undefined);
        };
    }, [appliedName]);

    return <ContextStateContext.Provider value={statePath}>
        {props.children}
    </ContextStateContext.Provider>;
};

export {ContextState};
