import React from 'react';
import { Group } from '@vx/group';
import { GlyphCircle } from '@vx/glyph';
import { scaleLinear } from '@vx/scale';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { extent } from 'd3-array'
import tinycolor from 'tinycolor2'
import {map, uniq, reduce, isEmpty, orderBy} from "lodash";

import {compose, mapProps, onlyUpdateForKeys, withHandlers, withState, shallowEqual, shouldUpdate} from "recompose";
import {LegendOrdinal} from "@vx/legend";
import {conv_margin} from "./constants";
import {logReactRender} from "./logs";



function getRelativeCursorPos(event) {
    let svgEl = event.target.closest('svg');
    const cursorRelLeft = event.clientX - svgEl.getBoundingClientRect().left;
    const cursorRelTop = event.clientY - svgEl.getBoundingClientRect().top;
    return {x:cursorRelLeft, y:cursorRelTop};
}


let tooltipTimeout;

let levelColorConversion = {
    1: "orange",
    0: "lightgrey"
};


const docPointEnhance = shouldUpdate((props, nextProps) => {
    return props.fill !== nextProps.fill ||
        props.left !== nextProps.left ||
        props.top !== nextProps.top;
});

const DocPoint = docPointEnhance(({key, fill, left, top, onMouseEnter, onMouseLeave }) => {
    return <circle
        style={{
            pointerEvents: "all"
        }}
        key={key}
        fill={fill}
        r={2}
        cx={left}
        cy={top}
        onMouseEnter={onMouseEnter
        }
        onMouseLeave={onMouseLeave}
    />
});


const docPointsEnhance = compose(
    shouldUpdate((props, nextProps) => {
        return !shallowEqual(nextProps.xScaleParams, props.xScaleParams) ||
            !shallowEqual(nextProps.yScaleParams, props.yScaleParams) ||
            nextProps.points !== props.points ||
            nextProps.metas !== props.metas ||
            nextProps.levels !== props.levels ||
            nextProps.levelEnabled !== props.levelEnabled;
    }),
    mapProps(({points, metas, corpusCounted, levels, onMouseEnterPoint, onMouseLeavePoint,
                  levelEnabled, xScaleParams, yScaleParams, zScale, x, y}) => {

        let augmentedPoints = map(points, (aPoint, i) => ({
            coords:aPoint,
            level:levels[i],
            meta:metas[i],
            index:i,
            isShort:true,//corpusCounted[i].length < 5 ,
            onMouseEnter: event => onMouseEnterPoint(aPoint, i, event),
            onMouseLeave: event => onMouseLeavePoint(aPoint, i, event)
        }));

        // augmentedPoints = orderBy(augmentedPoints, 'isShort');
        // augmentedPoints = orderBy(augmentedPoints, 'meta');

        if (levelEnabled) {
            augmentedPoints = orderBy(augmentedPoints, 'level');
        }

        return {
            augmentedPoints,
            xScale:buildXScale(xScaleParams),
            yScale:buildYScale(yScaleParams),
            zScale, x, y, levelEnabled
        };
    })
);
const DocPoints = docPointsEnhance(
    ({augmentedPoints, xScale, yScale, zScale, x, y, levelEnabled}) => {
    logReactRender('documentPoints');

    const fill = (level, meta, isShort) => {
        if (!isShort && !levelEnabled) {
            return 'white';
        }
        if (meta === -1) {
            return 'lightgrey';
        }
        return levelEnabled?
            levelColorConversion[level]:
            zScale(meta);
    };

    return  <Group>
        {augmentedPoints.map((point, i) => {
            return (
                <DocPoint
                    key={`point-${point.coords.x}-${i}`}
                    fill={fill(point.level, point.meta, point.isShort)}
                    left={xScale(x(point.coords))}
                    top={yScale(y(point.coords))}
                    onMouseEnter={point.onMouseEnter}
                    onMouseLeave={point.onMouseLeave}
                />
            );
        })}
    </Group>
});

const enhanceLegend = onlyUpdateForKeys(['zScale']);
const PointsLegend = enhanceLegend(({zScale}) => {
    return <LegendOrdinal
        scale={zScale}
        direction="column"
        labelMargin="0 15px 0 0"
    />
});

const legendWidth = 200;
const pointsMarginSides = 100;

