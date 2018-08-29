import React from "react"
import Points from "./Points"
import {Checkbox, MenuItem, SelectField, Slider, TextField, Toggle} from "material-ui"
import {
    filter, isEmpty, keys, reduce, size, uniq, map, indexOf, countBy, repeat, findIndex, flatten,
    sortBy
} from "lodash"
import {compose, withHandlers, withState} from "recompose"
import {conv_margin} from "./constants"
import MetaPie from "./MetaPie"
import DocumentList from "./DocumentList"
import WordCloud from "./WordCloud"
import { schemeCategory20, interpolateCool} from "d3-scale"
import { interpolateBlues } from "d3-scale-chromatic"
import { scaleLinear, scaleOrdinal, scaleTime } from '@vx/scale'
import {
    buildCooccurencesForTop4Words, buildMapForTop4WordsOccurrences, getCountedWordsFromDocumentIndexes,
    getDocumentsCountedByWord,
    markDocumentsContainingWords,
    resetCache
} from './data'
import moment from 'moment'
import {TagInputField} from "./TagInputField";
import TagBar from "./TagBar";
import {logReactRender} from "./logs";
import Network from "./Network";

const corpus = require('./input/contents.json');
const jsonMetas = require('./input/metas.json');

const corpusSize = size(corpus);
const chosenMetaKeys = ['review_sentiment', 'review_stars'];

const metas = reduce(chosenMetaKeys, (tmpMetas, chosenMetaKey) => {
    switch(chosenMetaKey) {
        case 'UDate':
            tmpMetas['MonthDate'] = map(jsonMetas[chosenMetaKey], d => moment(d).format('YYYY-MM'));
            return tmpMetas;
        case 'None':
            tmpMetas['None'] = map(repeat('', corpusSize));
            return tmpMetas;
        default:
            tmpMetas[chosenMetaKey] = jsonMetas[chosenMetaKey];
            return tmpMetas;
    }
}, {});

const metasKeys = keys(metas);



function importVegaFormat(modelPathName) {
    let tsneData = require(`./input/tf/${modelPathName}.json`);
    let transformations = tsneData.data.values;
    let transformationsSize = size(transformations);
    if (corpusSize === transformationsSize) {
        return transformations;
    }
    else {
        throw new Error('Corpus and Transformations do not correspond');
    }
}

function calculateDistance(posA, posB) {
    return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2));
}

function doesCircleContainPoint(cR, cPos, pointPos) {
    return calculateDistance(cPos, pointPos) < cR
}

function filterPointsContainedInCircle(points, cR, cPos, x, y) {
    return reduce(points, (filteredPoints, aPoint, i) => {
        let pointPos = {x: x(aPoint), y: y(aPoint)};
        let isInsideCircle = doesCircleContainPoint(cR, cPos, pointPos);
        return isInsideCircle?
            [...filteredPoints, i]:
            filteredPoints
    }, []);
}

const defaultWidth = 1000;
const defaultHeight = 600;


const clustering_models = {
    tf_tsne: importVegaFormat('tsne'),
};

const clusteringModelKeys = keys(clustering_models);


const x = d => d['X'];
const y = d => d['Y'];


const defaultLenseProperties = {
    position: {x:0, y:0},
    radius: 0.5
};

function colorScaleForMeta(metaKey) {

    let uniqValues = uniq(metas[metaKey]).sort();
    switch(metaKey) {
        case 'review_stars':
            return scaleOrdinal({
                domain: uniqValues,
                range: schemeCategory20
            });
        case 'MonthDate':
            return scaleTime({
                domain: [new Date(uniqValues[0]), new Date(uniqValues[uniqValues.length - 1])],
                range: [0, 1]
            });
        case 'None':
            return scaleOrdinal({
                domain: uniqValues,
                range: ['black']
            });
        default:
            if (uniqValues.length === 2) {
                return scaleOrdinal({
                    domain: uniqValues,
                    range: ['green', 'red']
                });
            }
            return scaleOrdinal({
                domain: uniqValues,
                range: schemeCategory20
            });
    }
}

const strategyEnumToName = (strategy) => {
    switch (strategy) {
        case 0:
            return 'no_filter';
        case 1:
            return 'only_nouns';
        default:
            return 'only_nouns';
    }
};

