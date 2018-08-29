import React from "react";
import {withState} from "recompose";
import {TextField} from "material-ui";
import {breakInputIntoListOfWords} from "./string-utils";

const enhance = withState('temporaryWord', 'setTemporaryWord', "");

export const TagInputField = enhance(({temporaryWord, setTemporaryWord, onAddTag, width, hintText, disabled}) => {
    return  <TextField style={{width:width}}
                                      value={temporaryWord}
                       disabled={disabled}
                                      hintText={hintText}
                                      onChange={(event, newValue) => {
                                          setTemporaryWord(newValue);
                                      }}
                                      onKeyPress={(event) => {
                                          if (event.key === 'Enter') {
                                              onAddTag(breakInputIntoListOfWords(temporaryWord));
                                              setTemporaryWord("");
                                          }
                                      }}
    />
});