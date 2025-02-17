export const formatStringToTitleCase = (phrase) => {
    if(!phrase || typeof phrase !== 'string'){
        return phrase;
    }

    return phrase
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('-');
};

export const removeTrailingCharacters = (string) => string.replace(/[A-Za-z]+$/, '');
