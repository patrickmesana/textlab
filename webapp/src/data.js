import _, {
    map, reduce, takeRight, uniq, zipWith, keys, findIndex, find, isEmpty, sumBy, clone, sortBy, values,
    flatten, take, takeWhile, orderBy, last, filter, isUndefined, repeat, intersection, union, first, maxBy,
} from "lodash"

function countWords(vocabCounts) {
    return _.map(vocabCounts, (vocabCount, key) => {

        return {
            "word":key,
            "count":_.reduce(vocabCount, (currentCount, value) => {
                return currentCount + value[1]
            }, 0)

        }
    });
}


// function countWordsByMeta(vocabCounts, metasAccessor) {
//     return _.map(vocabCounts, (vocabCount, key) => {
//
//         let wordMetaList = _.map(vocabCount, (currentCount) => {
//             return [metasAccessor(currentCount[0]), currentCount[1]]
//         });
//
//         let metaCount = _.reduce(wordMetaList, (tpmMetaCount, meta) => {
//             tpmMetaCount[meta[0]] ? tpmMetaCount[meta[0]] += meta[1] : tpmMetaCount[meta[0]] = 1;
//             return tpmMetaCount;
//         }, {});
//
//         return {
//             "word":key,
//             "metaCount": metaCount
//         }
//     });
// }

// function countMetasByWords(wordsCountedByMeta, metaNames) {
//     let metaToWords = _.reduce(metaNames,
//         (tmp, metaName) => ({...tmp, [metaName]:{}}), {});
//     return _.reduce(wordsCountedByMeta, (tmp, wordCountedByMeta) => {
//         return _.reduce(wordCountedByMeta['metaCount'], (innerTmp, innerMetaCount, innerMetaName) => {
//             innerTmp[innerMetaName][wordCountedByMeta["word"]] = innerMetaCount;
//             return innerTmp;
//         }, tmp)
//     }, metaToWords);
// }

function buildCoocurences(documentsCountedByWord, word, wordDocsOccurences, vocab) {
    let wordCoocurences = {};

    let wordDocs = map(wordDocsOccurences, (wordDocOccurence) => documentsCountedByWord[wordDocOccurence[0]]);

    for (let i in wordDocs) {
        let doc = wordDocs[i];
        for (let j in doc) {
            let wordCount = doc[j];
            let wordName = wordCount['text'];
            if (word !== wordName && !!vocab[wordName]) {
                let wordCoocurence = wordCoocurences[wordName];
                wordCoocurences = wordCoocurence ?
                    {...wordCoocurences, [wordName]: wordCoocurence + 1} :
                    {...wordCoocurences, [wordName]: 1}
            }
        }
    }



    return wordCoocurences;
}


// function countWordsWithCategories(wordsCategoriesCounts, categoryNames) {
//     return _(wordsCategoriesCounts)
//         .map((wordCategoriesCounts) => {
//             let metaCountDetails = _.map(categoryNames, (categoryName) =>{
//                     let metaCount = wordCategoriesCounts["metaCount"][categoryName];
//                     return metaCount? metaCount : 0;
//                 });
//
//             let totalWordCategoriesCount = _.sum(metaCountDetails);
//             return {
//                 "word":wordCategoriesCounts["word"],
//                 "count": totalWordCategoriesCount
//             }
//         })
//         .filter((w) => w["count"] > 0)
//         .value();
// }

function orderByCount(objList) {
    return _.orderBy(objList, "count");
}


function addCumulative(objList) {
    let cumulativeCount = 0;
    for(let i in objList) {
        objList[i].cumulativeCount = cumulativeCount + objList[i].count;
        cumulativeCount = objList[i].cumulativeCount;
    }
    return objList;
}

function uniqCategoryKeys(categories) {
    return uniq(categories);
}


function getMonthsKeys(monthFromJson, yearFromJson) {
    return uniq(zipWith(monthFromJson, yearFromJson, (month, year) => year + "/" + month))
}


