'use strict'

const Message = {
  template: `
    <v-content>
      <v-container>
        <template v-for="item in orderItems">
          <v-card style='margin-bottom: 10px'>
            <v-card-title>
              <div>
                <div style='font-size: 20px'>
                  {{ item["@createdAt"] }} {{ item.name }} {{ item.scriptName }}
                </div>

                <span class="grey--text">{{ item["@url"] }} {{ item['@context'] }}</span>
              </div>
            </v-card-title>
            <v-card-text>
              <pre>{{ item.message }}</pre>
            </v-card-text>
          </v-card>
        </template>

        <v-alert
          outline
          color="info"
          icon="info"
          :value="items.length == 0"
        >
          {{ $t("message.emptyHint") }}
        </v-alert>
      </v-container>
    </v-content>
  `,

  metaInfo(){
    return {
      title: this.$t("menu.message")
    }
  },

  data(){
    return {
      items: []
    }
  },

  computed: {
    ...Vuex.mapGetters(['dashbordProjects']),

    orderItems(){
      return _.chain(this.items).sampleSize(20).orderBy("@createdAt", "desc").value()
    }
  },

  methods: {
    getMessage(){
      _.each(this.dashbordProjects, (item) => {
        fetchProjectMessage(item.id).then(({messages}) => {
          _.each(messages, (n) => {
            this.items.push(_.merge(n, {"@createdAt": moment(n['@createdAt'], "x").format("YYYY-MM-DD HH:mm:ss")}))
          })
        })
      })
    }
  },

  watch: {
    dashbordProjects(){
      this.getMessage()
    }
  },

  created(){
    this.getMessage()
  }
}
