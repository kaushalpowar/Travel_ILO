import {useEffect, useState} from 'react';
import {getHash} from '../functions/get_hash.ts';

const useModel = function(ModelClass, selectionCriteria = {}, dataCallback = (resultSet) => (resultSet)){
    const [uid] = useState(getHash());
    const [result, setResult] = useState({status: ModelClass.Status.INACTIVE, data: []});

    const hash = ModelClass.modelName + ':' + dataCallback.toString() + ':' + getHash(selectionCriteria);
    const modelInstance = ModelClass.getInstance(ModelClass, selectionCriteria);

    useEffect(() => {
        modelInstance.addListener(uid, dataCallback, setResult);

        return () => {
            modelInstance.removeListener(uid);
        };
    }, [hash]);

    return result;
};

export {useModel};
