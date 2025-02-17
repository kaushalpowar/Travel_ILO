import {ModelXhr} from '../helpers/model/xhr.js';

class ModelChat extends ModelXhr {
    static modelName = 'ModelChat';

    static send(message){
        const instance = ModelChat.getInstance(ModelChat, {});
        instance.send(message);
    }

    static resetChat(){
        const instance = ModelChat.getInstance(ModelChat, {});
        instance.resetChat();
    }

    constructor(hash, selectionCriteria){
        super(hash, selectionCriteria);

        if(! sessionStorage.getItem('ilo-travel-conversation')){
            this.resetChat();
        }else{
            const storedContent = sessionStorage.getItem('ilo-travel-conversation');
            this.data = JSON.parse(storedContent) || [];
            this.status = ModelXhr.Status.SUCCESS;
        }

        this.cacheLimit = 0;
        this.method = 'POST';
        this.isRequesting = false;
    }

    send(message){
        this.addMessage(
                {
                    role: 'user',
                    content: message
                });
        this.fetchData(true);
        this.status = ModelXhr.Status.WAITING;
        this.callListeners();
    }

    addMessage(message){
        if(message && typeof message === 'object' && message.role && message.content &&
                typeof message.content === 'string'){
            const storedContent = sessionStorage.getItem('ilo-travel-conversation');
            const conversation = JSON.parse(storedContent) || [];
            conversation.push(message);
            sessionStorage.setItem('ilo-travel-conversation', JSON.stringify(conversation));
            this.data = conversation;
            ModelChat.invalidateModel([ModelChat], true);
        }
    }

    resetChat(){
        this.data = [
            {
                role: 'assistant',
                content: 'What would you like to know about traveling for the ILO?'
            }
        ];
        this.status = ModelXhr.Status.SUCCESS;
        sessionStorage.setItem('ilo-travel-conversation', JSON.stringify(this.data));
        ModelChat.invalidateModel([ModelChat], true);
    }

    fetchData() {
        if (this.data?.length === 0 || 
            this.data[this.data.length - 1].role !== 'user' ||
            this.isRequesting) {  // Check if request is already in progress
            return;
        }

        const payload = this.getPayload();
        
        // Prevent multiple requests for the same message
        const lastProcessedMessage = sessionStorage.getItem('lastProcessedMessage');
        if (lastProcessedMessage === payload) {
            return;
        }
        
        this.status = ModelXhr.Status.WAITING;
        this.isRequesting = true;
        this.callListeners();

        sessionStorage.setItem('lastProcessedMessage', payload);

        fetch('http://localhost:5000/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: payload}),
            cache: 'no-store'  // Prevent caching
        })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    this.isRequesting = false;
                    if (!data || !data.response) {
                        throw new Error('Invalid response format from server');
                    }
                    this.setResponse({
                        status: ModelXhr.Status.SUCCESS,
                        data: data.response
                    });
                })
                .catch((error) => {
                    this.isRequesting = false;
                    sessionStorage.removeItem('lastProcessedMessage');  // Clear on error
                    console.error('Error:', error);
                    let errorMessage = 'An unexpected error occurred.';
                    
                    if (error.message === 'Failed to fetch') {
                        errorMessage = 'Could not connect to the server. ' + 
                                'Please check if the server is running.';
                    } else if (error.message.includes('HTTP error')) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                    
                    this.setResponse({
                        status: ModelXhr.Status.ERROR,
                        error: errorMessage
                    });
                });
    }

    getPayload() {
        const lastMessage = this.data[this.data.length - 1];
        return lastMessage?.content || '';
    }

    async parseResponse(response){
        const result = {};
        try {
            const json = await response.json();
            result.status = json.success ? ModelXhr.Status.SUCCESS : ModelXhr.Status.ERROR;
            result.data = json.success ? json.data || 'No reply' : 'Failed';
            result.error = json.success ? null : json.error || 'Unknown error';
        } catch (error){
            result.status = ModelXhr.Status.ERROR;
            result.data = [];
            result.error = error;
        }
        return result;
    }

    setResponse(result){
        this.status = result.status;
        if(result.status === ModelXhr.Status.SUCCESS){
            this.addMessage({role: 'assistant', content: result.data});
            this.error = null;
        }else if(result.status === ModelXhr.Status.ERROR){
            this.addMessage({role: 'assistant', content: 'I\'m sorry, and error occured. ' + result.error});
            this.error = result.error;
        }
        this.callListeners();
    }
}

export {ModelChat};
