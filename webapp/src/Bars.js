import React from 'react';
import { Group } from '@vx/group';
import { LinearGradient } from '@vx/gradient';
import { scaleLinear } from '@vx/scale';
import { max } from 'd3-array';
import { withTooltip, Tooltip } from '@vx/tooltip';
import {AxisLeft} from '@vx/axis'
import WordBar from './WordBar'
import { onlyUpdateForKeys } from 'recompose'
import { conv_margin } from './constants'

// accessors
const x = d => d.word;
const y = d => d.count;

const enhance = onlyUpdateForKeys(['data']);
const WordBars = enhance(({data, xScale, xMax, yMax, yScale, selectedColor, normalColor, mouseover, mouseleave, top, left}) => {
    return <Group top={top} left={left}>
        <AxisLeft
            scale={yScale}
            top={-3}
            left={5}
            label={"some label"}
            stroke={'#f1f1f1'}
            tickStroke={'#f1f1f1'}
            tickLength={0}
            numTicks={5}
            tickLabelProps={() => ({
                dx: '-0.25em',
                dy: '0.25em',
                fill: 'white',
                fontFamily: 'Arial',
                fontSize: 10,
                textAnchor: 'end'
            })}
            hideAxisLine={true}
            tickFormat={yScale.tickFormat(5, "s")}
        />
        {
            data.map((d, i) => {
                const barHeight = yMax - yScale(y(d));
                const minBarWidth =  1;
                const maxBarWidth = 3;

                let barWidth = xMax / data.length;

                barWidth = barWidth < minBarWidth ? minBarWidth : barWidth;
                barWidth = barWidth > maxBarWidth ? maxBarWidth : barWidth;

                const barX=xScale(i);
                const barY=yMax - barHeight;
                const barData = { x: x(d), y: y(d), index:i };
                return <Group key={`bar-${x(d)}`} left={5}>
                            <WordBar barWidth={barWidth}
                                     barHeight={barHeight}
                                     x={barX}
                                     y={barY}
                                     selectedColor={selectedColor}
                                     normalColor={normalColor}
                                     barData={barData}
                                     mouseover={mouseover}
                                     mouseleave={mouseleave}
                            />
                        </Group>;
            })
        }
        </Group>
});

const Bars = withTooltip(({
                  width,
                  height,
                  totalCount,
                  nbrOfWords,
                  data,
                  tooltipBackgroundColor,
                  tooltipOpen,
                  tooltipLeft,
                  tooltipTop,
                  tooltipData,
                  hideTooltip,
                  showTooltip
              }) => {

    if (width < 10)
        throw Error('Bad Width');

    // bounds
    const xMax = width;
    const yMax = height - 120;
    const xMargin = conv_margin * 2;

    //tooltip size
    const tooltipMinWidth = 60;

    // scales
    const xScale = scaleLinear({
        domain: [0, nbrOfWords],
        rangeRound: [0, xMax-xMargin*2],
    });
    const yScale = scaleLinear({
        domain: [0, max(data, y)],
        rangeRound: [yMax, 0],
    });

    function wordBarsMouseOver(data, top, left) {
        showTooltip({
            tooltipData: data,
            tooltipTop: top,
            tooltipLeft: left
        })
    }

    return (
        <div style={{ position: 'relative' }}>

            <svg width={width} height={height} id="word_dist">
                <LinearGradient id="teal"
                                from="#000000"
                                to="#39373b"
                />
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill={`url(#teal)`}
                    rx={5}
                />

                <WordBars data={data}
                          xScale={xScale}
                          xMax={xMax}
                          yMax={yMax}
                          yScale={yScale}
                          selectedColor={tooltipBackgroundColor}
                          normalColor={"#fffafe"}
                          mouseover={wordBarsMouseOver}
                          mouseleave={hideTooltip}
                          top={40}
                          left={xMargin}
                />

            </svg>
            {tooltipOpen &&
            <Tooltip
                top={tooltipTop}
                left={tooltipLeft}
                style={{
                    minWidth: tooltipMinWidth,
                    backgroundColor: 'black',
                    color: 'white'
                }}
            >
                <div style={{ color: tooltipBackgroundColor }}>
                    <strong>
                        {tooltipData.x}
                    </strong>
                </div>
                <div>
                    {tooltipData.y}
                </div>
                <div>
                    {(tooltipData.y * 100 / totalCount).toPrecision(3)}%
                </div>
            </Tooltip>}

        </div>
    );
});

export default Bars;