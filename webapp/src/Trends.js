import React, {Component} from "react";
import "./App.css";
import {conv_margin, svg_canvas_height, svg_canvas_width} from "./constants";
import RaisedButton from "material-ui/RaisedButton";
import {all, topWords} from "./data";
import crossfilter from "crossfilter";
import _, {flatten} from "lodash";
import BarStacks from "./BarStacks";
import {timeFormat, timeParse} from "d3-time-format";
import AreaStacks from "./AreaStacks";
import TagBar from "./TagBar";
import {connect} from "react-redux";
import {tagWordsChanged} from "./Trends-redux";
import {TagInputField} from "./TagInputField";


const parseDate = timeParse('%Y%m%d');
const format = timeFormat('%b %d');
const formatDate = date => format(parseDate(date));
const chartsWidth = svg_canvas_width + 256;

const handleRequestAdd = (chips, word) => {
    return flatten([...chips, word]);
};


const Trends = ({tagWordsChanged, tagWords, setTagWords}) => {
        return <div style={{display:"inline-block", textAlign:"center"}}>

            <div style={{textAlign:"left", marginTop:conv_margin, marginBottom:conv_margin}}>
                <div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>
                    <TagInputField width={200}
                                   onAddTag={(words) => tagWordsChanged(handleRequestAdd(tagWords, words))}
                                   hintText="Add words"
                    />
                </div>
                <RaisedButton style={{marginRight: 3, marginBottom:3, marginLeft:conv_margin}}
                              label="TOP 10 WORDS"
                              primary={true}
                              onClick={() => tagWordsChanged(topWords(10))}/>

                <div style={{display:"inline-block", verticalAlign:'middle', marginLeft:conv_margin}}>
                    <RaisedButton style={{marginRight: 3, marginBottom:3}}
                                  label="TOP METRIC WORDS"
                                  primary={true}
                                  onClick={() => setTagWords()}/>
                </div>
            </div>
            <TagBar width={chartsWidth+conv_margin} tagWords={tagWords} tagWordsChanged={tagWordsChanged}/>

            <div className="bar-stacks-time" style={{marginTop: conv_margin*2}}>
                <BarStacks width={chartsWidth+conv_margin}
                           height={svg_canvas_height}
                           data={getMonthsWithTopWords(tagWords)}
                           keys={tagWords}
                           normalized={false}
                           reorderCategories={false}

                />
            </div>
            {/*<Divider style={{marginTop:30, marginBottom:50}}/>*/}
            <div className="area-stacks-time" style={{marginTop: conv_margin*2}}>
                <AreaStacks width={chartsWidth+conv_margin}
                            height={svg_canvas_height}
                            data={getMonthsWithTopWords(tagWords)}
                            keys={tagWords}
                            legendHidden={true}
                />
            </div>

        </div>
};

function mapStateToProps(state) {
    return {
        tagWords: state.app.trends.tagWords,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        tagWordsChanged: (tagWords) => dispatch(tagWordsChanged(tagWords)),
        setTagWords: (nbrOfTopWords) => dispatch(tagWordsChanged(topCategoryWords())),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Trends);