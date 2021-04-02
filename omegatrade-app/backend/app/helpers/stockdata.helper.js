const { Spanner } = require('@google-cloud/spanner')

/**
* Returns a Spanner numeric Object.
*/
const spannerNumericRandVal = (value) => {
    return Spanner.numeric(value.toString());
}

/**
 * Returns a random number between min (inclusive) and max (inclusive)
 */
const spannerNumericRandValBetween = (min, max, scale = null) => {
    const rand = Math.random() * (max - min) + min;
    if (scale) {
        const power = Math.pow(10, scale);
        return Spanner.numeric((Math.floor(rand * power) / power).toString());
    }
    return Spanner.numeric(Math.floor(rand).toString());
}

/**
 * Returns a random Integer number if @min and @max passed in parameter,
 * Returns a Random Number with two Decimal points if no parameter passed.
 */
const generateRandomValue = (min = null, max = null) => {
    if (min && max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    return Math.floor(Math.random() * 100) / 100;
}

module.exports = {
    spannerNumericRandVal,
    spannerNumericRandValBetween,
    generateRandomValue,
};