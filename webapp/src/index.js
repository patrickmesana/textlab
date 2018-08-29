import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Root from './Root';
import registerServiceWorker from './registerServiceWorker';
import {svg_canvas_width, svg_canvas_height} from './constants';
import initStore from './store'
import Test from "./Test";

const isTest = false;
let mainComponent = isTest? <Test/> : <Root store={initStore()}/>;
ReactDOM.render(mainComponent, document.getElementById('root'));

let canvas = document.querySelector('canvas');
canvas.setAttribute('width', svg_canvas_width);
canvas.setAttribute('height', svg_canvas_height);


registerServiceWorker();
