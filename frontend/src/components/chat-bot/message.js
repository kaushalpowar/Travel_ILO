import React from 'react';
import {PropTypes} from 'prop-types';
import './chat-bot.scss';
import {ReactComponent as IconChatBot} from '../../assets/chat-bot.svg';
import {ReactComponent as IconChatPerson} from '../../assets/chat-person.svg';
import {MarkdownText} from '../../helpers/elements/markdown-text.js';

function Message(props){
    const message = props.message.content;
    const roleTitles = {
        user: 'You',
        assistant: 'ILO Travel Assistant'
    };

    return <div className="zol-grid-row">
        <div className={'zol-chat-bot-message zol-chat-bot-message-' + props.direction}>
            <span className="zol-chat-bot-user">
                {props.message.role === 'user' ? <IconChatPerson/> : <IconChatBot/>}
            </span>
            <div>
                <strong>{roleTitles[props.message.role] || props.message.role}:</strong>
                {typeof message === 'string' ?
                    <MarkdownText text={message} shorten={0}/> :
                    message
                }
            </div>
        </div>
    </div>;
}

Message.propTypes = {
    message: PropTypes.object.isRequired,
    direction: PropTypes.oneOf(['left', 'right']).isRequired
};

export {Message};
