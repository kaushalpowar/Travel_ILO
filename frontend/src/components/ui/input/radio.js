import PropTypes from 'prop-types';
import React from 'react';
import styles from '../../../assets/variables.module.scss';
import './input.scss';

const UIInputRadio = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    const options = props.options instanceof Array ? props.options : Object.keys(props.options);

    const setValue = (value) => {
        props.onChange(value);
        props.onSave(value);
    };

    const getLabelStyle = (option) => {
        return {
            backgroundColor: (option === props.value) ?
                    styles.primaryColor : styles.offWhiteColor,
            color: (option === props.value) ? styles.whiteColor : styles.primaryColor
        };
    };

    return <div className="zol-single-radio">

        {options.map((option) => {
            const label = props.options instanceof Array ? option : props.options[option];

            return <label key={option}>
                <input type="radio" value={option} name={props.name} checked={option === props.value}
                        onChange={(e) => {setValue(e.target.value);}}/>

                <span style={getLabelStyle(option)}>
                    {label}
                </span>

            </label>;
        })}
    </div>;
};

const defaultProps = {
    value: null,
    hasError: false,
    onChange: () => {null;},
    onSave: () => {null;}
};

UIInputRadio.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    hasError: PropTypes.bool
};

export {UIInputRadio};
