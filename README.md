# `vuex-api-util`

This util reduces boilerplate for API calls through VueX stores by providing some functions that generate state, mutations and runs actions.

## Why would you need this?

This library will be useful if 

* You are tired of writing boilerplate wiring in your components:

```vue
<template>
    <loading v-if="isLoading"></loading>
    <items v-if="!isLoading" :api-items="apiItems">...</items>
    <error v-if="!isLoading && apiError" :api-error="apiError">...</error>
</template>
<script>
export default{
    name: 'ItemList',
    data() {
        return {
            isLoading: false,
            apiItems: [],
            apiError: null
        }
    },
    methods() {
        async fetchItems() {
            try {
                const items = await this.$store.dispatch('fetchItems')
                this.apiItems = items
            } catch(err) {
                this.apiError = err
            }
        }
    }
}
</script>
```

* You are tired of manually wiring up API state in VueX.

## Installation

```
npm i vuex-api-util
```

## Usage and examples

> Before you go further, a word of caution: Please do not use this util for _every_ API call you make! It tries to automate 90% of use cases; not everything. For example, this util would not make sense for an action that would never be called from a UI. If there is no UI, how are you going to show pending spinners, etc.? Please evaluate each use case and use responsibly!

## Simple Demo

Here is the example repo: https://github.com/krishnagopinath/vuex-api-util-example

## More examples

> These examples have a lot of pseudo code and has not been tested. Read them to understand the API! **Read, parse and copy only the relevant bits**.

### Simple, one resource setup

#### Store setup

```js
import apiUtil from 'vuex-api-util'
 
const RESOURCE_API_STATE = 'resourceApi'
 
// Initialize store util to be used below
const resourceApiUtil = apiUtil(RESOURCE_API_STATE)
 
const state = {
    // other state
    // ....
    // Spread generated state here. 
    // For the namespace 'resourceApi', returns an object that looks like this:
    // {
    //   resourceApi: {
    //     requestStatus: 'not_started',
    //     data: null,
    //     error: null,
    //   }
    // }
    ...resourceApiUtil.state()
}

const mutations = {
    // other mutations
    // ....
    // Spread generated mutations here.
    // Mutations are just "glue" for the actions to update the state.
    // It is available, in case you would like to directly access the mutations.
    // For the namespace 'resourceApi', returns an object that looks like this:
    // {
    //     SET_RESOURCE_API: function(state, payload) {...}
    //     SET_RESOURCE_API_REQUEST_STATUS: function(state, payload) {...}
    //     SET_RESOURCE_API_ERROR: function(state, payload) {...}
    //     SET_RESOURCE_API_DATA: function(state, payload) {...}
    // }
    ...resourceApiUtil.mutations(),
}

const actions = {
    // other actions
    // .....
    async createResource(ctx, payload) {
        // The `runAction` fn takes in a callback, that MUST return a promise. It executes 
        // the callback, sets the right state and returns a response data or error. 
        // The callback takes no args, because `runAction` does not deal need to deal 
        // with payload params. It is the user's responsibility to use the "closure" to 
        // setup and run the api request within the callback.
        const resource = await resourceApiUtil.runAction(
            ctx,
            // This MUST return a promise!
            () => resourceApi.create(payload)
        )
        // At this point, api state could be used via getters in the components!
        // If you need to setup the returned state elsewhere, feel free!
        ctx.dispatch('setResource', resource);
    },
}

const getters = {
    // other getters
    // .....
    // Spread generated getters here.
    // Should be the ideal way of accessing resourceState, because accessing the 
    // state directly can be tedious. For the namespace 'resourceApi', returns an object 
    // that looks like this:
    // {
    //     resourceApi: function(state) {...},
    //     isResourceApiNotStarted: function(state) {...},
    //     isResourceApiPending: function(state) {...},
    //     isResourceApiSuccess: function(state) {...},
    //     isResourceApiError: function(state) {...},
    //     resourceApiStatus: function(state) {...},
    //     resourceApiData: function(state) {...},
    //     resourceApiError: function(state) {...},
    // }
    ...resourceApiUtil.getters()
}

// Store rollup code
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
```

#### Component usage

```vue
<template>
    <div v-if="resourceApiStatus === 'not_started'">Not created yet. Click 'Create' button!</div>
    <div v-if="resourceApiStatus === 'pending'">Loading...</div>
    <div v-if="resourceApiStatus === 'success'">
        <pre>{{JSON.stringify(resourceApiData, null, 2)}}</pre>
    </div>
    <div v-if="resourceApiStatus === 'error'">
        <pre>{{JSON.stringify(resourceApiError, null, 2)}}</pre>
    </div>
    <button v-click="handleCreateClick">Create Resource</button>
</template>
<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        // other component props
        // ...
        computed: {
            // other computed props
            // ...
            // Use created getters to access data
            mapGetters([
                'resourceApiData',
                'resourceApiError',
                'resourceApiStatus'
            ])
        },
        methods: {
            // other method props
            // ...
            mapActions(['createResource']),
            async handleCreateClick() {
                await this.createResource({ 
                    // resource data
                    // ..
                 })
            }
        }
    }
</script>
```

### Complex, multiple resource setup

This is where this utility hopes to shine. If a resource had multiple API verbs on the same page, eg. `GET`, `PUT`, this is how the setup would look like. A lot of code has been taken out; this is just to describe the general idea!

#### Store setup

```js
import apiUtil from 'vuex-api-util'
 
const resourceApiGet = apiUtil('resourceApiGet')
const resourceApiPut = apiUtil('resourceApiPut')

const state = {
    resource: null,
    ...resourceApiGet.state(),
    ...resourceApiPut.state()
}

const mutations = {
    ...resourceApiGet.mutations(),
    ...resourceApiPut.mutations(),
}

const getters = {
    ...resourceApiGet.getters(),
    ...resourceApiPut.getters(),
}

const actions = {
    async getResource(ctx, payload) {
        const resource = await resourceApiGet.runAction(
            ctx, 
            () => resourceApi.get(payload)
        )
        ctx.dispatch('setResource', resource);
    },
    async putResource(ctx, payload) {
        const resource = await resourceApiPut.runAction(
            ctx, 
            () => resourceApi.update(payload)
        )
        ctx.dispatch('setResource', resource);
    }
}

// Store rollup, etc
```

#### Component usage

You get the idea! All those getters would be available for you to use in the component. If the getters are hard to remember, use the state directly.

## Prior art

These articles served as inspiration for this utility:

* https://medium.com/@lachlanmiller_52885/reducing-vuex-boilerplate-for-ajax-calls-1cd4a74cef26
* https://medium.com/js-dojo/yet-another-pattern-for-api-calls-using-vuejs-vuex-b22ecdfb0ea2
* https://kentcdodds.com/blog/stop-using-isloading-booleans
