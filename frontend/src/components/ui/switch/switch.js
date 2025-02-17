import React, {useState} from 'react';
import {PropTypes} from 'prop-types';
import {UISwitchItem} from './item.js';
import './switch.scss';

/*
    A switch between two or more values. The width of the switch is determined automatically by the widest
    option.
*/
const UISwitch = function(props){
    const [width, setWidth] = useState(100);

    const updateSize = (newWidth) => {
        if(newWidth > width){
            setWidth(newWidth);
        }
    };

    const index = props.options.reduce(
            (index, item, rowNr) => (item.value === props.value ? rowNr : index), 0);

    const styleHighlight = {
        left: (index * 100 / props.options.length) + '%',
        width: (100 / props.options.length) + '%'
    };

    return <div className="zol-ui-switch">
        <span style={styleHighlight} className="zol-ui-switch-highlight"/>
        {props.options.map((item) => (
            <UISwitchItem key={item.value}
                    isActive={props.value === item.value}
                    width={width}
                    onClick={() => {props.onChange(item.value);}}
                    updateSize={updateSize}>

                {item.label}

            </UISwitchItem>
        ))}
    </div>;
};

UISwitch.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired
};

export {UISwitch};