const strategyNameToEnum = (strategyName) => {
    switch (strategyName) {
        case 'no_filter':
            return 0;
        case 'only_nouns':
            return 1;
        default:
            return 1;
    }
};

function buildLenseDocumentSelection(clusteringModelEnum, metaLegendEnum, lenseRadiusSliderLastValue, position, documentsCountedByWord) {
    let points = clustering_models[clusteringModelKeys[clusteringModelEnum]];

    let metaKey = metasKeys[metaLegendEnum];
    let lenseProperties = {
        position: position,
        radius: lenseRadiusSliderLastValue
    };

    let pointsContainedInCircleIndexes =
        filterPointsContainedInCircle(points, lenseProperties.radius, lenseProperties.position, x, y);
    let documentsInLense = map(pointsContainedInCircleIndexes, (docIndex) => corpus[docIndex]);
    let metasInLense = map(pointsContainedInCircleIndexes, (docIndex) => metas[metaKey][docIndex]);
    let tmpSelectedMetas = {
        metas:metasInLense,
        indexes:pointsContainedInCircleIndexes
    };

    let selectedDocumentsVocab = getCountedWordsFromDocumentIndexes(pointsContainedInCircleIndexes, documentsCountedByWord);

    //coocurences
    let cooccurrences = buildCooccurencesForTop4Words(documentsCountedByWord, selectedDocumentsVocab, pointsContainedInCircleIndexes);
    let selectedCooccurrences = buildMapForTop4WordsOccurrences(cooccurrences);

    return {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences};
}

const defaultMetaKey = 'review_sentiment';

const defaultDocumentLevels = map(repeat(1, corpusSize));
const defaultMetaLegendEnum = indexOf(metasKeys, defaultMetaKey);
const defaultClusteringModelEnum = indexOf(clusteringModelKeys, 'tf_tsne');
const defaultDocumentsCountedByWord = getDocumentsCountedByWord();
let {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences}=
    buildLenseDocumentSelection(
        defaultClusteringModelEnum,
        defaultMetaLegendEnum,
        defaultLenseProperties.radius,
        defaultLenseProperties.position,
        defaultDocumentsCountedByWord
        );

