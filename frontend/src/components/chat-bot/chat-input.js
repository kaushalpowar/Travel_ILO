import React, {useState} from 'react';
import {PropTypes} from 'prop-types';
import './chat-bot.scss';

function ChatInput(props){
    const [value, setValue] = useState('');
    const submitMessage = (event) => {
        event.preventDefault();
        props.send(value);
        setValue('');
    };

    return <div className="zol-chat-bot-form">
        <form onSubmit={submitMessage}>
            <input name="chat-bot-input" className="zol-chat-bot-input" value={value}
                    onChange={(e) => {setValue(e.target.value);}}/>
            <input type="submit" name="chat-bot-send" value="Send"/>
        </form>
    </div>;
}

ChatInput.propTypes = {
    send: PropTypes.func.isRequired
};

export {ChatInput};
