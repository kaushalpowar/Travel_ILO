import React, {useEffect} from 'react';
import {PropTypes} from 'prop-types';
import {useSize} from '../../../helpers/use_size.ts';
import './switch.scss';

const UISwitchItem = function(props){
    const [width, measuredRef] = useSize((w) => (w), 100);

    useEffect(() => {
        props.updateSize(width);
    }, [props.updateSize, width]);

    const onClick = (event) => {
        event.target.blur();
        props.onClick();
    };

    return <button className={'btn-transparent zol-ui-switch-item' + (props.isActive ? ' zol-active' : '')}
            style={{minWidth: props.width}} onClick={onClick} ref={measuredRef}
            aria-pressed={props.isActive}>

        {props.children}

    </button>;
};

UISwitchItem.propTypes = {
    onClick: PropTypes.func.isRequired,
    updateSize: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired
};

export {UISwitchItem};
