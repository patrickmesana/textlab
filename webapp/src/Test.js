import * as React from "react";
import {test1} from "./data.test";
import JSONTree from 'react-json-tree'

export default () => {

    return <div><JSONTree data={test1()} shouldExpandNode={() => true}/></div>;
}