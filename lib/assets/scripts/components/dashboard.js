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
                  <v-subheader>Recent chat</v-subheader>
                  <template v-for="(item, index) in items">
                    <v-list-tile avatar :key="item.name" @click="">
                      <v-list-tile-content>
                        <v-list-tile-title v-html="item.name"></v-list-tile-title>
                        <v-list-tile-sub-title class="grey--text text--darken-4">{{ item.description }}</v-list-tile-sub-title>
                        <v-list-tile-sub-title>占位符</v-list-tile-sub-title>
                      </v-list-tile-content>

                      <div class="align-center" style="margin-left: auto">
                        <v-btn icon disabled v-if="item.cron">
                          <v-icon color="blue-grey darken-2">alarm</v-icon>
                        </v-btn>

                        <v-btn icon>
                          <v-icon color="blue-grey darken-2">assessment</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteButton(item)">
                          <v-icon color="blue-grey darken-2">delete</v-icon>
                        </v-btn>
                      </div>

                      <!--
                      <v-list-tile-action>
                        <v-icon v-bind:color="item.active ? 'teal' : 'grey'">chat_bubble</v-icon>
                      </v-list-tile-action>
                      -->
                    </v-list-tile>

                    <!--
                    <v-divider></v-divider>
                    -->
                  </template>
                </v-list>
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
           <v-btn color="green darken-1" flat="flat" @click.native="dialogDelete = false">{{ $t("string.cancel") }}</v-btn>
           <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">{{ $t("string.confirm") }}</v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>

      <v-btn
        fab
        bottom
        right
        color="pink"
        dark
        fixed
        @click.stop="dialog = !dialog"
      >
        <v-icon>add</v-icon>
      </v-btn>

      <v-dialog v-model="dialog" width="800px">
        <v-card>
          <v-card-title
            class="grey lighten-4 py-4 title"
          >
            Create contact
          </v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12 align-center justify-space-between>
                <v-layout align-center>
                  <v-avatar size="40px" class="mr-3">
                    <img
                      src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png"
                      alt=""
                    >
                  </v-avatar>
                  <v-text-field
                    placeholder="Name"
                  ></v-text-field>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  prepend-icon="business"
                  placeholder="Company"
                ></v-text-field>
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  placeholder="Job title"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mail"
                  placeholder="Email"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  type="tel"
                  prepend-icon="phone"
                  placeholder="(000) 000 - 0000"
                  mask="phone"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="notes"
                  placeholder="Notes"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-btn flat color="primary">More</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
            <v-btn flat @click="dialog = false">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,

  data: () => ({
    dialogDelete: false,
    dialog: false,
    items: [],

    currentItem: null,
  }),

  methods: {
    deleteButton: function(v){
      this.currentItem = v
      this.dialogDelete = true
      //this.items = _.filter(this.items, (n) => n.id != v.id)
      //apiDeleteProject(v.id)
    },

    deleteProject: function(v){

    }
  },

  created: function(){
    apiFetchProject().then((r) => {
      this.items = _.chain(r).map((n) => {
        return {
          id: n.id,
          name: n.name,
          description: n.description,
          cron: !_.isEmpty(n.cron),
          seedScript: n['seedScript.name'],
        }
      }).value()
    }).catch((e) => {
      debugger
    })
  }
}
