/**
 * Is this a function or not?
 * @param {*} fn
 */
export const isFunction = fn => {
    return fn && {}.toString.call(fn) === '[object Function]'
}

/**
 * Mimics lodash's get method functionality
 *
 * @param {*} obj
 * @param {*} path
 * @param {*} defaultValue
 */
export const get = (obj, path, defaultValue) => {
    const travel = regexp =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce(
                (res, key) =>
                    res !== null && res !== undefined ? res[key] : res,
                obj,
            )
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
    return result === undefined || result === obj ? defaultValue : result
}

/**
 * Checks if passed in param is a string
 * @param {*} str
 */
export const isString = str => {
    if (str && typeof str.valueOf() === 'string') {
        return true
    }
    return false
}

/**
 * Convert string to snake_case
 * @param {*} str
 */
export const toSnakeCase = str => {
    if (!isString(str)) return str

    return str
        .match(
            /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
        )
        .map(x => x.toLowerCase())
        .join('_')
}

/**
 * 'hello' => 'Hello'
 * @param {*} str
 */
export const upperFirst = str => {
    if (!isString(str)) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}
