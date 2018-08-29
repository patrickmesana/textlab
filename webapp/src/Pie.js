import React from 'react';
import { Arc } from '@vx/shape';
import { Group } from '@vx/group';


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

const pieTopMargine = 15;

export default ({
                    word,
                    width,
                    height,
                    data
                }) => {
    if (width < 10) return null;
    const radius = Math.min(width, height) / 2;
    return (
        <svg width={width} height={height + pieTopMargine}>
            <Group left={width/2} top={height/2 + pieTopMargine}>
                <Arc
                    data={data}
                    pieValue={d => d.frequency}
                    innerRadius={0}
                    outerRadius={radius}
                    fill="black"
                    fillOpacity={d => 1 / (d.index + 2) }
                     centroid={(centroid, arc) => {
                         const [x, y] = centroid;
                         return <Label x={x} y={y}>{arc.data.letter}</Label>;
                     }}
                />
            </Group>
        </svg>
    );
}