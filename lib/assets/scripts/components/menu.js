'use strict'


const Menu = {
  template: `
    <v-navigation-drawer
      fixed
      clipped
      app
      width="200"
    >
      <v-list dense>
        <template v-for="(item, i) in items">
          <v-divider v-if="item.text == '-'"></v-divider>
          <v-list-tile v-else @click="selected(item.route)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ $t(item.text) }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>

      <v-card-text style="position: absolute; bottom: 0">
        <!--
        <p class='text-xs-center'>version 0.1.0</p>
        <p class='text-xs-center'><a href='https://github.com/hummer-studio/tarantula' target='_blank'>{{ $t("menu.checkUpdate") }}</a></p>
        -->

        <div class='text-xs-center' >
          <iframe src="//ghbtns.com/github-btn.html?user=hummer-studio&repo=tarantula&type=star&count=true" frameborder="0" scrolling="0" width="80px" height="30px"></iframe>
        </div>
      </v-card-text>
    </v-navigation-drawer>
  `,

  data: () => ({
    items: [
      { icon: 'dashboard', text: "menu.dashboard", route: "dashboard" },
      // { icon: 'show_chart', text: "menu.stats", route: "stats" },
      { text: '-' },
      { icon: 'feedback', text: 'menu.feedback', route: "feedback" },
    ]
  }),

  methods: {
    selected(v){
      this.$router.push({name: v})
    }
  },
}
