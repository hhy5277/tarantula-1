'use strict'


const HeaderNN = {
  template: `
    <v-toolbar
      color="grey darken-3"
      dark
      app
      clipped-left
      fixed
    >
      <v-toolbar-title :style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'" class="ml-0 pl-3">
        <span class="hidden-xs-only">Tarantula</span>
      </v-toolbar-title>

      <div class="d-flex align-center" style="margin-left: auto">
        <v-btn icon @click="onMenu('page1')">
          <v-icon>apps</v-icon>
        </v-btn>
        <v-btn icon @click="onMenu('dashboard')">
          <v-icon>notifications</v-icon>
        </v-btn>
        <v-btn icon large>
          <v-avatar size="32px" tile>
            <img
              src="https://vuetifyjs.com/static/doc-images/logo.svg"
              alt="Vuetify"
            >
          </v-avatar>
        </v-btn>
      </div>
    </v-toolbar>
  `,

  data: () => ({
  }),

  methods: {
    onMenu(v){
      this.$router.push({name: v})
    }
  },

  props: {
    source: String
  }
}
