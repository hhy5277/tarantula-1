<script>

import "./components/i18n"

import Feedback from './components/feedback'
import Message from './components/message'
import Dashboard from './components/dashboard'
import Node from './components/node'
import ProjectStats from './components/projectStats'
import Download from './components/download'

import Menu from "./components/menu"
import Header from "./components/header"
import Nofity from "./components/notify"

import store from "./store"

import { mapActions, mapGetters } from 'vuex'

// Vue.use(Notify)
Vue.use(VueMarkdown)

const router = new VueRouter({
  //base: "/",
  mode: 'history',
  routes: [
    { path: '/feedback', name: 'feedback', component: Feedback },
    { path: '/message', name: 'message', component: Message },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/node', name: 'node', component: Node },
    { path: '/download', name: 'download', component: Download },
    { path: '/project/:id/stats', name: 'projectStats', component: ProjectStats },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.path == "/"){
    next("/dashboard")
    return
  }

  next()
})

new Vue({
  el: '#app',

  components: {
    "t-menu": Menu,
    "t-header": Header,
    "t-nofity": Nofity,
  },

  template: `
    <v-app id="inspire">
      <t-menu></t-menu>
      <t-header></t-header>
      <transition name="fade" mode="out-in" transition="scale-transition">
        <router-view></router-view>
      </transition>

      <t-nofity />
    </v-app>
  `,

  router,
  store,

  data: () => ({
  }),

  methods: {
    ...mapActions(['actionGetProjects']),
  },

  metaInfo: {
    titleTemplate: '%s - Tarantula',
  },

  created(){
    this.actionGetProjects()
  }
})
</script>
