import {getHash} from '../functions/get_hash.ts';

class Model {
    static modelName = '';
    static instances = new Map();
    static cache = new Map();
    static Status = {
        INACTIVE: 'inactive',
        WAITING: 'waiting',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    static getInstance(ModelClass, selectionCriteria){
        if(! ModelClass.modelName){
            console.error('Model class does not have a modelName');
        }
        const hash = ModelClass.modelName + ':' + getHash(selectionCriteria);

        if(! Model.instances.has(hash)){
            Model.instances.set(hash, new ModelClass(hash, selectionCriteria));
        }
        return Model.instances.get(hash);
    }

    constructor(hash, selectionCriteria){
        this.hash = hash;
        this.selectionCriteria = selectionCriteria;
        this.removalCheckTimerId = setTimeout(this.checkForRemoval.bind(this), 500);
        this.listeners = new Map();
        this.cacheLimit = 10;
        this.status = Model.Status.INACTIVE;
        this.data = [];
        this.error = null;
        this.modelName = hash.split(':')[0];
    }

    callListeners(uid = null){
        for(const [listenerUid, listener] of this.listeners){
            if(uid === null || uid === listenerUid){
                const result = {status: this.status, data: this.data, error: this.error};
                listener.setResult(listener.dataCallback(result));
            }
        }
    }

    addListener(uid, dataCallback, setResult = () => {null;}){
        this.listeners.set(uid, {dataCallback, setResult});
        clearTimeout(this.removalCheckTimerId);
        if(this.status === Model.Status.SUCCESS || this.status === Model.Status.ERROR){
            this.callListeners(uid);
        }else if(this.status !== Model.Status.WAITING){
            const cache = this.getCache();
            if(cache){
                this.status = cache.status;
                this.data = cache.data;
                this.error = cache.error;
                this.callListeners(uid);
            }else{
                this.fetchData();
            }
        }
    }

    removeListener(uid){
        this.listeners.delete(uid);
        this.removalCheckTimerId = setTimeout(this.checkForRemoval.bind(this), 500);
    }

    checkForRemoval(){
        if(this.listeners.size === 0){
            this.remove();
        }
    }

    remove(){
        // Note that this does not remove the cache data
        this.listeners.clear();
        Model.instances.delete(this.hash);
    }

    reset(reload = true, keepData = false){
        if(! keepData){
            this.status = reload ? Model.Status.WAITING : Model.Status.INACTIVE;
            this.data = [];
            this.error = null;
        }
        if(reload){
            this.fetchData(keepData);
        }else{
            this.callListeners();
        }
    }

    getResultWaiting(){
        return {
            status: Model.Status.WAITING,
            data: []
        };
    }

    getCache(){
        if(this.cacheLimit === 0){
            return null;
        }
        const cache = Model.cache.get(this.hash);
        if(cache){
            cache.time = (new Date()).getTime();
            return cache.result;
        }
        return null;
    }

    setCache(result){
        const cache = {
            result,
            modelName: this.modelName,
            time: (new Date()).getTime()
        };
        Model.cache.set(this.hash, cache);
        this.flushCache(this.cacheLimit);
    }

    flushCache(limit = 0){
        Model.flushCache(this.modelName, limit);
    }

    static flushCache(modelName, limit = 0){
        const cacheStack = [];
        for(const [hash, cache] of Model.cache){
            if(cache.modelName === modelName){
                cacheStack.push({hash, time: cache.time});
            }
        }
        if(cacheStack.length > limit){
            cacheStack.sort((a, b) => (a.time - b.time));
            for(let i = 0; i < cacheStack.length - limit; i++){
                Model.cache.delete(cacheStack[i].hash);
            }
        }
    }

    static invalidateModel(ModelClass, asBackgroundTask = false){
        const Models = ModelClass instanceof Array ? ModelClass : [ModelClass];
        for(const ModelClass of Models){
            Model.flushCache(ModelClass.modelName, 0);
            for(const [, instance] of Model.instances){
                if(instance instanceof ModelClass){
                    instance.reset(true, asBackgroundTask);
                }
            }
        }
    }

    fetchData(/* keepData = false */){
        this.status = Model.Status.WAITING;
        this.data = [];
        this.error = null;
        this.callListeners();
        console.error('fetchData not implemented on this model');
    }

    setResponse(result){
        this.status = result.status;
        this.data = result.data;
        this.error = result.error;
        this.callListeners();
        if(this.status === Model.Status.SUCCESS){
            this.setCache(result);
        }
    }
}

export {Model};