function getRange(focus, max, zoom, isInverse) {
    let a1 = 0 - (zoom-1) * max / 2 + focus * zoom;
    let a2 = (max * zoom)  - (zoom-1) * max / 2 + focus * zoom;
    if (!isInverse) {
        return [a1, a2];
    }
    else{
        return [a2, a1];
    }
}


function buildXScaleParams(xRange, max, zoomFactor=1, focus=0){
    let domain = xRange,
        range= getRange(focus, max, zoomFactor, false);
    return {
        domainA: domain[0],
        domainB: domain[1],
        rangeA: range[0],
        rangeB: range[1],
        clamp: true
    }
}

function buildXScale({domainA, domainB, rangeA, rangeB, clamp}) {
    return scaleLinear({
        domain: [domainA, domainB],
        range: [rangeA, rangeB],
        clamp
    });
}


function buildYScaleParams(yRange, max, zoomFactor=1, focus=0){
    let domain= yRange,
        range= getRange(focus, max, zoomFactor, true);
    return {
        domainA: domain[0],
        domainB: domain[1],
        rangeA: range[0],
        rangeB: range[1],
        clamp: true
    };
}

function buildYScale({domainA, domainB, rangeA, rangeB, clamp}) {
    return scaleLinear({
        domain: [domainA, domainB],
        range: [rangeA, rangeB],
        clamp
    });
}

const buildWidth = (proposedWidth) => proposedWidth - 2 * pointsMarginSides -legendWidth;
const buildHeight = (proposedWidth) => proposedWidth - 2 * pointsMarginSides -legendWidth;
const buildXRange = (points, x) => extent(points.map(x));
const buildYRange = (points, y) => extent(points.map(y));
const buildXFactor = (xRange, width) => width / Math.abs(xRange[0] - xRange[1]);

