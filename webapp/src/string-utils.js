export function breakInputIntoListOfWords(input) {
    return input.replace(/\s/g, '').split('+');
}