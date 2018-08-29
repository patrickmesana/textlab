// Inspired by Mike Bostock's Streamgraph &
// Lee Byron’s test data generator.
// https://bl.ocks.org/mbostock/4060954

import React from 'react';
import { Stack } from '@vx/shape';
import {  scaleLinear, scaleOrdinal } from '@vx/scale';
import {take, size, reduce, includes, map} from "lodash";
import {schemeCategory20, scalePow} from "d3-scale";
import {curveMonotoneX} from "d3-shape";
import { LinearGradient } from '@vx/gradient';
import { max } from 'd3-array';
import { AxisBottom } from '@vx/axis';
import { withTooltip, Tooltip } from '@vx/tooltip';
import {conv_margin} from './constants'
import {LegendOrdinal} from "@vx/legend";
const tooltipMinWidth = 60;
const x = d => d.index;

export default withTooltip(({
                    width = 600,
                    height = 400,
                    margin = {
                        top: 40,
                    },
                    tooltipOpen,
                    tooltipLeft,
                    tooltipTop,
                    tooltipData,
                    hideTooltip,
                    showTooltip,
                    legendHidden=false,
         data,
         keys,

     }) => {
        let normalized=true;

        let normalizedData = map(data, (group) => reduce(group, (c, v, k) => {
            includes(keys, k)? c[k] = v / group.total : c[k] = v;
            return c;
        }, {}));

        normalizedData = map(normalizedData, (g) => {
            g.total = 1;
            return g;
        });

        let stackData = normalized? normalizedData : data;
        const totals = stackData.map((o)=> o.total);

        if (width < 10) return null;

        // bounds
        const xMax = width;
        const yMax = height;

        let xValues = stackData.map(x);
        // // scales
        const xScale = scaleLinear({
            range: [0, xMax],
            domain: [0, size(xValues) -1],

        });
        const yScale = scalePow()
            .range([yMax, 0])
            .domain([1, 0])
            .exponent(1);
        const zScale = scaleOrdinal({
            domain: keys,
            range: take(schemeCategory20, size(keys))
        });

        let tooltipTimeout;
        return (
            <div style={{ position: 'relative'}}>
            <svg width={width} height={height}>
                <g>
                    <Stack
                        data={stackData}
                        keys={keys}
                        offset="wiggle"
                        order="insideout"
                        curve={curveMonotoneX}
                        x={(d, i) => {
                            // console.log('x')
                            // console.log(x(d.data))
                            return xScale(i)
                        }}
                        y0={d => {
                            // console.log('y0')
                            // console.log(yScale(d[0]))
                            return yScale(d[0])
                        }}
                        y1={d => {
                            // console.log('y1')
                            // console.log(yScale(d[1]))
                            return yScale(d[1])
                        }}
                        render={({ seriesData, path }) => {
                            return seriesData.map((series, i) => {
                                return (
                                    <g key={`series-${series.key}`}>
                                        <path d={path(series)} fill={zScale(series.key)}
                                        />
                                    </g>
                                );
                            });
                        }}

                    />
                </g>
            </svg>
                {!legendHidden &&    <div
                    style={{
                        position: 'absolute',
                        top: -30,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: '14px'
                    }}
                >
                    <LegendOrdinal
                        scale={zScale}
                        direction="row"
                        labelMargin="0 15px 0 0"
                    />
                </div> }
    {tooltipOpen &&
    <Tooltip
        top={tooltipTop}
        left={tooltipLeft}
        style={{
            minWidth: tooltipMinWidth,
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
        }}
    >
        <div style={{ color: zScale(tooltipData.key) }}>
            <strong>
                {tooltipData.key}
            </strong>
        </div>
        <div>
            {tooltipData.data[tooltipData.key]}
        </div>
        <div>
            <small>
                {tooltipData.xFormatted}
            </small>
        </div>
    </Tooltip>}
    </div>
        );
    })