const enhance = compose(
    withState('lenseDragged', 'setLenseDragged', false),
    withState('zoomFactor', 'setZoomFactor', 1),
    withState('focusPoint', 'setFocusPoint', {x:0, y:0}),
    mapProps(({proposedWidth, proposedHeight, points, x, y, zoomFactor, focusPoint, ...rest}) => {

            let width = buildWidth(proposedWidth);
            let height= buildHeight(proposedHeight);
            let xRange= buildXRange(points, x);
            let yRange= buildYRange(points, y);

            let xScaleParams= buildXScaleParams(xRange, width, zoomFactor, focusPoint.x);
            let yScaleParams = buildYScaleParams(yRange, height, zoomFactor, focusPoint.y);
            let xFactor = buildXFactor(xRange, width);

            return  {
                width,
                height,
                xRange,
                yRange,
                xScaleParams,
                yScaleParams,
                xFactor,
                points,
                x,
                y,
                zoomFactor,
                ...rest
            };

    }),
    withHandlers({
        onZoomIn: ({setZoomFactor}) => event => {
            setZoomFactor(2);
        },
        onZoomOut:  ({setZoomFactor, setFocusPoint
                     }) => event => {
            setZoomFactor(1);
            setFocusPoint({x:0, y:0});
        },
        onFocus: ({setFocusPoint, lensePosition, xFactor}) => event => {

            let movingVector = {x:-(lensePosition.x - 0) * xFactor, y: (lensePosition.y - 0)  * xFactor};
            setFocusPoint(movingVector);
        }
    })
);
export default enhance(withTooltip(({
                                        hideTooltip,
                                        showTooltip,
                                        tooltipOpen,
                                        tooltipLeft,
                                        tooltipTop,
                                        tooltipData,
                                        points,
                                        corpus,
                                        corpusCounted,
                                        metas,
                                        levels,
                                        lenseDragged, setLenseDragged,
                                        lensePosition, lenseRadius, onLenseEvent,
                                        zoomFactor,
                                        zScale,
                                        x, y,
                                        lenseEnabled,
                                        legendEnabled,
                                        levelEnabled,
                                        xScaleParams, yScaleParams,
                                        onZoomIn,
                                        onZoomOut,
                                        onFocus,
    xFactor,
    width, height
}) => {
    logReactRender('points');


    let cR = lenseRadius;
    const ellipseRadiusCoords = {w:cR * xFactor, h:cR * xFactor};

    let xScale = buildXScale(xScaleParams), yScale = buildYScale(yScaleParams)

    return (
        <div style={{ textAlign:"center"}}
>
            <div
                style={{
                    width:legendWidth,
                    display:"inline-block",
                    verticalAlign:"top",
                    fontSize: '14px',
                    maxHeight: height,
                    overflow: 'hidden'
                }}
            >

                {legendEnabled && <PointsLegend zScale={zScale}/>}
            </div>
            <div style={{position:"absolute", top:0, left:legendWidth+conv_margin}}>
                <button onClick={onZoomIn}><span className="fa fa-plus-circle"/></button>
                <button onClick={onZoomOut}><span className="fa fa-minus-circle"/></button>
                <button onClick={onFocus}><span className="fa fa-dot-circle-o"/></button>
            </div>
            <div style={{
                display:"inline-block",
                verticalAlign:"top",
                userSelect: "none",
            }}>
                <svg
                    width={width}
                    height={height}
                    style={{marginRight:pointsMarginSides, marginLeft:pointsMarginSides}}

                 onMouseMove={ event => {
                     if(!lenseEnabled) return;
                     event.preventDefault();
                     if(lenseDragged) {
                         let curPos = getRelativeCursorPos(event);
                         let cPos = {x: xScale.invert(curPos.x), y: yScale.invert(curPos.y)};
                         onLenseEvent({
                             position: cPos,
                             radius:cR,
                             event:'mouseMove'
                         });
                     }
                 }}
                 onMouseUp={ event => {
                     if(!lenseEnabled) return;
                     event.preventDefault();
                     if(lenseDragged) {
                         setLenseDragged(false);
                         let curPos = getRelativeCursorPos(event);
                         let cPos = {x: xScale.invert(curPos.x), y: yScale.invert(curPos.y)};
                         onLenseEvent({
                             position: cPos,
                             radius:cR,
                             event:'mouseUp'
                         });

                     }
                 }}
                 onDoubleClick={ event => {
                     if(!lenseEnabled) return;
                     event.preventDefault();
                     event.stopPropagation();
                     event.nativeEvent.stopImmediatePropagation();
                     let curPos = getRelativeCursorPos(event);
                     let cPos = {x: xScale.invert(curPos.x), y: yScale.invert(curPos.y)};
                     onLenseEvent({
                         position: cPos,
                         radius:cR,
                         event:'doubleClick'
                     });
                 } }
            >


                <DocPoints
                   xScaleParams={xScaleParams}
                   yScaleParams={yScaleParams}
                   zScale={zScale}
                   onMouseEnterPoint={(point, i, event)  => {
                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                       let curPos = getRelativeCursorPos(event);
                       showTooltip({
                           tooltipLeft: curPos.x,
                           tooltipTop: curPos.y,
                           tooltipData: {docIndex:i, docMeta:metas[i], x:x(point), y:y(point) }
                       });
                   }}
                   onMouseLeavePoint={() => {
                       tooltipTimeout = setTimeout(() => {
                           hideTooltip();
                       }, 200);
                   }}
                   points={points}
                   metas={metas}
                   corpusCounted={corpusCounted}
                   levels={levels}
                   levelEnabled={levelEnabled}
                   x={x} y={y}
               />
                    {lenseEnabled && <ellipse cx={xScale(lensePosition.x)}
                                               cy={yScale(lensePosition.y)}
                                               rx={ellipseRadiusCoords.w * zoomFactor}
                                               ry={ellipseRadiusCoords.h * zoomFactor}
                                               fill="blue"
                                               opacity="0.25"
                                               onMouseDown={ (event) => {
                                                   event.preventDefault();
                                                   setLenseDragged(true);
                                               } }

                    />}
            </svg>

            </div>
            {tooltipOpen &&
                <div style={{
                    verticalAlign: "top",
                    pointerEvents: "none",
                    userSelect: "none",
                    top:tooltipTop  - 75 ,
                    left:tooltipLeft  + pointsMarginSides - 20,
                    position:"absolute",
                    width:200,
                    height:55,
                    border: "2px solid black",
                    borderRadius: 5,
                    padding: 5,
                    backgroundColor: "white"

                }}>
                    <div style={{
                        maxWidth:1000,
                        textOverflow:"ellipsis",
                        overflow:"hidden",
                        fontSize:12,
                        height:40,
                        textAlign:"left"
                    }}>
                            {corpus[tooltipData.docIndex]}
                    </div>
                    <div style={{marginTop:0}}>
                        <strong style={{fontSize:14}}>
                            {tooltipData.docMeta}
                        </strong>
                    </div>
                </div>}
        </div>
    );
}));