const enhance = compose(
        withState('clusteringModelEnum', 'setClusteringModelEnum', defaultClusteringModelEnum),
        withState('metaLegendEnum', 'setMetaLegendEnum', defaultMetaLegendEnum),
        withState('colorScale', 'setColorScale', () => colorScaleForMeta(defaultMetaKey)),
        withState('lenseEnabled', 'setLenseEnabled', true),
        withState('searchExclusive', 'setSearchExclusive', false),
        withState('searchActive', 'setSearchActive', false),
        withState('pointsWordFilter', 'setPointsWordFilter', []),
        withState('documentLevels', 'setDocumentLevels', defaultDocumentLevels),
        withState('lensePosition', 'setLensePosition', defaultLenseProperties.position),
        withState('lastUpdateLensePosition', 'setLastUpdateLensePosition', defaultLenseProperties.position),
        withState('selectedDocuments', 'setSelectedDocuments', documentsInLense),
        withState('selectedDocumentsVocabulary', 'setSelectedDocumentsVocabulary', selectedDocumentsVocab),
        withState('selectedCooccurrences', 'setSelectedCooccurrences', selectedCooccurrences),
        withState('selectedMetas', 'setSelectedMetas', tmpSelectedMetas),
        withState('lenseRadiusSliderLastValue', 'setLenseRadiusSliderLastValue', defaultLenseProperties.radius),
        withState('documentsCountedByWord', 'setDocumentsCountedByWord', defaultDocumentsCountedByWord),
        withState('strategyName', 'setStrategyName', 'advanced'),
        withHandlers({
            onLegendEnumChanged: ({setMetaLegendEnum, setColorScale, setSelectedDocuments, setSelectedMetas,
                                      setSelectedDocumentsVocabulary, setSelectedCooccurrences,
                                      clusteringModelEnum,
                                      lensePosition,
                                      lenseRadiusSliderLastValue, documentsCountedByWord}) => metaLegendEnum => {
                let metaKey = metasKeys[metaLegendEnum];
                const aColorScale = colorScaleForMeta(metaKey);
                setMetaLegendEnum(metaLegendEnum);


                let zScale = metaKey === 'MonthDate' ?
                    (dataMeta) => interpolateBlues(aColorScale(new Date(dataMeta))):
                    aColorScale;

                setColorScale(() => zScale);


                let {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences}=
                    buildLenseDocumentSelection(
                        clusteringModelEnum,
                        metaLegendEnum,
                        lenseRadiusSliderLastValue,
                        lensePosition, documentsCountedByWord);

                setSelectedMetas(tmpSelectedMetas);
            },
            pointsWordFilterChanged: ({setPointsWordFilter, setDocumentLevels, documentsCountedByWord, searchExclusive}) => pointsWordFilter => {


                let documentLevels = isEmpty(pointsWordFilter) ?
                    defaultDocumentLevels:
                    markDocumentsContainingWords( documentsCountedByWord, pointsWordFilter, searchExclusive);
                setPointsWordFilter(pointsWordFilter);
                setDocumentLevels(documentLevels);
            },
            searchExclusiveChanged: ({setPointsWordFilter, setDocumentLevels, documentsCountedByWord, pointsWordFilter, setSearchExclusive}) => searchExclusive => {
                let documentLevels = isEmpty(pointsWordFilter) ?
                    defaultDocumentLevels:
                    markDocumentsContainingWords( documentsCountedByWord, pointsWordFilter, searchExclusive);
                setPointsWordFilter(pointsWordFilter);
                setDocumentLevels(documentLevels);
                setSearchExclusive(searchExclusive)
            },
            onLenseEvent: ({
                               setLensePosition,
                               clusteringModelEnum,
                               lensePosition,
                               lenseRadiusSliderLastValue,
                               metaLegendEnum,
                               setSelectedDocuments,
                               setSelectedMetas,
                               setSelectedDocumentsVocabulary,
                               lastUpdateLensePosition,
                               setLastUpdateLensePosition,
                               setSelectedCooccurrences, documentsCountedByWord
                           }) => ({position, radius, event}) => {

                setLensePosition(position);
                let distance = calculateDistance(position, lastUpdateLensePosition);
                if ((distance > 0 && event === 'mouseUp') || event === 'doubleClick') {
                    setLastUpdateLensePosition(position);
                    let {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences}=
                        buildLenseDocumentSelection(
                            clusteringModelEnum,
                            metaLegendEnum,
                            lenseRadiusSliderLastValue,
                            position, documentsCountedByWord);

                    setSelectedDocuments(documentsInLense);
                    setSelectedMetas(tmpSelectedMetas);
                    setSelectedDocumentsVocabulary(selectedDocumentsVocab);
                    setSelectedCooccurrences(selectedCooccurrences);
                }
            },
            onLenseRadiusChanged: ({
                                       setLensePosition,
                                       clusteringModelEnum,
                                       lensePosition,
                                       lenseRadiusSliderLastValue,
                                       metaLegendEnum,
                                       setSelectedDocuments,
                                       setSelectedMetas,
                                       setSelectedDocumentsVocabulary,
                                       lastUpdateLensePosition,
                                       setLenseRadiusSliderLastValue,
                                       setSelectedCooccurrences, documentsCountedByWord
                                   }) => (event, value) => {
                setLenseRadiusSliderLastValue(value);
                if (event.type === 'mouseup'){
                    let {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences}=
                        buildLenseDocumentSelection(
                            clusteringModelEnum,
                            metaLegendEnum,
                            lenseRadiusSliderLastValue,
                            lensePosition, documentsCountedByWord);

                    setSelectedDocuments(documentsInLense);
                    setSelectedMetas(tmpSelectedMetas);
                    setSelectedDocumentsVocabulary(selectedDocumentsVocab);
                    setSelectedCooccurrences(selectedCooccurrences);
                }
            },
            resetWithEnum : ({
                                 setLensePosition,
                                 clusteringModelEnum,
                                 lensePosition,
                                 lenseRadiusSliderLastValue,
                                 metaLegendEnum,
                                 setSelectedDocuments,
                                 setSelectedMetas,
                                 setSelectedDocumentsVocabulary,
                                 lastUpdateLensePosition,
                                 setLenseRadiusSliderLastValue,
                                 setSelectedCooccurrences,
                                 setStrategyName,
                                 setDocumentsCountedByWord
                             }) => (strategyEnum) => {
                return; // Hack to stop a crash!!!!

                const strategyName = strategyEnumToName(strategyEnum);
                setStrategyName(strategyName);
                resetCache(strategyName);
                let documentsCountedByWord =  getDocumentsCountedByWord();
                setDocumentsCountedByWord(documentsCountedByWord);
                let {documentsInLense, tmpSelectedMetas, selectedDocumentsVocab, selectedCooccurrences}=
                    buildLenseDocumentSelection(
                        clusteringModelEnum,
                        metaLegendEnum,
                        lenseRadiusSliderLastValue,
                        lensePosition, documentsCountedByWord);

                setSelectedDocuments(documentsInLense);
                setSelectedMetas(tmpSelectedMetas);
                setSelectedDocumentsVocabulary(selectedDocumentsVocab);
                setSelectedCooccurrences(selectedCooccurrences);
            },

        })
    );

