'use strict'

//=require components/*.js

new Vue({
  el: '#app',

  components: {
    Feedback,
    MenuNN,
    HeaderNN,
    Dashboard,
    Page1,
    Stats,
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
      { path: '/page1', name: 'page1', component: Page1 },
      { path: '/stats', name: 'stats', component: Stats },
      { path: '/feedback', name: 'feedback', component: Feedback },
      { path: '/dashboard', name: 'dashboard', component: Dashboard },
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
