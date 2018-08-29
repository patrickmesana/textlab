
import {isEmpty} from "lodash";

const shouldLogRendering = true;

const componentsToShow = ['documentPoints'];

function shouldShowLogsFrom(componentName) {
    if (isEmpty(componentsToShow))
        return true;

    return componentsToShow.includes(componentName);
}

export function logReactRender(componentName) {
    if (shouldLogRendering &&
        shouldShowLogsFrom(componentName)) {
        console.log(componentName);
    }
}