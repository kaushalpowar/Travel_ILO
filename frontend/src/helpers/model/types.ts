import {ReactNode} from 'react';

type ResultSet = {
    status: string;
    data?: object;
    error?: string;
}

type ResultSetFeedback = ResultSet &{
    feedback?: ReactNode
}

export {ResultSet, ResultSetFeedback};