function countDocumentsByWords(vocabCounts, nbrOfDocuments) {
    let documents = [];
    for (let i=0; i < nbrOfDocuments; i++) {
        documents.push([]);
    }
    for (let word in vocabCounts) {
        let wordCounts = vocabCounts[word];
        for (let j in wordCounts) {
            let wordCount = wordCounts[j];
            documents[wordCount[0]] = [...documents[wordCount[0]], {text:word, value:wordCount[1]}]
        }
    }
    return documents;
}


function buildVocabCountsMap(vocabCountsJson) {
    return reduce(vocabCountsJson, (vocabCountsMap, wordDocsCounts, word) => {
        return {...vocabCountsMap, [word]: reduce(wordDocsCounts, (wordDocsCountsMap, wordDocCounts) => {
            return {...wordDocsCountsMap, [wordDocCounts[0]]: wordDocCounts[1]}
        }, {})}
    }, {})
}

function cache(tokenizer_strategy) {
    let metasJson = require("./input/metas.json");
    let contentsJson = require("./input/contents.json");
    // let categoryNameKey = 'MetricName';
    let vocabCountsJson = require("./input/vocab_stats.json");

    let vocabKeys = keys(vocabCountsJson);

    let vocabCountsAsMap = buildVocabCountsMap(vocabCountsJson);
    // let categoryNamesFromJson = metasJson[categoryNameKey];
    let monthFromJson = metasJson['DateMonth'];
    let yearFromJson = metasJson['DateYear'];
    let nbrOfDocuments = contentsJson.length;
    // let categoryKeys = uniqCategoryKeys(categoryNamesFromJson);
    let monthsKeys = getMonthsKeys(monthFromJson, yearFromJson);
    let unordered_all = countWords(vocabCountsJson);
    let ordered_all = orderByCount(unordered_all);
    // let unordered_countedWordsByCategory = countWordsByMeta(vocabCountsJson, (i) => categoryNamesFromJson[i]);
    // let unordered_countedCategoriesByWords = countMetasByWords(unordered_countedWordsByCategory, categoryKeys);
    // let unordered_countedWordsByMonth = countWordsByMeta(vocabCountsJson, (i) => yearFromJson[i] + "/" + monthFromJson[i]);
    // let unordered_countedMonthsByWords = countMetasByWords(unordered_countedWordsByMonth, monthsKeys);
    let countedDocuments = countDocumentsByWords(vocabCountsJson, nbrOfDocuments);
    return {
        nbrOfDocuments,
        // categoryKeys,
        monthsKeys,
        unordered_all,
        ordered_all, // this is all the counted term data
        // unordered_countedWordsByCategory, // this is the counted term data  by category
        // unordered_countedCategoriesByWords,
        // unordered_countedWordsByMonth,
        // unordered_countedMonthsByWords,
        // categoryNamesFromJson,
        monthFromJson,
        yearFromJson,
        countedDocuments,
        vocabCountsAsMap,
        vocabKeys
    };
}

/** INIT **/

let tf_filtered_vocab = null;
let tf_vocab = null;
let tfcentropy_vocab = null;
let tfidf_vocab = null;
let _cacheBOnlyNounsIdf = null;
let _cache = null;
let levelsTemplate = null;

function writeCacheToFiles() {
    let fs  = require('fs');
    fs.writeFileSync("./src/input/cache/tf_vocab.json", JSON.stringify(cache('tf_vocab'), null, 2));
}

//CACHING_MODE="FILE_SYS" babel-node ./src/data.js --presets es2015,stage-2

if (process.env.CACHING_MODE === "FILE_SYS"){
    writeCacheToFiles();
}

function initCacheWithFiles() {
    tf_vocab = require("./input/cache/tf_vocab.json");
     _cache = tf_vocab;
     levelsTemplate = map(repeat(0, _cache.nbrOfDocuments));
}
initCacheWithFiles();

function initCache() {
    tf_vocab = cache('tf_vocab');
    console.log('tf_vocab created!');
    _cache = tf_vocab;
    levelsTemplate = map(repeat(0, _cache.nbrOfDocuments));
}

