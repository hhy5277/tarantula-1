<style lang="scss" scoped>
.dashborad-btn{
  font-size: 20px
}
</style>

<template>
  <div>
    <v-content>
      <v-container v-if="projects">
        <v-layout row>
          <v-flex xs12 sm10 offset-sm1>
            <v-card>
              <v-list two-line>
                <!--
                <v-subheader>Recent chat</v-subheader>
                -->
                <template v-for="(item, index) in projects">
                  <v-list-tile avatar :key="item.name">
                    <v-list-tile-content>
                      <v-list-tile-title v-html="item.name"></v-list-tile-title>
                      <v-list-tile-sub-title class="grey--text text--darken-4">{{ item.description }}</v-list-tile-sub-title>
                      <v-list-tile-sub-title>

                      </v-list-tile-sub-title>
                    </v-list-tile-content>

                    <div class="align-center" style="margin-left: auto" v-for="control in item.control">
                      <v-btn icon :key="control.key" @click="control.click(item, index)" :title="$t(control.title)" :disabled="control.disabled" v-if="!control.isHidden">
                        <v-icon class='dashborad-btn' color="blue-grey darken-2">{{ control.icon }}</v-icon>
                      </v-btn>
                    </div>

                    <!--
                    <v-list-tile-action>
                      <v-icon v-bind:color="item.active ? 'teal' : 'grey'">chat_bubble</v-icon>
                    </v-list-tile-action>
                    -->
                  </v-list-tile>

                  <v-progress-linear v-model="item.progress" height="2" style="margin-top: -10px"></v-progress-linear>

                  <!--
                  <v-divider></v-divider>
                  -->
                </template>
              </v-list>

              <v-card-text style="height: 50px; position: relative">
                <v-fab-transition>
                  <v-btn
                    color="pink"
                    dark
                    absolute
                    top
                    right
                    fab
                    @click.stop="dialogAdd = !dialogAdd"
                    style="margin-top: 50px"
                  >
                    <v-icon>add</v-icon>
                  </v-btn>
                </v-fab-transition>
              </v-card-text>

              <!--
              <v-fab-transition>
                <v-btn
                  fab
                  bottom
                  right
                  color="pink"
                  dark
                  absolute
                  @click.stop="dialogAdd = !dialogAdd"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </v-fab-transition>
              -->
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <v-dialog v-model="dialogDelete" max-width="360">
     <v-card>
       <v-card-title class="headline">{{ $t("dashboard.deleteDialog.title", {name: selectedProjectName}) }}</v-card-title>
       <v-card-text>{{ $t("dashboard.deleteDialog.content")}}</v-card-text>
       <v-card-actions>
         <v-spacer></v-spacer>
         <v-btn color="green darken-1" flat="flat" @click="dialogDelete = false">{{ $t("string.cancel") }}</v-btn>
         <v-btn color="green darken-1" flat="flat" @click="clickConfirmDelete">{{ $t("string.confirm") }}</v-btn>
       </v-card-actions>
     </v-card>
   </v-dialog>

    <v-dialog v-model="dialogAdd" width="800px">
      <v-card>
        <v-card-title
          class="grey lighten-4 py-4 title"
        >{{ $t("dashboard.addDialog.title") }}</v-card-title>
        <v-container grid-list-sm class="pa-4">
          <vue-markdown :html="false">{{ this.addProjectTips }}</vue-markdown>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"

export default {
  metaInfo(){
    return {
      title: this.$t("menu.dashboard")
    }
  },

  data: () => ({
    dialogDelete: false,
    dialogAdd: false,
  }),

  computed: {
    ...mapGetters(['dashbordProjects', 'selectedProject']),

    projects(){
      return _.map(this.dashbordProjects, (n) => {
        _.each(n.control, (m) => {
          if (m.key == 'play'){
            m.click = this.clickProjectPlay
          }else if (m.key == 'chart'){
            m.click = this.clickProjectStats
          }else if (m.key == 'reset'){
            m.click = this.clickProjectReset
          }else if (m.key == 'delete'){
            m.click = this.clickDeleteButton
          }
        })

        return n
      })
    },

    addProjectTips(){
      return this.$t("dashboard.addDialog.content").join("\n")
    },

    selectedProjectName(){
      return _.get(this.selectedProject, "name")
    }
  },

  methods: {
    ...mapActions(['actionSelectProject', 'actionStartProject', 'actionDeleteProject', 'actionResetProject']),

    clickProjectPlay: function(v, i){

      this.actionStartProject({index: i, item: v}).then((r) => {
        this.$notify({color: 'success', text: this.$t("dashboard.string.startSucceed")})
      }).catch((e) => {
        this.$notify({color: 'error', text: e.message || this.$t("string.unknowError")})
      })
    },

    clickDeleteButton: function(v, i){
      this.dialogDelete = true

      this.actionSelectProject(i)
    },

    clickConfirmDelete: function(){
      this.dialogDelete = false

      this.actionDeleteProject().catch((e) => {
        this.$notify({color: 'success', text: this.$t("dashboard.string.deleteFaield")})
      })
    },

    clickProjectReset: function(v, i){
      this.actionResetProject({index: i, item: v}).then(() => {
        this.$notify({color: 'success', text: this.$t("dashboard.string.resetSucceed")})
      }).catch((e) => {
        this.$notify({color: 'success', text: this.$t("dashboard.string.resetFailed")})
      })
    },

    clickProjectStats: function(v){
      this.$router.push({name: 'projectStats', params: {id: v.id}})
    },
  },
}
</script>
