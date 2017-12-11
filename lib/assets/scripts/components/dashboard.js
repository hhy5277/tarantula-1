'use strict'

const Dashboard = {
  template: `
    <div>
      <v-content>
        <v-container v-if="items">
          <v-layout row>
            <v-flex xs12 sm10 offset-sm1>
              <v-card>
                <v-list two-line>
                  <!--
                  <v-subheader>Recent chat</v-subheader>
                  -->
                  <template v-for="(item, index) in items">
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
         <v-card-title class="headline">{{ $t("dashboard.deleteDialog.title", {name: _.get(currentItem, "name")}) }}</v-card-title>
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
  `,

  metaInfo(){
    return {
      title: this.$t("menu.dashboard")
    }
  },

  data: () => ({
    dialogDelete: false,
    dialogAdd: false,
    items: null,

    currentItemIndex: null,
  }),

  beforeRouteEnter (to, from, next) {
    fetchProject().then((r) => {
      next((vm) => {
        vm.items = _.chain(r || []).map((n) => {
          return _.merge({
            control: [
              {
                key: 'cron',
                icon: "alarm",
                title: "dashboard.btnCron",
                disabled: true,
                isHidden: !n.cron,
              },
              {
                key: 'play',
                icon: "fa-play",
                title: "dashboard.btnPlay",
                click: vm.clickProjectPlay
              },
              {
                key: 'table',
                icon: "fa-table",
                title: "dashboard.btnTable",
                click: vm.clickProjectTable
              },
              {
                key: 'chart',
                icon: "fa-bar-chart",
                title: "dashboard.btnStats",
                click: vm.clickProjectStats
              },
              {
                key: 'undo',
                icon: "fa-undo",
                title: "dashboard.btnReset",
                click: vm.clickProjectReset,
              },
              {
                key: 'delete',
                icon: "fa-trash-o",
                title: "dashboard.btnDelete",
                click: vm.clickDeleteButton
              }
            ]
          }, n)
        }).value()
      })
    })
  },

  computed: {
    addProjectTips(){
      return this.$t("dashboard.addDialog.content").join("\n")
    },

    currentItem(){
      return _.get(this.items, this.currentItemIndex)
    }
  },

  methods: {
    clickProjectPlay: function(v, i){

      this.toggleControlStatus(i, 'play')
      startProject(v.id).then((r) => {
        if (r.status != 0){
          throw {message: r.message}
        }

        _.merge(this.items[i], r.data)

        this.$notify({color: 'success', text: this.$t("dashboard.string.startSucceed")})
      }).catch((e) => {

        this.$notify({color: 'error', text: e.message || this.$t("string.unknowError")})
      }).finally(() => {
        this.toggleControlStatus(i, 'play')
      })
    },

    clickDeleteButton: function(v, i){
      this.currentItemIndex = i
      this.dialogDelete = true
    },

    clickConfirmDelete: function(){
      this.dialogDelete = false

      const deleteId = this.currentItemIndex
      this.toggleControlStatus(deleteId, 'delete')
      deleteProject(this.currentItem.id).then(() => {
        this.items.splice(deleteId, 1)
      }).catch(() => {
        this.toggleControlStatus(deleteId, 'delete')
      })
    },

    clickProjectReset: function(v, i){
      this.toggleControlStatus(i, 'undo')
      resetProject(v.id).then(() => {
        this.$notify({color: 'success', text: this.$t("dashboard.string.resetSucceed")})
      }).finally(() => {
        this.toggleControlStatus(i, 'undo')
      })
    },

    clickProjectStats: function(v){
      this.$router.push({name: 'projectStats', params: {id: v.id}})
    },

    clickProjectTable: function(v){
      this.$router.push({name: 'projectTable', params: {id: v.id}})
    },

    toggleControlStatus: function(i, id){
      const n = _.find(_.get(this.items, `${i}.control`), (n) => n.key == id)
      if (!n){
        return
      }

      this.items.splice(i, _.merge(n, {
        disabled: !n.disabled
      }))
    }
  },
}