//uncomment this line if you want to not use the file caches
// initCache();

/** EXPORTS **/

export function buildCooccurencesForTop4Words(documentsCountedByWord, countedWords, sortedDocumentIndexes, maxVocabSize = 100) {

    const sortedWords = takeRight(sortBy(countedWords, 'value'), maxVocabSize).reverse();
    const countedWordsAsDict = reduce(countedWords, (c, w) => ({...c, [w['text']]:w['value']}));
    const top4Words = take(map(sortedWords, 'text'), 4);

    return map(top4Words, (topWord) => {
        const sortedWordDocsOccurences = getWordDocumentsOccurences(topWord);
        const filteredWordDocsOccurences = filter(
            map(sortedDocumentIndexes, documentIndex => [documentIndex, sortedWordDocsOccurences[documentIndex]]),
            (docCount) => !isUndefined(docCount[1])
            );
        const coocurences = buildCoocurences(documentsCountedByWord, topWord, filteredWordDocsOccurences, countedWordsAsDict);
        return {
            text: topWord,
            cooccurrences:orderBy(map(coocurences, (v, k) => ({text:k, size:k.length, cooc:v, oc:countedWordsAsDict[k]})),
                (coocurence) => coocurence['cooc'] * Math.log(coocurence['oc']))
                .reverse()
        };
    });
}

export function buildMapForTop4WordsOccurrences(cooccurrences){
    let words = map(cooccurrences, 'text');
    return map(cooccurrences, (cooccurrence) => ({
        ...cooccurrence,
        cooccurrences: flatten([
            find(cooccurrence['cooccurrences'], (word) => !words.includes(word['text'])),
            filter(cooccurrence['cooccurrences'], (word) => words.includes(word['text']))
        ])
    }));
}

export function getWordDocumentsOccurences(word) {
    return _cache.vocabCountsAsMap[word];
}

export function getCountedWordsFromDocumentIndexes(indexes, docsCounts) {
    let filteredCountedDocs = map(indexes, (i) => docsCounts[i]);
    let words = {};
    for (let i in filteredCountedDocs) {
        let doc  = filteredCountedDocs[i];
        for (let j in doc) {
            let word = doc[j];
            let wordKey = word['text'];
            let wordCount = word['value'];
            words[wordKey] = words[wordKey] ?
                words[wordKey] + wordCount :
                wordCount;
        }
    }
    return map(words, (value, key) => ({text:key, value: value}));

}

function doesWordsAreInWord(vocabWord, words) {
    return !!find(words, (word) =>
            !!~vocabWord.indexOf(word));
}

export function markDocumentsContainingWords(_documents, words, isExclusive) {
    let searchCache  = tf_vocab; //this is a hack and should be as input, but in the mean time it is supose to be the
    //main vocab used

    let results = clone(levelsTemplate);

    let vocabWordsContainingWords = isExclusive ?
        words:
        filter(searchCache.vocabKeys, vocabWord => doesWordsAreInWord(vocabWord, words));

    let wordsDocuments = map(vocabWordsContainingWords, word => keys(   searchCache.vocabCountsAsMap[word]));

    let combinedDocuments = isExclusive ?
        intersection(...wordsDocuments):
        union(...wordsDocuments);

    for (let i in combinedDocuments) {
        results[combinedDocuments[i]] = 1;
    }

    return results;
}

function splitByCategories(_data, categories=[], maxCategories=4) {
    if(maxCategories === 0 || isEmpty(_data)) {
        return categories;
    }

    let data = clone(_data);
    const frequencyTotal = sumBy(data, 'value');
    const frequencyFor80th = 0.8 * frequencyTotal;

    let count = 0;
    let lastIndex;
    for (let i in data) {
        lastIndex = i;
        let d = data[i];
        count += d['value'];
        // console.log(count)
        if (count >= frequencyFor80th) {
            let lowerCat = data.splice(lastIndex);
            const newIterations = maxCategories - 1;
            return splitByCategories(lowerCat, [...categories, {
                data,
                total:frequencyTotal,
                max:data[0]
            }], newIterations);
        }
    }
}


