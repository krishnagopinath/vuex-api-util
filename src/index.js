import Vue from 'vue'

import { toSnakeCase, isFunction, isString, upperFirst, get } from './lib'

/**
 * An enum for request statuses
 */
const STATUSES = {
    NOT_STARTED: 'not_started',
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error',
}

/**
 * Creates custom mutation names, given a namespace
 *
 * @param {string} namespace
 */
function makeMutationNames(namespace) {
    const mutationMidName = toSnakeCase(namespace).toUpperCase()

    return {
        SET_FULL_STATE: `SET_${mutationMidName}`,
        SET_REQUEST_STATUS: `SET_${mutationMidName}_REQUEST_STATUS`,
        SET_DATA: `SET_${mutationMidName}_DATA`,
        SET_ERROR: `SET_${mutationMidName}_ERROR`,
    }
}

/**
 * Creates custom getter names, given a namespace
 *
 * @param {string} namespace
 */
function makeGetterNames(namespace) {
    const getterMidName = upperFirst(namespace)

    return {
        fullState: namespace,
        isNotStarted: `is${getterMidName}NotStarted`,
        isPending: `is${getterMidName}Pending`,
        isSuccess: `is${getterMidName}Success`,
        isError: `is${getterMidName}Error`,
        requestStatus: `${namespace}Status`,
        data: `${namespace}Data`,
        error: `${namespace}Error`,
    }
}

/**
 * Helper utility that reduces boilerplate for API calls through VueX stores.
 * Provides some functions that generate state, mutations and runs actions.
 *
 * @param {string} namespace - The namespace for the state, mutations & getters.
 */
export default function storeApiHelper(namespace) {
    if (!isString(namespace))
        throw new Error('`namespace` parameter must be a string')
    if (!namespace) throw new Error('`namespace` parameter must be valid')

    const mutationNames = makeMutationNames(namespace)
    const getterNames = makeGetterNames(namespace)

    return {
        /**
         * Sets up states for the API
         */
        state() {
            return {
                [namespace]: {
                    requestStatus: STATUSES.NOT_STARTED,
                    data: null,
                    error: null,
                },
            }
        },
        /**
         * Sets up mutations, with a special naming scheme based on namespace.
         *
         * If the namespace is `resourceApi`, creates the following mutations:
         *
         * ```
         * {
         *  SET_RESOURCE_API: function(state, payload) {...}
         *  SET_RESOURCE_API_REQUEST_STATUS: function(state, payload) {...}
         *  SET_RESOURCE_API_ERROR: function(state, payload) {...}
         *  SET_RESOURCE_API_DATA: function(state, payload) {...}
         * }
         * ```
         */
        mutations() {
            return {
                [mutationNames.SET_FULL_STATE](state, payload) {
                    Vue.set(state, namespace, payload)
                },
                [mutationNames.SET_REQUEST_STATUS](state, payload) {
                    Vue.set(state[namespace], 'requestStatus', payload)
                },
                [mutationNames.SET_ERROR](state, payload) {
                    Vue.set(state[namespace], 'error', payload)
                },
                [mutationNames.SET_DATA](state, payload) {
                    Vue.set(state[namespace], 'data', payload)
                },
            }
        },

        /**
         * Sets up mutations, with a special naming scheme based on namespace.
         *
         * For the namespace 'resourceApi', returns an object that looks like this:
         *
         * ```
         * {
         *  resourceApi: function(state) {...},
         *  isResourceApiNotStarted: function(state) {...},
         *  isResourceApiPending: function(state) {...},
         *  isResourceApiSuccess: function(state) {...},
         *  isResourceApiError: function(state) {...},
         *  resourceApiStatus: function(state) {...},
         *  resourceApiData: function(state) {...},
         *  resourceApiError: function(state) {...},
         * }
         * ```
         */
        getters() {
            return {
                [getterNames.fullState]: state => get(state, namespace),
                [getterNames.isNotStarted]: state => {
                    return (
                        get(state, [namespace, 'requestStatus']) ===
                        STATUSES.NOT_STARTED
                    )
                },
                [getterNames.isPending]: state =>
                    get(state, [namespace, 'requestStatus']) ===
                    STATUSES.PENDING,
                [getterNames.isSuccess]: state =>
                    get(state, [namespace, 'requestStatus']) ===
                    STATUSES.SUCCESS,
                [getterNames.isError]: state =>
                    get(state, [namespace, 'requestStatus']) === STATUSES.ERROR,
                [getterNames.requestStatus]: state =>
                    get(state, [namespace, 'requestStatus']),
                [getterNames.data]: state => get(state, [namespace, 'data']),
                [getterNames.error]: state => get(state, [namespace, 'error']),
            }
        },

        /**
         * Action runner that runs the callback and returns a promise
         * This runner commits statuses to the store and returns control to the action.
         *
         * @param {Object} context - VueX store context, that is passed along from the action; https://vuex.vuejs.org/api/#actions
         * @param {Function} asyncFn - Async function that could be used to perform API requests; this MUST return a promise.
         * @returns
         */
        runAction(context, asyncFn) {
            if (!isFunction(asyncFn))
                throw new Error('Invalid `asyncFn`; It must be a function.')

            const { commit } = context

            commit(mutationNames.SET_REQUEST_STATUS, STATUSES.PENDING)
            commit(mutationNames.SET_ERROR, null)
            commit(mutationNames.SET_DATA, null)

            return asyncFn()
                .then(response => {
                    commit(mutationNames.SET_REQUEST_STATUS, STATUSES.SUCCESS)
                    commit(mutationNames.SET_ERROR, null)
                    commit(mutationNames.SET_DATA, response || null)

                    return response
                })
                .catch(err => {
                    commit(mutationNames.SET_REQUEST_STATUS, STATUSES.ERROR)
                    commit(mutationNames.SET_ERROR, err || null)
                    commit(mutationNames.SET_DATA, null)

                    throw err
                })
        },
    }
}
