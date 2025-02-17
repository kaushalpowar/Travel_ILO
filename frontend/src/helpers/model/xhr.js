import {CONFIG} from '../../config.js';
import {Model} from './model.js';

class ModelXhr extends Model {
    constructor(hash, selectionCriteria){
        super(hash, selectionCriteria);
        this.method = 'GET';
        this.fetchController = null;
    }

    getEndpoint(){
        return CONFIG.apiEndpoint;
    }

    getHeaders(){
        return {
            'Content-Type': 'application/json'
        };
    }

    getParams(){
        return {};
    }

    getPayload(){
        return {};
    }

    getEncodedParams(){
        const params = (new URLSearchParams(this.getParams()).toString());
        if(params){
            return '?' + params;
        }
        return '';
    }

    getEncodedPayload(){
        return JSON.stringify(this.getPayload());
    }

    async parseResponse(response){
        const result = {};
        try {
            const json = await response.json();
            result.status = json.success ? Model.Status.SUCCESS : Model.Status.ERROR;
            result.data = json.success ? json.value || [] : [];
            result.error = json.success ? null : json.error || 'Unknown error';
        } catch (error){
            result.status = Model.Status.ERROR;
            result.data = [];
            result.error = error;
        }
        return result;
    }

    fetchData(keepData = false){
        if(! keepData){
            this.status = Model.Status.WAITING;
            this.data = [];
            this.error = null;
            this.callListeners();
        }

        if(this.fetchController !== null){
            this.fetchController.abort();
        }
        this.fetchController = new AbortController();
        const signal = this.fetchController.signal;

        fetch(this.getEndpoint() + this.getEncodedParams(), {
            method: this.method,
            headers: this.getHeaders(),
            body: this.method === 'GET' ? undefined : this.getEncodedPayload(),
            signal
        }).then(async (response) => {
            if(response.ok){
                const result = await this.parseResponse(response);
                this.setResponse(result);
            }else{
                const result = {
                    status: Model.Status.ERROR,
                    data: [],
                    error: response.statusText
                };
                this.setResponse(result);
            }
        }).catch((error) => {
            this.setResponse({status: Model.Status.WAITING, data: [], error});
        }).finally(() => {
            this.fetchController = null;
            if(this.status === Model.Status.WAITING){
                this.setResponse({status: Model.Status.INACTIVE, data: [], error: 'Request was aborted'});
            }
        });
    }

    remove(){
        if(this.fetchController !== null){
            this.fetchController.abort();
        }
        super.remove();
    }
}

export {ModelXhr};
