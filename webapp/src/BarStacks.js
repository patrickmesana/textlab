import React from 'react';
import { BarStack } from '@vx/shape';
import { AxisBottom } from '@vx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { LegendOrdinal } from '@vx/legend';
import { max } from 'd3-array';
import {conv_margin} from "./constants";
import { LinearGradient } from '@vx/gradient';
import {schemeCategory20} from 'd3-scale'
import {find, includes, map, pick, reduce, size, take} from "lodash";


const tooltipMinWidth = 60;
// accessors
const x = d => {
    // console.log(d)
    return d.index;
};

export default withTooltip(
    ({
         width,
         height,
         margin = {
             top: 40
         },
         tooltipOpen,
         tooltipLeft,
         tooltipTop,
         tooltipData,
         hideTooltip,
         showTooltip,
         tickFormat,
         data,
         keys,
         order,
         normalized=false
     }) => {
        // console.log(data)

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
        const yMax = height - margin.top - 100;

        let xValues = stackData.map(x);
        // // scales
        const xScale = scaleBand({
            rangeRound: [0, xMax],
            domain: xValues,
            padding: 0.2,
            tickFormat: tickFormat
        });
        const yScale = scaleLinear({
            rangeRound: [yMax, 0],
            nice: true,
            domain: [0, max(totals)]
        });
        const zScale = scaleOrdinal({
            domain: keys,
            range: take(schemeCategory20, size(keys))
        });

        let tooltipTimeout;


        return (
            <div style={{ position: 'relative' , color:"white"}}>
                <svg width={width} height={height}>
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

                <BarStack
                    order={order}
                    top={margin.top}
                    data={stackData}
                    keys={keys}
                    height={yMax}
                    x={x}
                    xScale={xScale}
                    yScale={yScale}
                    zScale={zScale}
                    onMouseLeave={data => event => {
                        tooltipTimeout = setTimeout(() => {
                            hideTooltip();
                        }, 200);
                    }}
                    onMouseMove={data => event => {
                        if (data.height === 0) return;
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const cursorRelLeft = event.clientX - event.target.getBoundingClientRect().left;
                        const cursorRelTop = event.clientY - event.target.getBoundingClientRect().top;
                        const top = yScale(data.value) + cursorRelTop - conv_margin;
                        const left = xScale(data.x) + cursorRelLeft - tooltipMinWidth/2;
                        showTooltip({
                            tooltipData: data,
                            tooltipTop: top,
                            tooltipLeft: left
                        });
                    }}
                />
                <AxisBottom
                    scale={xScale}
                    top={yMax + margin.top}
                    stroke="white"
                    tickStroke="white"
                    tickLabelProps={(value, index) => ({
                        fill: 'white',
                        fontSize: 11,
                        textAnchor: 'middle',
                    })}
                />
            </svg>
        <div
            style={{
                position: 'absolute',
                top: margin.top / 2 - 10,
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
        </div>
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
    }
);