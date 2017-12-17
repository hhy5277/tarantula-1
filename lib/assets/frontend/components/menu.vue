<template>
  <v-navigation-drawer
    fixed
    clipped
    app
    width="200"
    mobile-break-point="false"
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
        <!-- Place this tag where you want the button to render. -->
        <a class="github-button" href="https://github.com/hummer-studio/tarantula" data-icon="octicon-star" data-show-count="true" aria-label="Star hummer-studio/tarantula on GitHub">Star</a>
      </div>
      <p class='text-xs-center'><a href='//tarantula.tech' target='_blank'>tarantula.tech</a></p>
    </v-card-text>
  </v-navigation-drawer>
</template>

<script>
export default {
  data: () => ({
    items: [
      { icon: 'dashboard', text: "menu.dashboard", route: "dashboard" },
      { icon: 'track_changes', text: "menu.message", route: "message" },
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
</script>
