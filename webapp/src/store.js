import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleWare from 'redux-thunk';
import reducers from './reducers';

export default function initStore() {
    const store = compose(
        applyMiddleware(
            thunkMiddleWare
        )
    )(createStore)(reducers);
    return store;
}
