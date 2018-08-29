import {createReducer} from './redux-utils'
import {
    getCategoryKeys,
    getMetasWordFrequencyWithTopWords,
    topWords, resetCache, allFilteredWithCategory, all
} from './data'
import crossfilter from 'crossfilter'
import {filter, isEmpty} from "lodash";

const initProportion = 0.8;

function buildAppData(categoryNames) {
    // const allData = !isEmpty(categoryNames) ? allFilteredWithCategory(categoryNames) : all();
    const allData = all();
    const crossData = crossfilter(allData);
    const countDimension = crossData.dimension((d) => d["count"]);
    const cumulativeCountDimension = crossData.dimension((d) => d["cumulativeCount"]);

    const allCountGroup = crossData.groupAll();
    const staticTotalCount = allCountGroup.reduceSum((d) => d["count"]).value();
    const staticTotalSize = getSize(allCountGroup);
    filterDimensionByPercentage(initProportion, staticTotalCount, cumulativeCountDimension);
    return {
        countDimension,
        cumulativeCountDimension,
        initProportion:initProportion,
        allCountGroup,
        staticTotalCount,
        staticTotalSize,
    };
}

function filterDimensionByPercentage(percentage, staticTotalCount, cumulativeCountDimension) {
    let percentageCount = Math.round(staticTotalCount * (1 - percentage));
    return cumulativeCountDimension.filterRange([percentageCount, staticTotalCount + 1]);
}

function getData(countDimension) {
    return countDimension.top(Infinity)
}

function getSize(allCountGroup){
    return allCountGroup.reduceCount().value();

}


let _appData = buildAppData();
function reset(strategyName) {
    resetCache(strategyName);
    _appData = buildAppData();
}



const SELECT_WORD = 'SELECT_WORD_1';
const CLEAR_SELECTED_WORD = 'CLEAR_SELECTED_WORD_1';
const SELECT_WORD_FOR_PIE = 'SELECT_WORD_FOR_PIE_1';
const TAG_WORDS_CHANGED = 'TAG_WORDS_CHANGED_1';
const LOAD_WORD_WITH_STRATEGY = 'LOAD_WORD_WITH_STRATEGY_1';
const FILTER_BY_PERCENTAGE = 'FILTER_BY_PERCENTAGE_1';
const FILTER_BY_METRICS = 'FILTER_BY_METRICS_1';
const SET_TEMP_PERCENTAGE = 'SET_TEMP_PERCENTAGE_1';

const initialState = {
    selectedWord: null,
    selectedWordForPie: null,
    tagWords: ['work', 'company'],
    strategyName: 'advanced',
    // categoryKeys: getCategoryKeys(),
    // categorySelections: getCategoryKeys().map(() => false),
    data: getData(_appData.countDimension),
    staticTotalCount: _appData.staticTotalCount,
    nbrOfWords: getSize(_appData.allCountGroup),
    sliderLastValue: _appData.initProportion,
    staticTotalSize: _appData.staticTotalSize,
    // categoriesWithTopWords: getMetasWordFrequencyWithTopWords(['work', 'company']),
};


const updateDataWithPercentage = (percentage) => {
    filterDimensionByPercentage(percentage, _appData.staticTotalCount, _appData.cumulativeCountDimension);
};


// export const filterDataByCategories = (categoryKeys, tmpCategorySelections) => {
//     let categoryNameSelection = filter(categoryKeys, (o, k) => tmpCategorySelections[k]);
//     _appData = buildAppData(categoryNameSelection);
//     return {
//         type: FILTER_BY_METRICS,
//         payload: tmpCategorySelections
//     };
// };

export const loadDataWithWithStrategy = (strategy) => {
    //TODO: this is a hack
    reset(strategy);
    return {
        type: LOAD_WORD_WITH_STRATEGY,
        payload: strategy
    };
};

export const filterByPercentage = (percentage) => {
    //TODO: this is a hack
    updateDataWithPercentage(percentage);
    return {
        type: FILTER_BY_PERCENTAGE,
        payload: percentage
    }
};

export const setSliderLastValue = (percentage) => {
    return {
        type: SET_TEMP_PERCENTAGE,
        payload: percentage
    }
};

export const selectWord = wordData => ({
    type: SELECT_WORD,
    payload: wordData
});

export const clearSelectedWord = () => ({
    type: CLEAR_SELECTED_WORD,
});

export const selectWordForPie = (wordData) => ({
    type: SELECT_WORD_FOR_PIE,
    payload: wordData
});

export const tagWordsChanged = (tagWords) => ({
    type: TAG_WORDS_CHANGED,
    payload: tagWords
});

export default createReducer(initialState, {
    [LOAD_WORD_WITH_STRATEGY]: (state, strategy) => ({
        ...state,
        strategyName:strategy,
        data: getData(_appData.countDimension),
        staticTotalCount: _appData.staticTotalCount,
        nbrOfWords: getSize(_appData.allCountGroup),
        sliderLastValue: _appData.initProportion,
        staticTotalSize: _appData.staticTotalSize,
    }),
    [FILTER_BY_PERCENTAGE]: (state, percentage) => ({
        ...state,
        sliderLastValue: percentage,
        data: getData(_appData.countDimension),
        staticTotalCount: _appData.staticTotalCount,
        nbrOfWords: getSize(_appData.allCountGroup),
        staticTotalSize: _appData.staticTotalSize,
    }),
    // [FILTER_BY_METRICS]: (state, categorySelections) => ({
    //     ...state,
    //     categorySelections: categorySelections,
    //     data: getData(_appData.countDimension),
    //     staticTotalCount: _appData.staticTotalCount,
    //     nbrOfWords: getSize(_appData.allCountGroup),
    //     staticTotalSize: _appData.staticTotalSize,
    //     sliderLastValue: _appData.initProportion
    // }),
    [SET_TEMP_PERCENTAGE]: (state, percentage) => ({
        ...state,
        sliderLastValue: percentage
    }),
    [SELECT_WORD]: (state, selectedWord) => ({
        ...state,
        selectedWord: selectedWord
    }),
    [TAG_WORDS_CHANGED]: (state, tagWords) => ({
        ...state,
        tagWords: tagWords,
        // categoriesWithTopWords: getMetasWordFrequencyWithTopWords(tagWords),
    }),
    [SELECT_WORD_FOR_PIE]: (state, selectedWord) => ({
        ...state,
        selectedWordForPie: selectedWord
    }),
    [CLEAR_SELECTED_WORD]: (state) => ({
        ...state,
        selectedWord: null
    })
});