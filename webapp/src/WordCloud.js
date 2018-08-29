import { Component, PropTypes } from 'react';
import ReactFauxDom from 'react-faux-dom';
import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import cloud from 'd3-cloud';
import {maxBy, orderBy, sortBy, take, takeRight} from "lodash";
import {onlyUpdateForKeys} from "recompose";
import {logReactRender} from "./logs";
import {categorizeCountedWords} from "./data";


const defaultFontSizeMapper = word => word.value;

const fill = scaleOrdinal(schemeCategory10);

function normlizeFontSizeMapper(word, k=33 , maxCategory=4, scalingFactor=2) {
    let valuePercent = word.value / word.categoryMaxFrequency * 100;
    let refValue = (k/ Math.log(100));
    let categoryScaling = Math.pow((maxCategory - word.category) / maxCategory, scalingFactor);
    return Math.log(valuePercent) * (refValue * categoryScaling);
}

const enhance = onlyUpdateForKeys(['data']);
export default  enhance(( { data, width, height, padding, font, fontSizeMapper, rotate } ) => {
        logReactRender('wordCloud');
        const sortedData = sortBy(data, 'value').reverse();
        let wordCounts = categorizeCountedWords(take(sortedData, 100));

        let thisWordCloud = ReactFauxDom.createElement('div');


        // render based on new data
        const layout = cloud()
            .size([width, height])
            .font(font)
            .words(wordCounts)
            .padding(padding)
            .rotate(rotate)
            .fontSize(fontSizeMapper?fontSizeMapper:(word) => normlizeFontSizeMapper(word))
            .on('end', words => {
                select(thisWordCloud)
                    .attr('width', layout.size()[0])
                    .attr('height', layout.size()[1])
                    .append('svg')
                    .attr('width', layout.size()[0])
                    .attr('height', layout.size()[1])
                    .append('g')
                    .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
                    .selectAll('text')
                    .data(words)
                    .enter()
                    .append('text')
                    .style('font-size', d => `${d.size}px`)
                    .style('font-family', font)
                    .style('fill', (d, i) => fill(i))
                    .attr('text-anchor', 'middle')
                    .attr('transform',
                        d => `translate(${[d.x, d.y]})`
                    )
                    .text(d => d.text);
            });

        layout.start();

        return thisWordCloud.toReact();
})

