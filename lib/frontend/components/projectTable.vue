<template>
  <div>
    <t-table :headers="finallyHeaders" :items="items" v-if="items"></t-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import Table from "./table"

export default {
  components: {
    "t-table": Table,
  },

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
    ...mapActions(['actionGetProcessData'])
  },

  created(){
    this.actionGetProcessData(this.$route.params.id).then((r) => {
      this.headers = _.chain(r).first().keys().map((n) => {
        return {
          text: n,
          value: n
        }
      }).value()

      this.items = _.chain(r).map((n) => {
        return _.set(n, "@createdAt", moment(n['@createdAt']).format())
      }).value()
    })
  }
}
</script>
