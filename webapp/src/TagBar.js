import React from 'react';
import Chip from 'material-ui/Chip';
import { connect } from 'react-redux';
import { tagWordsChanged } from './DistributionExplorer-redux'
import {extend, filter} from "lodash";
import {TextField} from "material-ui";
import {withState} from "recompose";
const styles = {
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    wrapper2: {
        display: 'inline-block',
    }

};

const handleRequestDelete = (chips, word) => {
    return filter(chips, (chip) => chip !== word);
};

export default ({tagWords, tagWordsChanged, width, height}) => {
            return <div style={{textAlign:"left"}}>
                <div style={styles.wrapper2}>

                {tagWords.map((word) =>
                    <div key={word} style={styles.wrapper2}>
                        <Chip

                                onRequestDelete={() => tagWordsChanged(handleRequestDelete(tagWords, word))}
                            style={styles.chip}
                        >
                            {word}
                        </Chip>
                    </div>
                )}
                </div>
            </div>
        };