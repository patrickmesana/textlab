import { selectWord, clearSelectedWord } from './DistributionExplorer-redux'
import { connect } from 'react-redux';
import { Bar } from '@vx/shape';
import React from 'react';
import { shouldUpdate } from 'recompose'

function mapStateToProps(state) {
    return {
        selectedWord: state.app.distributionExplorer.selectedWord
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectWord: (word) => dispatch(selectWord(word)),
        clearSelectedWord: () => dispatch(clearSelectedWord())
    };
}

function isWordSelected(selectedWord, barData) {
    return !!selectedWord && selectedWord.x === barData.x;
}

//x={xScale(i)}
//y={yMax - barHeight}
//selectedWord = x(d)
//selectedColor = tooltipBackgroundColor
//normalColor = "#fffafe"
//barData = { x: x(d), y: y(d), index:i }
const enhance = shouldUpdate((props, nextProps) => {

    if (props.barData !== nextProps.barData) {
        return true;
    }

    const aTest = isWordSelected(props.selectedWord, props.barData)
        !== isWordSelected(nextProps.selectedWord, nextProps.barData)


    return aTest;
});
const WordBar = enhance(({barWidth,
                     barHeight,
                     x,
                     y,
                     selectedWord,
                     selectedColor,
                     normalColor,
                     barData,
                     mouseover,
                     mouseleave,
                     selectWord,
                     clearSelectedWord
}) => {


    function hasSelectionChanged() {
        return !selectedWord || barData.x !== selectedWord.x;
    }

    return <Bar
        width={barWidth}
        height={barHeight}
        x={x}
        y={y}
        fill={isWordSelected(selectedWord, barData) ? selectedColor :normalColor}
        data={barData}
        onMouseOver={data => event => {
            if(hasSelectionChanged()) {
                selectWord(barData);
                mouseover(data, y, x)
            }
        }}
        onMouseLeave={data => event => {
            clearSelectedWord();
            mouseleave()
        }}
    />
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WordBar);