import React from 'react';
import { render } from 'react-dom';
// import { Provider } from 'react-redux';

// import { store } from './_helpers';
import  App  from './App';

// setup fake backend
// import { configureFakeBackend } from './_helpers';
// configureFakeBackend();

console.log("App", App);

render(
    // <Provider store={store}>
        <App />,
    // </Provider>,
    document.getElementById('t2y-app')
);