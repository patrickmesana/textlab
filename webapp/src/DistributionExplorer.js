import React from 'react';
import './App.css';
import Bars from './Bars.js'
import TextField from 'material-ui/TextField'
import {conv_margin, global_theme_color, svg_canvas_height, svg_canvas_width} from './constants';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import WordList from './WordList'
import _, {flatten} from "lodash"
import ToggleToolbar from './ToggleToolbar'
import BarStacks from './BarStacks'
import {Divider, MenuItem, SelectField, Toggle} from "material-ui";
import {timeFormat, timeParse} from 'd3-time-format';
import TagBar from "./TagBar";
import {connect} from 'react-redux';
import {
    loadDataWithWithStrategy, tagWordsChanged, filterDataByCategories,
    filterByPercentage, setSliderLastValue
} from './DistributionExplorer-redux'
import {topWords} from "./data";
import {compose, withState} from "recompose";
import {TagInputField} from "./TagInputField";


const parseDate = timeParse('%Y%m%d');
const format = timeFormat('%b %d');
const formatDate = date => format(parseDate(date));

const textListWidth = 256;


function filterByContent(data, filter) {
    if (!filter) {
        return data;
    }

    return _.filter(data, (d) => {
        return d["word"].includes(filter)
    })
}

let wordListHeight = svg_canvas_height-50;


function triggerDownload (imgURI) {
    let evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
    });

    let a = document.createElement('a');
    a.setAttribute('download', 'image.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
}

function save_image() {
    // let btn = document.querySelector('#save-png');
    let svg = document.getElementById('word_dist');
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let data = (new XMLSerializer()).serializeToString(svg);
    let DOMURL = window.URL || window.webkitURL || window;

    let img = new Image();
    let svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    let url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        let imgURI = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        triggerDownload(imgURI);
    };

    img.src = url;
}

const strategyEnumToName = (strategy) => {
    switch (strategy) {
        default:
            return 'tf_filtered_vocab';
    }
};

const strategyNameToEnum = (strategyName) => {
    switch (strategyName) {
        default:
            return 0;
    }
};


const handleRequestAdd = (chips, word) => {
    return flatten([...chips, word]);
};


const enhance = compose(
    withState('listFilter', 'setListFilter', ""),
    withState('barStacksCategoriesNormalized', 'setBarStacksCategoriesNormalized', false)
);

