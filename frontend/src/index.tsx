/* eslint-disable-next-line */
import 'core-js/es';
import React from 'react';
/* react-dom/client is not a JS file, hence no extension */
/* eslint-disable-next-line */
import ReactDOM from 'react-dom/client';
import {ContextState} from './helpers/context-state/context-state.tsx';
import {CtrlApp} from './ctrl/app.tsx';
import './index.scss';
// import ChatAssistant from './ChatAssistant.tsx'; // Ensure this matches the file name

const initialState = {
    page: 'home'
};

const component = (
    <React.StrictMode>
        <ContextState initial={initialState}>
            <CtrlApp/>
        </ContextState>
    </React.StrictMode>
);

const element = document.getElementById('root');
if(element){
    const root = ReactDOM.createRoot(element);
    root.render(component);
}else{
    console.error('Root element with id "root" not found.');
}

// const rootElement = document.getElementById('root');
// if(rootElement){
//     const root = ReactDOM.createRoot(rootElement);
//     root.render(
//         <React.StrictMode>
//             <ChatAssistant/>
//         </React.StrictMode>
//     );
// }else{
//     console.error('Root element not found');
// }
