import React from 'react';
import {Model} from './model.js';
import {useModel} from './use_model.js';
import {Loader} from '../elements/loader.js';
import {ComponentError} from '../elements/component-error.js';

const useModelFeedback = function(ModelClass, selectionCriteria, dataCallback = (resultSet) => (resultSet)){
    const result = useModel(ModelClass, selectionCriteria, dataCallback);

    if(result.status === Model.Status.INACTIVE || result.status === Model.Status.WAITING){
        result.feedback = <Loader size={50}/>;
    }else if(result.status === Model.Status.ERROR){
        const error = (typeof result.error === 'object') ? result.error.message : result.error;
        result.feedback = <ComponentError title="Error fetching data" message={error}/>;
    }

    return result;
};

export {useModelFeedback};
