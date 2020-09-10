const crypto = require('crypto');

/**
 * provides build methods to build thumbor urls with or without hmac security
 */
class Thurl {

    /**
     *
     * @param {String} [url=null] - Base thumbor url to build upon
     * @param {String} [key=null] - Thumbor secret key for hmac security
     */
    constructor(url = null, key = null) {
        this.url = url;
        this.key = key;
    }

    /**
     * creates a hmac string from a url input
     * @param url
     * @returns {string}
     */
    hmac(url) {
        return crypto.createHmac('sha1', this.key).update(url).digest('base64').replace(/\+/g, '-').replace(/\//g, '_');

    }

    /**
     * Converts filter properties to a filters url segment
     * @param {Object} filters
     * example filters:
     * @param {String|Array} filters.blur - Blur filter with properties e.g. blur: '3,2' or blur: [3,2]
     * @param {String|Array} filters.grayscale - Grayscale filter requires no properties e.g. grayscale: '' or grayscale: []
     * see the full documentation at https://thumbor.readthedocs.io/en/latest/usage.html
     * @returns {String} - filters url segment
     */
    buildFilters(filters) {
        let filtersArray = Object.keys(filters).map(f =>
            `${f}(${Array.isArray(filters[f]) ? filters[f].join(',') : filters[f]})`
        );
        return filtersArray.length ? `/filters:${filtersArray.join(':')}` : '';
    }

    /**
     * Converts an adjustments object to an adjustments url segment
     * see the full documentation at https://thumbor.readthedocs.io/en/latest/usage.html
     *
     * @param {Object} adjustments - Adjustments to be applied to the image
     * @param {Boolean} [adjustments.trim=false]
     * @param {crop} [adjustments.crop=null]
     * @param {Number} [adjustments.crop.left]
     * @param {Number} [adjustments.crop.top]
     * @param {Number} [adjustments.crop.right]
     * @param {Number} [adjustments.crop.bottom]
     * @param {String} [adjustments.fit]
     * @param {Number} [adjustments.width]
     * @param {Number} [adjustments.height]
     * @param {String} [adjustments.halign]
     * @param {String} [adjustments.valign]
     * @param {Boolean} [adjustments.smart]
     * @param {Array|String} [adjustments.<filter name>] - Filter name with properties e.g. blur: '3,2' or blur: [3,2]
     *
     * @returns {string} - Adjustments url segment
     */
    buildAdjustments(adjustments) {
        if (!adjustments) return '';
        const {
            trim = false,
            crop = null,
            fit = null,
            width = null,
            height = null,
            halign = null,
            valign = null,
            smart = false,
            ...filters // blur: [0,3] / blur: '0,3' / blur: 3
        } = adjustments;

        let adjustmentsUrl = `/
            ${trim ? 'trim' : ''}/
            ${crop ? `${crop.left}x${crop.top}:${crop.right}x${crop.bottom}` : ''}/
            ${fit ? fit : ''}/
            ${width || height ? `${width || ''}x${height || ''}` : ''}/
            ${halign || ''}/
            ${valign || ''}/
            ${smart ? 'smart' : ''}/
            ${filters ? this.buildFilters(filters) : ''}/
        `;

        return adjustmentsUrl
            .replace(/\s|\n/g, '')
            .replace(/\/{2,}/g, '/')
            .replace(/^\//g, '');
    }

    /**
     * Builds a thumbor string from the given image and adjustments
     * @param image
     * @param adjustments
     * @returns {string}
     */
    build(image, adjustments = null) {
        const thumborUrl = this.url;
        const adjustmentsUrl = this.buildAdjustments(adjustments);
        const imageUrl = `${adjustmentsUrl}${image}`;
        const hmac = this.key ? this.hmac(imageUrl) : 'unsafe';
        return `${thumborUrl}/${hmac}/${imageUrl}`
    }
}

module.exports = Thurl;