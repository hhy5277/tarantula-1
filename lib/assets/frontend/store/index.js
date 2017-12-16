'use strict'

import ProjectStore from "./modules/project"

export default new Vuex.Store({
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
