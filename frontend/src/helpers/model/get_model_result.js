import {getHash} from '../functions/get_hash.ts';

const getModelResult = function(Model, selectionCriteria){
    return new Promise((resolve, reject) => {
        const uid = getHash();
        const modelInstance = Model.getInstance(Model, selectionCriteria);
        modelInstance.addListener(uid, (resultSet) => {
            if(resultSet.status === Model.Status.SUCCESS){
                modelInstance.removeListener(uid);
                resolve(resultSet.data);
            }else if(resultSet.status === Model.Status.ERROR){
                modelInstance.removeListener(uid);
                reject(resultSet.error);
            }
        });
    });
};

export {getModelResult};
