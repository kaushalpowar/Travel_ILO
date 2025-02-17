import React from 'react';

const ContextStateContext = React.createContext<Array<string>>([]);
ContextStateContext.displayName = 'ContextStatePath';

export {ContextStateContext};
