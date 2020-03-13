import storeApiUtil from '../src/index'

const badInputs = [null, undefined, 12, '', { a: 10 }]
const getInitialState = () => ({
    resourceApi: {
        requestStatus: 'not_started',
        data: null,
        error: null,
    },
})

const data = { a: 2 }
const error = new Error('Testing error')

test('namespace must be a string', () => {
    const expectedMessage = '`namespace` parameter must be a string'

    badInputs.forEach(input => {
        try {
            storeApiUtil(input)
        } catch (err) {
            expect(err.message).toEqual(expectedMessage)
        }
    })
})

test('initializes with expected properties', () => {
    const storeFns = storeApiUtil('resourceApi')

    expect(storeFns).toEqual(
        expect.objectContaining({
            getters: expect.any(Function),
            mutations: expect.any(Function),
            state: expect.any(Function),
            runAction: expect.any(Function),
        }),
    )
})

describe('state tests', () => {
    test('returns expected state', () => {
        const { state } = storeApiUtil('resourceApi')
        expect(state()).toMatchObject(getInitialState())
    })
})

describe('mutation tests', () => {
    test('returns expected mutations', () => {
        const { mutations } = storeApiUtil('resourceApi')

        expect(mutations()).toEqual(
            expect.objectContaining({
                SET_RESOURCE_API: expect.any(Function),
                SET_RESOURCE_API_REQUEST_STATUS: expect.any(Function),
                SET_RESOURCE_API_ERROR: expect.any(Function),
                SET_RESOURCE_API_DATA: expect.any(Function),
            }),
        )
    })

    test('SET_RESOURCE_API mutation updates state', () => {
        const { mutations } = storeApiUtil('resourceApi')

        const { SET_RESOURCE_API } = mutations()

        const state = { ...getInitialState() }
        const newState = { requestStatus: 'pending', data: null, error: null }
        SET_RESOURCE_API(state, newState)
        expect(state.resourceApi).toMatchObject(newState)
    })

    test('SET_RESOURCE_API_REQUEST_STATUS mutation updates state', () => {
        const { mutations } = storeApiUtil('resourceApi')

        const { SET_RESOURCE_API_REQUEST_STATUS } = mutations()

        const state = { ...getInitialState() }
        const newState = { requestStatus: 'pending', data: null, error: null }
        SET_RESOURCE_API_REQUEST_STATUS(state, newState.requestStatus)
        expect(state.resourceApi).toMatchObject(newState)
    })

    test('SET_RESOURCE_API_ERROR mutation updates state', () => {
        const { mutations } = storeApiUtil('resourceApi')

        const { SET_RESOURCE_API_ERROR } = mutations()

        const state = { ...getInitialState() }
        state.resourceApi.requestStatus = 'error'

        const newState = {
            requestStatus: 'error',
            data: null,
            error,
        }
        SET_RESOURCE_API_ERROR(state, newState.error)
        expect(state.resourceApi).toMatchObject(newState)
    })

    test('SET_RESOURCE_API_DATA mutation updates state', () => {
        const { mutations } = storeApiUtil('resourceApi')

        const { SET_RESOURCE_API_DATA } = mutations()

        const state = { ...getInitialState() }
        state.resourceApi.requestStatus = 'success'

        const newState = {
            requestStatus: 'success',
            data,
            error: null,
        }
        SET_RESOURCE_API_DATA(state, newState.data)
        expect(state.resourceApi).toMatchObject(newState)
    })
})

