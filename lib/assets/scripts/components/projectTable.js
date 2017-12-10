'use strict'

//=require table.js

const ProjectTable = {
  components: {
    "t-table": Table,
  },

  template: `
    <div>
      <t-table :headers="finallyHeaders" :items="items" v-if="items"></t-table>
    </div>
  `,

  metaInfo(){
    return {
      title: this.$t("table.title")
    }
  },

  data: () => ({
    headers: [
     // { text: 'Dessert (100g serving)', value: '@name' },
     // { text: 'Dessert (100g serving)', value: '@name1' },
    ],

    items: null,
  }),

  beforeRouteEnter (to, from, next) {
    fetchProjectData(to.params.id).then((r) => {
      next((vm) => {
        vm.headers = _.chain(r).first().keys().map((n) => {
          return {
            text: n,
            value: n
          }
        }).value()

        vm.items = _.chain(r).map((n) => {
          return _.set(n, "@createdAt", moment(n['@createdAt']).format())
        }).value()
      })
    })
  },

  computed: {
    finallyHeaders(){
      return _.map(this.headers, (n) => {
        return _.merge({
          align: 'left',
          sortable: false
        }, n)
      })
    }
  },

  methods: {
  },
}
