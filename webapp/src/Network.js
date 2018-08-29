import React from 'react';
import { Graph } from '@vx/network'
import {onlyUpdateForKeys} from "recompose";
import {flatten, isEmpty, map, reduce, uniq} from 'lodash';

const zCat0 = 10;
const zCat1 = 15;
const zCat2 = 20;
const zTop = 28;
const zSecond = 24;

const enhance = onlyUpdateForKeys(['cooccurrences']);
export default enhance(({
                      width,
                      height,
                        cooccurrences
}) => {


try {
    let firstNodeP = {x: width * 0.5, y: height * 0.1, z: zTop, label: cooccurrences[0]['text']};
    let firstNodeS = {x: width * 0.7, y: height * 0.1, z: zCat1, label: cooccurrences[0]['cooccurrences'][0]['text']};
    let secondNodeP = {x: width * 0.8, y: height * 0.4, z: zSecond, label: cooccurrences[1]['text']};
    let secondNodeS = {x: width * 0.8, y: height * 0.6, z: zCat1, label: cooccurrences[1]['cooccurrences'][0]['text']};
    let thirdNodeP = {x: width * 0.5, y: height * 0.7, z: zCat2, label: cooccurrences[2]['text']};
    let thirdNodeS = {x: width * 0.3, y: height * 0.7, z: zCat1, label: cooccurrences[2]['cooccurrences'][0]['text']};
    let fourthNodeP = {x: width * 0.2, y: height * 0.4, z: zCat2, label: cooccurrences[3]['text']};
    let fourthNodeS = {x: width * 0.2, y: height * 0.2, z: zCat1, label: cooccurrences[3]['cooccurrences'][0]['text']};
    const nodes =
        [
            //first node
            firstNodeP,
            firstNodeS,

            //second node
            secondNodeP,
            secondNodeS,

            //third node
            thirdNodeP,
            thirdNodeS,

            //fourth node
            fourthNodeP,
            fourthNodeS
        ];

    const subLinks = [
        {source: nodes[0], target: nodes[1]},
        {source: nodes[2], target: nodes[3]},
        {source: nodes[4], target: nodes[5]},
        {source: nodes[6], target: nodes[7]},
    ];

    const top4Words = map(cooccurrences, 'text');
    const top4WordsIndexes = [0,2,4,6];
    const top4WordsMap = reduce(top4Words, (c, w, i) => ({...c, [w]:top4WordsIndexes[i]}), {});


    const eliteLinks = map(top4WordsIndexes, (i, ii) => {
        if (cooccurrences.length < 2) {
            return [];
        }
        let wordCooccurences = cooccurrences[ii]['cooccurrences'].slice(1, cooccurrences.length);
        let targetIndexes = map(wordCooccurences, (wordCoo) => top4WordsMap[wordCoo['text']]);
        return map(targetIndexes, (j) => ({source: nodes[i], target: nodes[j]}));
    });


    const links = flatten([subLinks, flatten(eliteLinks)]);

    const dataSample = {
        nodes,
        links: links
    };

    return <svg width={width} height={height}>
        <Graph graph={dataSample} nodeComponent={({node}) => {
            return <g>
                <circle r={node.z} stroke="black" fill="white"/>
                <text dx={-node.z} dy={15 + node.z} style={{fontSize:10}}>{node.label}</text>
            </g>;
        }} />
    </svg>
}
catch (e) {
    console.warn(e)
        return null;
}


})