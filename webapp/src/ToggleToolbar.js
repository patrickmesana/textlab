import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {clone} from 'lodash'
import { onlyUpdateForKeys } from 'recompose'
import {global_theme_color2} from './constants'
import {FloatingActionButton} from "material-ui";

const enhance = onlyUpdateForKeys(['choices', 'selections']);
const ToggleToolbar = enhance(({choices, selections, selectMetrics, clearMetrics}) => {

    return  <div >
        <RaisedButton style={{marginRight: 3, marginBottom:3}} label="ALL" primary={true} onClick={() => clearMetrics()}/>
        {choices.map((d, i) => {
            return <FlatButton
                style={{marginRight: 3, marginBottom:3}}
                key={"choice"+i}
                label={d}
                disableTouchRipple={true}
                backgroundColor={selections[i]? global_theme_color2 : ""}
                hoverColor={selections[i]? global_theme_color2 : ""}
                onClick={() => {
                    let newSelections = clone(selections);
                    newSelections[i] = !newSelections[i];
                    selectMetrics(newSelections)
                }}
            />
        })}
    </div>

});

export default ToggleToolbar;