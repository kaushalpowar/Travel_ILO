import React from 'react';
import PropTypes from 'prop-types';

const styleWarning = {
    position: 'relative',
    cssFloat: 'left',
    width: '80px',
    height: '80px',
    marginRight: '20px',
    marginTop: '10px'
};
const styleBorder = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: '0 40px 69px 40px',
    borderColor: 'transparent transparent #042E77 transparent'
};
const styleFill = {
    position: 'absolute',
    width: '0',
    height: '0',
    top: '12px',
    left: '12px',
    borderStyle: 'solid',
    borderWidth: '0 28px 50px 28px',
    borderColor: 'transparent transparent white transparent'
};
const styleExclamation = {
    position: 'absolute',
    width: '80px',
    height: '50px',
    top: '22px',
    lineHeight: '50px',
    fontSize: '42px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#042E77'
};

const styleHeader = {
    margin: '10px 0px 10px 0px',
    paddingTop: '10px'
};

const styleText = {
    margin: '5px 0px'
};

const ComponentError = function(inputProps){
    const props = {...defaultProps, ...inputProps};
    return <div style={{clear: 'both'}} role="alert">
        <span style={styleWarning} role="img" aria-label="Error message">
            <span style={styleBorder}/>
            <span style={styleFill}/>
            <span style={styleExclamation}>!</span>
        </span>
        <div style={{paddingLeft: '100px'}}>
            <h3 style={styleHeader}>{props.title || 'Unknown error'}</h3>
            <p style={styleText}>{props.message || 'No details'}</p>
        </div>
        <div style={{clear: 'both'}}/>
    </div>;
};

const defaultProps = {
    title: 'Error',
    message: 'An unknown error occurred'
};

ComponentError.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string
};

export {ComponentError};
