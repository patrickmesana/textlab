import {
    buildCooccurencesForTop4Words,
    buildMapForTop4WordsOccurrences,
    categorizeCountedWords,
    getCountedWordsFromDocumentIndexes,
    getDocumentsCountedByWord,
    getWordDocumentsOccurences,
    markDocumentsContainingWords
} from "./data";
import {range, take} from "lodash";


export function test1() {
    let results = markDocumentsContainingWords(getDocumentsCountedByWord(), ['work', 'company']);
    expect(results)
        .not.toHaveLength(0);
}

export function test2() {



    const nbrOfDocs = 100;
    const data = [
        {text:"a", value:143},
        {text:"b", value:18},
        {text:"c", value:3},
        {text:"d", value:2},
        {text:"e", value:1},
        {text:"g", value:11},
        {text:"h", value:1},
        {text:"i", value:1},
        {text:"j", value:1},
        {text:"k", value:152},
        {text:"l", value:4},
        {text:"m", value:33},
        {text:"n", value:1}
    ];

    let augmentedData = categorizeCountedWords(data);

    return {augmentedData};
}
//
//
//
// export function test3() {
//
//     let nbrOfDocuments = 300;
//     let documentsCountedByWord = take(getDocumentsCountedByWord(), nbrOfDocuments);
//     let sortedDocumentIndexes = range(nbrOfDocuments);
//     let countedWords = getCountedWordsFromDocumentIndexes(sortedDocumentIndexes, documentsCountedByWord);
//     let cooccurrences = buildCooccurencesForTop4Words(documentsCountedByWord, countedWords, sortedDocumentIndexes);
//     return buildMapForTop4WordsOccurrences(cooccurrences);
//
// }


