<template>
  <v-toolbar
    color="grey darken-3"
    dark
    app
    clipped-left
    fixed
  >
    <v-toolbar-title :style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'" class="ml-0 pl-3">
      <span>
        <div class='svg-tarantula svg-tarantula-dims' style="margin-left: 0px"></div>
        <!--
        <img :src='require("../../assets/images/tarantula.svg")' />
      -->
        <div v-html='require("../../assets/images/tarantula.svg")' />
      </span>

      <!--
      <span class="hidden-xs-only">Tarantula</span>
      -->
    </v-toolbar-title>

    <!--
    <div class="d-flex align-center" style="margin-left: auto">
      <v-btn icon>
        <v-icon>apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>notifications</v-icon>
      </v-btn>
    </div>
    -->
  </v-toolbar>
</template>

<script>
// import logo from "../../assets/images/tarantula.svg"

export default {
  data: () => ({
  }),

  methods: {
    onMenu(v){
      this.$router.push({name: v})
    }
  },
}
</script>
