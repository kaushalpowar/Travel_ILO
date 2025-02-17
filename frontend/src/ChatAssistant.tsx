// import React, {useState} from 'react';

// export const ChatAssistant: React.FC = () => {
//     const [input, setInput] = useState('');
//     const [messages, setMessages] = useState<{text: string; sender: string}[]>([
//         {text: 'What would you like to know about traveling for the ILO?', sender: 'assistant'}
//     ]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if(!input.trim()) return;

//         // Add user message
//         setMessages((prev) => [...prev, {text: input, sender: 'user'}]);
//         try {
//             const res = await fetch('http://localhost:5000/query', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({query: input})
//             });
//             const data = await res.json();
//             // Add assistant response
//             setMessages((prev) => [...prev, {text: data.response, sender: 'assistant'}]);
//             setInput('');
//         } catch (error){
//             console.error('Error:', error);
//             // Handle error appropriately
//         }
//     };

//     return (
//         <div>
//             <h1>ILO Travel Assistant</h1>
//             <div>
//                 {messages.map((msg, index) => (
//                     <div key={index} className={msg.sender}>
//                         {msg.text}
//                     </div>
//                 ))}
//             </div>
//             <form onSubmit={handleSubmit}>
//                 <input
//                         type="text"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         placeholder="Type your question here..."
//                 />
//                 <button type="submit">Send</button>
//             </form>
//         </div>
//     );
// };

// export default ChatAssistant;