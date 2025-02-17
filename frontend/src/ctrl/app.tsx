import React from 'react';
import {ViewMain} from '../view/main.js';
import {SkiplinkSection} from '../helpers/elements/skiplink/section.js';
import {ChatBot} from '../components/chat-bot/chat-bot.js';

const CtrlApp = function(){
    return <ViewMain>
        <SkiplinkSection labelledby="main-header">
            <h1 id="main-header">Ask about ILO travel policies</h1>
            <p>
                This is a test app to demonstrate how AI can help answer questions about ILO travel policies
                using ILO documents as the source knowledge. This demo is using OpenAI.
            </p>
            <p>Please use the chat below to ask your question.</p>
            <ChatBot/>
        </SkiplinkSection>
    </ViewMain>;
};

export {CtrlApp};
