import * as React from "react";
import {map, sortBy} from 'lodash';
import {onlyUpdateForKeys} from "recompose";
import {logReactRender} from "./logs";

const enhance = onlyUpdateForKeys(['documents', 'metas']);
export default enhance(({documents, metas, colorScale, orderedBy}) => {
    logReactRender('documentList');
    let augmentedDocuments_ = map(documents, (doc, i) => ({ content: doc, meta: metas.metas[i], metaIndex: metas.indexes[i]}));

    let augmentedDocuments = orderedBy ? augmentedDocuments_.sort(orderedBy.order)
        : augmentedDocuments_;


    return <div style={{listStyle: "none"}}>
        {
            augmentedDocuments.map((doc, i) =>
                <div key={`lense-doc-${i}`}>
                    <span style={{fontWeight:"bold", color:colorScale(doc.meta)}}>{doc.meta}</span>
                    <span> (i={doc.metaIndex}) </span>
                    <span> - </span>
                    <span>{doc.content}</span></div>
            )
        }

    </div>
})