describe('getter tests', () => {
    test('returns expected getters', () => {
        const { getters } = storeApiUtil('resourceApi')

        expect(getters()).toEqual(
            expect.objectContaining({
                resourceApi: expect.any(Function),
                isResourceApiNotStarted: expect.any(Function),
                isResourceApiPending: expect.any(Function),
                isResourceApiSuccess: expect.any(Function),
                isResourceApiError: expect.any(Function),
                resourceApiStatus: expect.any(Function),
                resourceApiData: expect.any(Function),
                resourceApiError: expect.any(Function),
            }),
        )
    })

    test('resourceApi getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { resourceApi } = getters()

        expect(resourceApi(getInitialState())).toMatchObject(
            getInitialState().resourceApi,
        )
    })

    test('isResourceApiNotStarted getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { isResourceApiNotStarted } = getters()

        expect(isResourceApiNotStarted(getInitialState())).toBe(true)
    })

    test('isResourceApiPending getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { isResourceApiPending } = getters()

        const newState = getInitialState()
        newState.resourceApi.requestStatus = 'pending'
        expect(isResourceApiPending(newState)).toBe(true)
    })

    test('isResourceApiSuccess getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { isResourceApiSuccess } = getters()

        const newState = getInitialState()
        newState.resourceApi.requestStatus = 'success'
        expect(isResourceApiSuccess(newState)).toBe(true)
    })

    test('isResourceApiError getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { isResourceApiError } = getters()

        const newState = getInitialState()
        newState.resourceApi.requestStatus = 'error'
        expect(isResourceApiError(newState)).toBe(true)
    })

    test('resourceApiStatus getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { resourceApiStatus } = getters()

        expect(resourceApiStatus(getInitialState())).toBe(
            getInitialState().resourceApi.requestStatus,
        )
    })

    test('resourceApiData getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { resourceApiData } = getters()

        const newState = getInitialState()
        newState.resourceApi.requestStatus = 'done'
        newState.resourceApi.data = { a: 2 }

        expect(resourceApiData(newState)).toMatchObject(
            newState.resourceApi.data,
        )
    })

    test('resourceApiError getter returns expected data', () => {
        const { getters } = storeApiUtil('resourceApi')
        const { resourceApiError } = getters()

        const newState = getInitialState()
        newState.resourceApi.requestStatus = 'error'
        newState.resourceApi.error = error

        expect(resourceApiError(newState)).toEqual(newState.resourceApi.error)
    })
})

describe('runAction tests', () => {
    test('runAction must receive a fn', () => {
        const expectedMessage = 'Invalid `asyncFn`; It must be a function.'

        const { runAction } = storeApiUtil('resourceApi')
        badInputs.forEach(input => {
            try {
                runAction({}, input)
            } catch (err) {
                expect(err.message).toEqual(expectedMessage)
            }
        })
    })

    test('runAction calls expected mutations during success', () => {
        const commit = jest.fn()

        const { runAction } = storeApiUtil('resourceApi')

        const asyncFn = () =>
            new Promise(resolve => {
                resolve(data)
            })

        return runAction({ commit }, asyncFn).then(response => {
            expect(response).toMatchObject(data)

            expect(commit).toHaveBeenCalledTimes(6)
            expect(commit).toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'pending',
            )
            expect(commit).toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'success',
            )
            expect(commit).toHaveBeenCalledWith('SET_RESOURCE_API_ERROR', null)
            expect(commit).toHaveBeenCalledWith('SET_RESOURCE_API_DATA', data)
            expect(commit).not.toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'error',
            )
        })
    })

    test('runAction calls expected mutations during error', () => {
        const commit = jest.fn()

        const { runAction } = storeApiUtil('resourceApi')

        const asyncFn = () =>
            new Promise((resolve, reject) => {
                reject(error)
            })

        return runAction({ commit }, asyncFn).catch(err => {
            expect(err).toMatchObject(err)

            expect(commit).toHaveBeenCalledTimes(6)
            expect(commit).toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'pending',
            )
            expect(commit).toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'error',
            )
            expect(commit).toHaveBeenCalledWith('SET_RESOURCE_API_ERROR', error)
            expect(commit).toHaveBeenCalledWith('SET_RESOURCE_API_DATA', null)
            expect(commit).not.toHaveBeenCalledWith(
                'SET_RESOURCE_API_REQUEST_STATUS',
                'success',
            )
        })
    })
})
