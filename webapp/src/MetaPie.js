import React from 'react';
import { Arc } from '@vx/shape';
import { Group } from '@vx/group';
import {map} from 'lodash'

function Label({ x, y, children }) {
    return (
        <text
            fill="white"
            textAnchor="middle"
            x={x}
            y={y}
            dy=".33em"
            fontSize={9}
        >
            {children}
        </text>
    );
}

const pieTopMargin = 15;

export default ({
                    style,
                    countedMetas,
                    width,
                    height,
                    scale,
                    pieSort
                }) => {
    const radius = Math.min(width, height) / 2;

    return (
        <svg width={width} height={height + pieTopMargin} style={style}>
            <Group left={width/2} top={height/2 + pieTopMargin}>
                <Arc
                    data={countedMetas}
                    pieValue={d => d.frequency}
                    innerRadius={0}
                    outerRadius={radius}
                    fill={d =>  scale(d.data.meta)}
                    pieSort={pieSort}
                    centroid={(centroid, arc) => {
                        const [x, y] = centroid;
                        return <Label x={x} y={y}>{arc.data.meta}</Label>;
                    }}
                />
            </Group>
        </svg>
    );
}