const DistributionExplorer = enhance(({
                                  strategyName,
                                  // categoryKeys, categorySelections,
                                  data,
                                  staticTotalCount,
                                  nbrOfWords,
                                  sliderLastValue, setSliderLastValue,
                                  staticTotalSize,
                                  // categoriesWithTopWords,
                                  setTagWordsWithNbr, setTagWords,
                                  // barStacksCategoriesNormalized,
                                  // setBarStacksCategoriesNormalized,
                                  tagWordsChanged, tagWords,
                                  handleToggleBarChange,
                                  handleSliderStop,
                                  listFilter, setListFilter,
                                  reset
                              }) =>
{
        return <div style={{display:"inline-block", textAlign:"center"}}>
            <div style={{textAlign:"left"}}>
                <SelectField floatingLabelText="Vocabulary"
                             value={strategyNameToEnum(strategyName)} onChange={(event, key) => reset(key)} >
                    <MenuItem value={0} primaryText="default" />
                </SelectField>
            </div>
            {/*<Divider style={{marginTop:conv_margin, marginBottom:conv_margin}}/>*/}
            {/*<div style={{textAlign:"left", width:svg_canvas_width+textListWidth+conv_margin}}>*/}

                {/*<ToggleToolbar choices={categoryKeys} selections={categorySelections}*/}
                               {/*selectCategories={(selectedCategories) => handleToggleBarChange(selectedCategories, categoryKeys)}*/}
                               {/*clearCategories={(selectedCategories) => handleToggleBarChange(null, categoryKeys)}/>*/}
            {/*</div>*/}
            {/*<Divider />*/}
            <div style={{textAlign:"left", marginTop:conv_margin, marginBottom:conv_margin}}>
                <RaisedButton id="save-png" onClick={save_image}>save</RaisedButton>
            </div>
            <div style={{ width: svg_canvas_width+textListWidth+conv_margin}}>
                <div style={{display: "inline-block"}} >

                    <Bars width={svg_canvas_width}
                          height={svg_canvas_height}
                          data={data}
                          totalCount={staticTotalCount}
                          nbrOfWords={nbrOfWords}
                          tooltipBackgroundColor={global_theme_color}
                    />

                </div>
                <div style={{marginLeft:conv_margin, display:"inline-block", height:{svg_canvas_height}, width:textListWidth}}>
                    <TextField
                        style={{textAlign:"left"}}
                        id="text-list-filter-field"
                        value={listFilter}
                        onChange={(event) => setListFilter(event.target.value)}
                    />
                    <WordList data={filterByContent(data, listFilter)}
                              height={wordListHeight} />

                </div>
            </div>
            <div className="slider" style={{marginTop: conv_margin, textAlign:"left"}}>

                <div style={{display:"inline-block"}}>
                    <Slider min={0} max={1}
                            value={sliderLastValue}
                            style={{ width:400}}
                            onChange={(event, value) => setSliderLastValue(value)}
                            onDragStop={() => handleSliderStop(sliderLastValue)}
                    />
                </div>
                <div style={{ fontSize:15, display:"inline-block", verticalAlign:"top", textAlign: "left"}}>
                                <span>
                                {(sliderLastValue * 100).toPrecision(3)
                                + "th percentile"}
                                </span>
                    <span style={{verticalAlign: "top"}}>
                                {" - " + nbrOfWords + "/" + staticTotalSize +
                                " words (" +
                                (nbrOfWords * 100 / staticTotalSize).toPrecision(3)
                                + "%)"}</span>
                </div>
            </div>
            <Divider style={{marginBottom:conv_margin}}/>
            {/*<div style={{textAlign:"left", marginTop:conv_margin, marginBottom:conv_margin}}>*/}
                {/*<div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>*/}
                    {/*<TagInputField width={200}*/}
                                   {/*onAddTag={(words) => tagWordsChanged(handleRequestAdd(tagWords, words))}*/}
                                   {/*hintText="Add wordsddddd"*/}
                    {/*/>*/}
                {/*</div>*/}
                {/*<div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>*/}
                    {/*<RaisedButton style={{marginRight: 3, marginBottom:3}}*/}
                                  {/*label="TOP 10 WORDS"*/}
                                  {/*primary={true}*/}
                                  {/*onClick={() => setTagWordsWithNbr(10)}/>*/}
                    {/*</div>*/}
                {/*<div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>*/}
                    {/*<RaisedButton style={{marginRight: 3, marginBottom:3}}*/}
                                  {/*label="TOP METRIC WORDS"*/}
                                  {/*primary={true}*/}
                                  {/*onClick={() => setTagWords()}/>*/}
                {/*</div>*/}
                {/*<div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>*/}
                    {/*<Toggle*/}
                        {/*style={{width:'100px'}}*/}
                        {/*label="Normalize"*/}
                        {/*toggled={barStacksCategoriesNormalized}*/}
                        {/*onToggle={(e, v) => setBarStacksCategoriesNormalized(v)}*/}
                    {/*/>*/}
                {/*</div>*/}
            {/*</div>*/}

            {/*<TagBar width={svg_canvas_width+textListWidth+conv_margin} tagWords={tagWords} tagWordsChanged={tagWordsChanged}/>*/}
            {/*<div className="bar-stacks-categories" style={{marginTop: conv_margin*2}}>*/}
                {/*<BarStacks width={svg_canvas_width+textListWidth+conv_margin}*/}
                           {/*height={svg_canvas_height}*/}
                           {/*data={categoriesWithTopWords}*/}
                           {/*keys={tagWords}*/}
                           {/*normalized={barStacksCategoriesNormalized}*/}

                {/*/>*/}
            {/*</div>*/}

        </div>
});


function mapStateToProps(state) {
    return {
        tagWords: state.app.distributionExplorer.tagWords,
        strategyName: state.app.distributionExplorer.strategyName,
        categoryKeys: state.app.distributionExplorer.categoryKeys,
        categorySelections: state.app.distributionExplorer.categorySelections,
        data: state.app.distributionExplorer.data,
        staticTotalCount: state.app.distributionExplorer.staticTotalCount,
        nbrOfWords: state.app.distributionExplorer.nbrOfWords,
        staticTotalSize: state.app.distributionExplorer.staticTotalSize,
        categoriesWithTopWords: state.app.distributionExplorer.categoriesWithTopWords,
        barStacksCategoriesNormalized: state.app.distributionExplorer.barStacksCategoriesNormalized,
        sliderLastValue:state.app.distributionExplorer.sliderLastValue,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setTagWordsWithNbr: (nbrOfTopWords) => dispatch(tagWordsChanged(topWords(nbrOfTopWords))),
        setTagWords: (nbrOfTopWords) => dispatch(tagWordsChanged(topWords())),
        reset : (strategy) => {
            dispatch(loadDataWithWithStrategy(strategyEnumToName(strategy)));
        },
        // handleToggleBarChange: (tmpCategorySelections, categoryKeys) => {
        //     if (!tmpCategorySelections) {
        //         tmpCategorySelections = categoryKeys.map(() => false);
        //     }
        //     dispatch(filterDataByCategories(categoryKeys, tmpCategorySelections));
        // },
        handleSliderStop: (sliderLastValue) => {
            dispatch(filterByPercentage(sliderLastValue));
        },
        setSliderLastValue: (sliderLastValue) => {
            dispatch(setSliderLastValue(sliderLastValue));
        },
        tagWordsChanged: (words) => {
            dispatch(tagWordsChanged(words))
        }
    };
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DistributionExplorer);