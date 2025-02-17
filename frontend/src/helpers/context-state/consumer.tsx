import {useContextState, dispatcherType} from './use_context_state.ts';

type ContextStateConsumerProps = {
    filter?: Array<string>,
    children: (state: object, dispatcher: dispatcherType) => JSX.Element
};

const defaultProps = {
    filter: []
};

const ContextStateConsumer = function(inputProps: ContextStateConsumerProps) : JSX.Element{
    const props = {...defaultProps, ...inputProps};
    const [state, dispatcher] = useContextState(props.filter);
    return props.children(state, dispatcher);
};

export {ContextStateConsumer};
