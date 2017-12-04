'use strict'

const Dashboard = {
  template: `
    <div>
      <v-content>
        <v-container>
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

                      <div class="align-center" style="margin-left: auto">
                        <v-btn icon disabled v-if="item.cron">
                          <v-icon color="blue-grey darken-2">alarm</v-icon>
                        </v-btn>

                        <v-btn icon @click="clickProjectStats(item)">
                          <v-icon color="blue-grey darken-2">assessment</v-icon>
                        </v-btn>

                        <v-btn icon @click="clickDeleteButton(item)">
                          <v-icon color="blue-grey darken-2">delete</v-icon>
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
         <v-card-title class="headline">{{ $t("dashboard.deleteDialog.title", {name: _.get(currentItem, "name")})}}</v-card-title>
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

  data: () => ({
    dialogDelete: false,
    dialogAdd: false,
    items: [],

    currentItem: null,
  }),

  computed: {
    addProjectTips(){
      return this.$t("dashboard.addDialog.content").join("\n")
    }
  },

  methods: {
    clickDeleteButton: function(v){
      this.currentItem = v
      this.dialogDelete = true
    },

    clickConfirmDelete: function(){
      this.dialogDelete = false

      if (this.currentItem){
        this.items = _.filter(this.items, (n) => n.id != this.currentItem.id)
        deleteProject(this.currentItem.id)
      }
    },

    clickProjectStats: function(v){
      this.$router.push({name: 'projectStats', params: {id: v.id}})
    },
  },

  created: function(){
    fetchProject().then((r) => {
      this.items = r
    })
  }
}
