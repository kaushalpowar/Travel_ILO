const defaultPalettes = [
    [[255, 205, 45], [150, 10, 85], [140, 225, 100]],

    [[255, 205, 45], [251, 99, 111], [140, 225, 100], [150, 10, 85]],

    [[255, 205, 45], [251, 99, 111], [2, 84, 84], [140, 225, 100], [150, 10, 85],
        [203, 133, 170], [150, 36, 45]],

    [[255, 205, 45], [251, 99, 111], [2, 84, 84], [140, 225, 100], [150, 10, 85],
        [203, 133, 170], [150, 36, 45], [104, 58, 183], [152, 54, 178], [4, 147, 147], [255, 103, 31],
        [140, 140, 140], [255, 0, 0], [0, 102, 153]]
];

export const getColorPalette = function(amount, palettes = defaultPalettes){
    let index = 0;
    for(const palette of palettes){
        index++;
        if(palette.length < amount && index < palettes.length){
            continue;
        }

        const step = palette.length / amount;
        let offset = 0;
        const result = [];
        for(let i = 0; i < amount; i++){
            const position = i * step + offset;
            const s = Math.floor(position);
            let f = position - s;
            offset = 0;

            // if close enough to palette colour 'snap' to it.
            if(step >= 1){
                f = Math.round(f);
            }else{
                if(f < 0.5 * step){
                    offset = -0.5 * f;
                    f = 0;
                }else if(1 - f < 0.5 * step){
                    offset = 0.5 * (1 - f);
                    f = 1;
                }
            }
            if(s + 1 >= palette.length){
                result.push([
                    palette[s][0],
                    palette[s][1],
                    palette[s][2]
                ]);
            }else{
                result.push([
                    (1 - f) * palette[s][0] + f * palette[s + 1][0],
                    (1 - f) * palette[s][1] + f * palette[s + 1][1],
                    (1 - f) * palette[s][2] + f * palette[s + 1][2]
                ]);
            }
        }
        return result;
    }
};

export const getSectionPalette = (color, amount, alpha = false) => {
    const maxLightness = 10;
    // get numbers from hsl colorcode in array;
    const darkColor = color.match(/\((.*)\)/)[1].replaceAll('%', '').split(',').map(Number);
    const step = (maxLightness - (darkColor[2])) / parseInt(amount);

    const result = [];
    for(let i = 0; i < amount; i++){
        result.push('hsl' + (alpha ? 'a' : '') + '(' +
                darkColor[0] + ', ' + darkColor[1] + '%, ' + darkColor[2] + '%' +
                (alpha ? ', ' + alpha : '') + ')');
        darkColor[2] = darkColor[2] + step;
    }
    return result;
};
