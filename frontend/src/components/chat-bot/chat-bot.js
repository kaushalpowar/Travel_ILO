import React from 'react';
import {Message} from './message.js';
import {ChatInput} from './chat-input.js';
import {ModelChat} from '../../model/chat.js';
import {useModel} from '../../helpers/model/use_model.js';
import './chat-bot.scss';
import {Loader} from '../../helpers/elements/loader.js';

function ChatBot(){
    const resultSet = useModel(ModelChat);
    const conversation = resultSet.data || [];
    const lastConversation = conversation.length > 1 ? conversation[conversation.length - 1] : null;

    const sendMessage = (message) => {
        ModelChat.send(message);
    };
    return <div className="zol-chat-bot">
        {conversation.map((message, i) => (
            <Message key={i}
                    message={message}
                    direction={message.role === 'user' ? 'right' : 'left'}/>
        ))}

        {lastConversation?.role === 'user' ?
            <Message key="loading"
                    message={{
                        role: 'assistant',
                        content: <Loader size={20} color={[0, 0, 0]}/>,
                        type: 'loading'
                    }}
                    direction="left"/> :
            null
        }

        <div className="zol-grid-row">
            <div className="zol-chat-bot-feedback">

                <ChatInput send={sendMessage}/>

                {conversation.length > 1 ?
                    <a href="#" onClick={ModelChat.resetChat}>
                        <span className="zol-icon-clear">X</span>
                        Reset search
                    </a> :
                    null
                }
            </div>
        </div>

    </div>;
}

ChatBot.propTypes = {};

export {ChatBot};
