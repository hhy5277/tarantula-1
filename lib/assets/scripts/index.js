'use strict'

//=require api/*.js
//=require components/*.js

Vue.use(VueMarkdown)

new Vue({
  el: '#app',

  components: {
    MenuNN,
    HeaderNN,
  },

  i18n: new VueI18n({locale: "default", messages: {default: i18n}}),

  template: `
    <v-app id="inspire">
      <MenuNN></MenuNN>
      <HeaderNN></HeaderNN>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>

    </v-app>
  `,

  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', name: 'home', component: Home },
      { path: '/stats', name: 'stats', component: Stats },
      { path: '/feedback', name: 'feedback', component: Feedback },
      { path: '/dashboard', name: 'dashboard', component: Dashboard },
      { path: '/project/:id/stats', name: 'projectStats', component: ProjectStats },
    ],
  }),

  // methods: {
  //   selected(v){
  //     this.$router.push({name: v})
  //   }
  // },

  // mounted(){
  //   this.$router.push({name: "dashboard"})
  // },

  data: () => ({
  }),

  props: {
    source: String
  }
})
