const ProjectStore = {
  state: {
    items: null,

    selectedIndex: -1
  },

  getters: {
    dashbordProjects: (state) => {
      return state.items
    },

    selectedProject: (state) => {
      return _.get(state.items, state.selectedIndex)
    }
  },

  actions: {
    actionGetProjects({commit, dispatch}, params){
      return fetchProject().then((r) => {
        commit(VUEX_TYPES_PROJECTS, r)
      })
    },

    actionStartProject({commit, dispatch}, {index, item}){
      commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'play'})

      return startProject(item.id).then((r) => {
        if (r.status != 0){
          throw {message: r.message}
        }

        commit(VUEX_TYPES_PROJECT_MERGE, {index, data: r.data})
      }).finally(() => {
        commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'play'})
      })
    },

    actionSelectProject({commit, dispatch}, i){
      commit(VUEX_TYPES_PROJECT_SELECTED, i)
    },

    actionDeleteProject({commit, dispatch, state, getters}){
      const index = state.selectedIndex

      commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'delete'})
      return deleteProject(getters.selectedProject.id).then(({status, message}) => {
        if (status != 0){
          throw {message}
        }

        commit(VUEX_TYPES_PROJECT_DELETE, index)
      }).catch((e) => {
        commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'delete'})

        throw e
      })
    },

    actionResetProject({commit, dispatch, state, getters}, {index, item}){
      commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'undo'})
      return resetProject(item.id).finally(() => {
        commit(VUEX_TYPES_PROJECT_TOGGLE_STATUS, {index, key: 'undo'})
      })
    }
  },

  mutations: {
    [VUEX_TYPES_PROJECTS](state, projects){
      state.items = _.chain(projects).map((n) => {
        return _.merge({
          control: [
            {
              key: 'cron',
              icon: "alarm",
              title: "dashboard.btnCron",
              disabled: true,
              isHidden: !n.cron,
            },
            {
              key: 'play',
              icon: "fa-play",
              title: "dashboard.btnPlay",
              // click: vm.clickProjectPlay
            },
            {
              key: 'table',
              icon: "fa-table",
              title: "dashboard.btnTable",
              // click: vm.clickProjectTable
            },
            {
              key: 'chart',
              icon: "fa-bar-chart",
              title: "dashboard.btnStats",
              // click: vm.clickProjectStats
            },
            {
              key: 'reset',
              icon: "fa-undo",
              title: "dashboard.btnReset",
              // click: vm.clickProjectReset,
            },
            {
              key: 'delete',
              icon: "fa-trash-o",
              title: "dashboard.btnDelete",
              // click: vm.clickDeleteButton
            }
          ]
        }, n)
      }).value()
    },

    [VUEX_TYPES_PROJECT_SELECTED](state, index){
      state.selectedIndex = index
    },

    [VUEX_TYPES_PROJECT_MERGE](state, {index, data}){
      _.merge(state.items[index], data)
    },

    [VUEX_TYPES_PROJECT_TOGGLE_STATUS](state, {index, key}){
      const n = _.find(_.get(state.items, `${index}.control`), (n) => n.key == key)
      if (!n){
        return
      }

      state.items.splice(index, _.merge(n, {
        disabled: !n.disabled
      }))
    },

    [VUEX_TYPES_PROJECT_DELETE](state, index){
      state.items.splice(index, 1)
    }
  }
}
