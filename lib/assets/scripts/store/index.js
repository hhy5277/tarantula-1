'use strict'

const VUEX_TYPES_PROJECTS                 = "PROJECTS"
const VUEX_TYPES_PROJECT_SELECTED         = "PROJECT_SELECTED"
const VUEX_TYPES_PROJECT_MERGE            = "PROJECT_MERGE"
const VUEX_TYPES_PROJECT_TOGGLE_STATUS    = "PROJECT_TOGGLE_STATUS"
const VUEX_TYPES_PROJECT_DELETE           = "VUEX_TYPES_PROJECT_DELETE"


//=require modules/*.js

const store = new Vuex.Store({
  state: {
  },
  // actions,
  // getters,
  modules: {
    projects: ProjectStore
    // Services,
    // Images,
  },
  strict: true,
  // plugins: debug ? [createLogger()] : []
})
