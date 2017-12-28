import * as types from "../types"
import {
  fetchProject,
  startProject,
  fetchProjectMessage,
  fetchProjectStats,
  fetchProjectData,
  resetProject
} from "../../api"

export default {
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
        commit(types.PROJECTS, r)
      })
    },

    actionStartProject({commit, dispatch}, {index, item}){
      commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'play'})

      return startProject(item.id).then((r) => {
        if (r.status != 0){
          throw {message: r.message}
        }

        commit(types.PROJECT_MERGE, {index, data: r.data})
      }).finally(() => {
        commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'play'})
      })
    },

    actionSelectProject({commit, dispatch}, i){
      commit(types.PROJECT_SELECTED, i)
    },

    actionDeleteProject({commit, dispatch, state, getters}){
      const index = state.selectedIndex

      commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'delete'})
      return deleteProject(getters.selectedProject.id).then(({status, message}) => {
        if (status != 0){
          throw {message}
        }

        commit(types.PROJECT_DELETE, index)
      }).catch((e) => {
        commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'delete'})

        throw e
      })
    },

    actionResetProject({commit, dispatch, state, getters}, {index, item}){
      commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'reset'})
      return resetProject(item.id).finally(() => {
        commit(types.PROJECT_TOGGLE_STATUS, {index, key: 'reset'})
      })
    },

    async actionGetMessage({commit, dispatch, getters}){
      const r = await Promise.all(_.map(getters.dashbordProjects, async (item) => {
        const { messages } = await fetchProjectMessage(item.id)

        return _.map(messages, (n) => {
          return _.merge(n, {
            name: item.name,
            "@createdAt": moment(n['@createdAt'], "x").format("YYYY-MM-DD HH:mm:ss")
          })
        })
      }))

      return _.flatten(r)
    },

    actionGetProjectStats({commit, dispatch}, id){
      return fetchProjectStats(id)
    },
  },

  mutations: {
    [types.PROJECTS](state, projects){
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
            },
            {
              key: 'chart',
              icon: "fa-bar-chart",
              title: "dashboard.btnStats",
            },
            {
              key: 'reset',
              icon: "fa-undo",
              title: "dashboard.btnReset",
            },
            {
              key: 'delete',
              icon: "fa-trash-o",
              title: "dashboard.btnDelete",
            }
          ]
        }, n)
      }).value()
    },

    [types.PROJECT_SELECTED](state, index){
      state.selectedIndex = index
    },

    [types.PROJECT_MERGE](state, {index, data}){
      _.merge(state.items[index], data)
    },

    [types.PROJECT_TOGGLE_STATUS](state, {index, key}){
      const n = _.find(_.get(state.items, `${index}.control`), (n) => n.key == key)
      if (!n){
        return
      }

      state.items.splice(index, _.merge(n, {
        disabled: !n.disabled
      }))
    },

    [types.PROJECT_DELETE](state, index){
      state.items.splice(index, 1)
    }
  }
}
