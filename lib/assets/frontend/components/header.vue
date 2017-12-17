<style lang="scss" scoped>
.logo{
  margin-top: 10px;
}
</style>

<style lang="scss">
.logo{
  svg{
    height: 35px;
  }
}
</style>

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
        <div class='logo' v-html='require("../../images/tarantula.svg")'></div>
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
