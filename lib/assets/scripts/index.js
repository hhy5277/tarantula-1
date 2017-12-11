'use strict'

//=require api/*.js
//=require components/*.js

// Vue.use(Notify)
Vue.use(VueMarkdown)

const router = new VueRouter({
  //base: "/",
  mode: 'history',
  routes: [
    { path: '/stats', name: 'stats', component: Stats },
    { path: '/feedback', name: 'feedback', component: Feedback },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/project/:id/stats', name: 'projectStats', component: ProjectStats },
    { path: '/project/:id/table', name: 'projectTable', component: ProjectTable },
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

  i18n: new VueI18n({locale: "default", messages: {default: i18n}}),

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

  router: router,

  data: () => ({
  }),

  methods: {
  },

  metaInfo: {
    titleTemplate: '%s - Tarantula',
  },
})
