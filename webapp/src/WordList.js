import {List, ListItem} from 'material-ui/List';
import React from 'react';
import { selectWord, clearSelectedWord, selectWordForPie } from './DistributionExplorer-redux'
import { connect } from 'react-redux';
import { onlyUpdateForKeys } from 'recompose'
import { global_theme_color } from './constants'
import Pie from './Pie';
const x = d => d.word;
const y = d => d.count;

function mapStateToProps(state) {
    return {
        selectedWord: state.app.distributionExplorer.selectedWord,
        selectedWordForPie: state.app.distributionExplorer.selectedWordForPie
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectWord: (word) => dispatch(selectWord(word)),
        clearSelectedWord: () => dispatch(clearSelectedWord()),
        selectWordForPie: (word) => dispatch(selectWordForPie(word))
    };
}

function isWordSelectedWordForPie(d, currentSelection) {

    if(currentSelection === null) {
        return false;
    }

    return currentSelection.x === x(d);
}

const enhance = onlyUpdateForKeys(['data', 'selectedWordForPie']);
const WordList = enhance(({data, selectWord, clearSelectedWord, width, height, selectedWordForPie, selectWordForPie}) => {

    return  <List style={{padding:0, overflowY: "scroll", width:width, height:height}}>
        {data.map((d, i) => {
            return <ListItem
                             primaryText={d["word"]}
                             onClick={() =>
                                 isWordSelectedWordForPie(d, selectedWordForPie) ?
                                     selectWordForPie(null):
                                     selectWordForPie({ x: x(d), y: y(d), index:i })
                             }
                             style={
                                 isWordSelectedWordForPie(d, selectedWordForPie) ?
                                     {backgroundColor: global_theme_color}:
                                     {}
                             }
                             secondaryText={
                                 isWordSelectedWordForPie(d, selectedWordForPie)?
                                    <Pie width={75} height={75} word={selectedWordForPie.x} />:
                                    d["count"]
                             }
                             key={"WordListItem"+i}
                             onMouseOver={() => {
                                 selectWord({ x: x(d), y: y(d), index:i });
                             }}
                             onMouseLeave={() => {
                                 clearSelectedWord();
                             }}


            />
        })}
    </List>

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WordList);


