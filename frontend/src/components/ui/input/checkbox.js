import React from 'react';
import {PropTypes} from 'prop-types';

// TODO: note that we are not importing any css here. I think we want to have here general styling of an
// input element, while we can import another stylesheet on the form level that overwrites certain styling
// for use in the form.

const UIInputCheckbox = function(inputProps){
    const props = {...defaultProps, ...inputProps};

    const setNewValue = (option, setActive) => {
        const value = setActive ?
            [...props.value, option] :
            props.value.filter((item) => item !== option);
        props.onChange(value);
        props.onSave(value);
    };

    const options = props.options instanceof Array ? props.options : Object.keys(props.options);

    // TODO: try to keep the classnames in line with the components. Why not: zol-ui-input-checkbox?
    return <div className="zol-single-checkbox"
            style={{display: 'flex', flexWrap: 'wrap'}}>

        {options.map((o) => {
            const label = props.options instanceof Array ? o : props.options[o];
            const isChecked = Array.isArray(props.value) ? props.value.includes(o) : false;
            return <label key={o} className="zol-single-checkbox-item" style={{margin: '10px 0px'}}>
                <input type="checkbox"
                        checked={isChecked}
                        onChange={() => {setNewValue(o, ! isChecked);}}/>
                {label}
            </label>;
        })}

    </div>;
};

const defaultProps = {
    value: [],
    hasError: false,
    onChange: () => {null;},
    onSave: () => {null;}
};

UIInputCheckbox.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    value: PropTypes.array,
    hasError: PropTypes.bool
};

export {UIInputCheckbox};