export function categorizeCountedWords(sortedData) {

    let categories = splitByCategories(sortedData);

    return flatten(map(categories, (category, i) => map(category.data, (d) => ({...d,
        category:i,
        categoryTotal:category.total,
        categoryMaxFrequency:category.max.value
    }))));
}

export function resetCache(strategy) {
    switch (strategy) {
        default:
            _cache = tf_filtered_vocab;
            break;
    }
}

// export function getCategoryKeys() {
//     return _cache.categoryKeys;
// }

export function all() {
    return addCumulative(_cache.ordered_all);
}

// export function allFilteredWithCategory(categoryNames) {
//     return addCumulative(orderByCount(countWordsWithCategories(_cache.unordered_countedWordsByCategory, categoryNames)));
// }



// export function getWordCategoriesCount(word) {
//     let wordCategories = _(_cache.unordered_countedWordsByCategory)
//         .find((w) => w["word"] === word)["metaCount"];
//
//     return  _(wordCategories).map((v, k) => ({
//             frequency: v,
//             letter: _.reduce(k.split('_'), (c,mp) => c + mp[0], "")
//         }))
//         .value()
// }

// export function getWordsCategoriesCount(words) {
//     return _.map(words, (word) => ({
//         ...getWordCategoriesCount(word),
//         index: word
//     }));
// }

// function getMetasWithTopWords(countedMetasByWords, topWords) {
//     return map(countedMetasByWords, (categoryWordsCounts, categoryName) => {
//         return reduce(topWords, (c, wordName) => {
//             let wordCount = categoryWordsCounts[wordName];
//             return wordCount?
//                 {...c, [wordName]: wordCount, total:c.total + wordCount} :
//                 {...c, [wordName]: 0}
//         }, {index: categoryName, total:0})
//     });
// }

// function getCategoriesWordFrequencyWithTopWords(countedMetasByWords, topWords) {
//     // console.log(countedMetasByWords)
//     let twTotals = map(topWords, (tw) => {
//         return reduce(countedMetasByWords, (c, categoryWordsCounts) => {
//             c += (categoryWordsCounts[tw] ? categoryWordsCounts[tw] : 0);
//             return c;
//         }, 0)
//     });
//
//
//     return map(countedMetasByWords, (categoryWordsCounts, categoryName) => {
//         return reduce(topWords, (c, wordName) => {
//             let wordCount = categoryWordsCounts[wordName];
//             let totalCountForWord = twTotals[topWords.indexOf(wordName)];
//             let wordFreq = wordCount / totalCountForWord;
//             // console.log(totalCountForWord);
//             // console.log(wordFreq);
//             return wordCount ?
//                 {...c, [wordName]: wordFreq , total: c.total + wordFreq}:
//                 {...c, [wordName]: 0}
//         }, {index: categoryName, total: 0})
//     });
// }


// export function getMetasWordFrequencyWithTopWords(topWords) {
//     return getCategoriesWordFrequencyWithTopWords(_cache.unordered_countedCategoriesByWords, topWords)
// }

// export function getCategoriesWithTopWords(topWords) {
//     return getMetasWithTopWords(_cache.unordered_countedCategoriesByWords, topWords)
// }

// export function getMonthsWithTopWords(topWords) {
//     return getMetasWithTopWords(_cache.unordered_countedMonthsByWords, topWords)
// }

export function topWords(n=10) {
    return map(takeRight(_cache.ordered_all, n), (o) => o.word);
}
//
// export function topCategoryWords() {
//     let mKeys = _cache.categoryKeys;
//     let words = map(mKeys, (mKey) => {
//         let categoryWords = map(_cache.unordered_countedCategoriesByWords[mKey], (value, key) => ({
//             text:key,
//             count:value
//         }));
//         let topWord = maxBy(categoryWords, 'count');
//         return topWord.text;
//     });
//     return uniq(words);
// }

export function getDocumentsCountedByWord() {
    return _cache.countedDocuments;
}