import PropTypes from 'prop-types';
import React from 'react';

const UIInput = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    const onKeyDown = (e) => {
        if(props.onEnter && e.keyCode === 13){ // enter
            props.onEnter(e.target.value);
        }
    };

    return <input className={`zol-single-input ${props.hasError ? 'zol-single-error' : ''}`}
            type={props.type}
            value={props.value}
            placeholder={props.placeholder}
            onKeyDown={onKeyDown}
            disabled={props.disabled}
            onChange={(e) => (props.onChange(e.target.value))}
            onBlur={(e) => (props.onSave(e.target.value))}/>;
};

const defaultProps = {
    value: '',
    type: 'text',
    disabled: false,
    hasError: false,
    onChange: () => {null;},
    onSave: () => {null;}
};

UIInput.propTypes = {
    name: PropTypes.string.isRequired,
    hasError: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    onEnter: PropTypes.func,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool
};

export {UIInput};
