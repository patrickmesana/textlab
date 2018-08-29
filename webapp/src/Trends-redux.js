import {createReducer} from './redux-utils'
import {
    // getCategoryKeys,
    // getCategoriesWithTopWords,
    topWords, resetCache, all
} from './data'
import crossfilter from 'crossfilter'
import {isEmpty} from "lodash";

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



const TAG_WORDS_CHANGED = 'TAG_WORDS_CHANGED_2';

const initialState = {
    tagWords: ['work', 'company'],
    // categoryKeys: getCategoryKeys(),
    data: getData(_appData.countDimension),
    staticTotalCount: _appData.staticTotalCount,
    nbrOfWords: getSize(_appData.allCountGroup),
    staticTotalSize: _appData.staticTotalSize,
    // categoriesWithTopWords: getCategoriesWithTopWords(['work', 'company']),
};


export const tagWordsChanged = (tagWords) => ({
    type: TAG_WORDS_CHANGED,
    payload: tagWords
});

export default createReducer(initialState, {

    [TAG_WORDS_CHANGED]: (state, tagWords) => ({
        ...state,
        tagWords: tagWords,
        // categoriesWithTopWords: getCategoriesWithTopWords(tagWords),
    }),
});