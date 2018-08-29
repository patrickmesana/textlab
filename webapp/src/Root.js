import React, { Component } from 'react';
import {Provider} from 'react-redux';
import App from './App';

class Root extends Component {

    render() {
        return (
            <div>
                <Provider store={this.props.store}>
                    <div>
                        <App />
                    </div>
                </Provider>
            </div>
        );
    }
}
export default Root;