const DocumentSpace = enhance(({
                                   clusteringModelEnum, setClusteringModelEnum,
                                   setLenseEnabled, lenseEnabled,
                                   setLensePosition, lensePosition,
                                   pointsWordFilter, pointsWordFilterChanged,
                                   lenseRadiusSliderLastValue, setLenseRadiusSliderLastValue,
                                   metaLegendEnum,
                                   onLegendEnumChanged,
                                   colorScale,
                                   documentLevels,
                                   onLenseEvent,
                                   selectedMetas,
                                   selectedDocuments,
                                   selectedDocumentsVocabulary,
                                   onLenseRadiusChanged,
                                   selectedCooccurrences,
                                   strategyName,
                                   resetWithEnum,
                                   searchExclusiveChanged,
    searchActive, setSearchActive,
                                   documentsCountedByWord


}) => {
    logReactRender('documentSpace');
    let points = clustering_models[clusteringModelKeys[clusteringModelEnum]];

    console.log(points)

    let metaKey = metasKeys[metaLegendEnum];

    let hasMultipleMetas = metaKey !== 'None';

    let dateSortingFct = (a, b) => {
        return new Date(b['meta']) - new Date(a['meta']);
    };

    // this is for the pie exclusively
    let sortedSelectedMetas = selectedMetas['metas'];
    let countedSelectedMetas = countBy(sortedSelectedMetas);
    let sortedSelectedMetasKeys = metaKey === 'MonthDate' ? keys(countedSelectedMetas).sort(dateSortingFct) : keys(countedSelectedMetas).sort();
    let formattedCountedMetas = map(sortedSelectedMetasKeys, (k, i) => ({'meta':k, 'frequency':countedSelectedMetas[k], index: i}));

    const sortedVocabCounts = sortBy(selectedDocumentsVocabulary, 'value').reverse();

    return <div>
                <div style={{marginBottom:30}}>
                    <div style={{display:"inline-block", textAlign:"left", width:defaultWidth}}>
                        <div style={{display:"inline-block", marginRight:conv_margin}}>
                            <SelectField floatingLabelText="Model"
                                         value={clusteringModelEnum} onChange={(event, key) => setClusteringModelEnum(key)} >
                                {clusteringModelKeys.map((modelName, i) =>
                                    <MenuItem key={modelName} value={i} primaryText={modelName} />
                                )}
                            </SelectField>
                        </div>
                        <div style={{display:"inline-block", marginRight:conv_margin}}>
                            <SelectField floatingLabelText="Vocabulary"
                                         value={strategyNameToEnum(strategyName)} onChange={(event, key) => resetWithEnum(key)} >
                                {/*<MenuItem value={0} primaryText="No Filter" />*/}
                                {/*<MenuItem value={1} primaryText="Only Nouns" />*/}
                                <MenuItem value={1} primaryText="Default" />
                            </SelectField>
                        </div>
                        <div style={{display:"inline-block", marginRight:conv_margin}}>
                            <SelectField floatingLabelText="Legend"
                                         value={metaLegendEnum} onChange={(event, key) => {
                                             onLegendEnumChanged(key);
                                         }
                                         } >
                                {metasKeys.map((legendName, i) =>
                                    <MenuItem key={legendName} value={i} primaryText={legendName} />
                                )}
                            </SelectField>
                        </div>
                        {lenseEnabled &&<div style={{display:"inline-block", textAlign:"right", marginRight:conv_margin, overflow:"hidden", height:50, verticalAlign:"middle"}}>
                            <span>Lense</span>
                        </div>}
                        {lenseEnabled &&
                        <div style={{display:"inline-block", textAlign:"right", overflow:"hidden", height:50}}>
                            <Slider
                                min={0} max={5}
                                value={lenseRadiusSliderLastValue}
                                style={{ width:100}}
                                onChange={onLenseRadiusChanged}
                                onDragStop={(event) => onLenseRadiusChanged(event, lenseRadiusSliderLastValue)}
                            />
                        </div>}
                    </div>
                    <div style={{display:"inline-block", textAlign:"left", width:defaultWidth}}>
                        <div style={{display:"inline-block", marginRight:conv_margin, verticalAlign:"middle"}}>
                            <Toggle
                                defaultToggled={false}
                                onToggle={(e, value) => setSearchActive(value)}
                                label={searchActive? "Disable Search":"Enable Search"}
                                labelStyle={{fontSize:15, marginRight:5}}
                                labelPosition="left"
                            />
                        </div>

                        <div style={{display:"inline-block", marginRight:conv_margin}}>
                            <TagInputField
                                width={250}
                                onAddTag={(tags) => pointsWordFilterChanged(uniq(flatten([...pointsWordFilter, tags])))}
                                hintText="highlight words"
                                disabled={!searchActive}
                            />
                        </div>
                        <div style={{display:"inline-block", marginRight:conv_margin, verticalAlign:"middle"}}>
                            <Checkbox
                                defaultChecked={false}
                                label="Exclu."
                                labelPosition="left"
                                labelStyle={{fontSize:15, marginRight:5}}
                                onCheck={(e, value) => searchExclusiveChanged(value)}
                                disabled={!searchActive}
                            />
                        </div>
                        <div style={{display:"inline-block", marginRight:conv_margin, visibility:searchActive?"visible":"hidden"}}>
                            <TagBar width={300} tagWords={pointsWordFilter} tagWordsChanged={pointsWordFilterChanged}/>
                        </div>
                    </div>
                </div>
                <div style={{marginBottom:30}}>

                    <div style={{display:"inline-block"}}>

                        <Points points={points}
                                corpus={corpus}
                                corpusCounted={documentsCountedByWord}
                                metas={metas[metaKey]}
                                levels={documentLevels}
                                proposedWidth={defaultWidth}
                                proposedHeight={defaultWidth}
                                lenseEnabled={lenseEnabled}
                                onLenseEvent={onLenseEvent}
                                lensePosition={lensePosition}
                                lenseRadius={lenseRadiusSliderLastValue}
                                zScale={colorScale}
                                legendEnabled={metaKey !== 'MonthDate' && !searchActive}
                                x={x} y={y}
                                levelEnabled={searchActive}
                        />

                    </div>
                </div>
                {lenseEnabled && !isEmpty(selectedDocuments) &&
                <div style={{ textAlign:"center"}}>

                    <div style={{display:"inline-block", width:defaultWidth - 350, textAlign:'left', marginRight:50}}>
                        <strong>Number of documents in lense: {selectedDocuments.length}</strong>
                        <DocumentList documents={selectedDocuments} metas={selectedMetas} colorScale={colorScale}
                                      orderedBy={metaKey === 'MonthDate' ?
                                          {type: 'meta', order: dateSortingFct}:
                                          null}/>
                    </div>

                    <div style={{display:"inline-block", verticalAlign:"top"}}>
                        <div style={{width:300, height:260, overflow:"scroll"}}>
                            <ul style={{listStyleType: "none"}}>
                                {sortedVocabCounts.map((vocabCount) => {
                                    return (<li>{vocabCount.text + " - "+vocabCount.value}</li>)
                                })}
                            </ul>
                        </div>
                        <div style={{width:300, height:260, overflow:"hidden"}}>
                        <Network width={300} height={300} cooccurrences={selectedCooccurrences}/>
                        </div>
                        <div>
                        {hasMultipleMetas &&
                        <MetaPie width={300} height={300}
                                 scale={colorScale}
                                 countedMetas={formattedCountedMetas}
                                 pieSort={metaKey === 'MonthDate' ? dateSortingFct : (a, b) => a < b}
                        />}
                        </div>
                    </div>
                </div>}
            </div>
});

export default DocumentSpace;