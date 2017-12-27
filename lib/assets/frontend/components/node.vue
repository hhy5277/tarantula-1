<template>
  <v-content>
    <v-container>
      <t-table :headers="headers" :items="items" v-if="items"></t-table>
    </v-container>
  </v-content>
</template>

<script>
import { fetchNodes } from "../api"
import Table from "./table"

export default {
  components: {
    "t-table": Table,
  },

  metaInfo(){
    return {
      title: this.$t("menu.nodes")
    }
  },

  data(){
    return {
      headers: _.chain(this.$t("nodes.tableColumn")).map((n) => {
        return _.merge(n, {
          value: n.key,
          align: n.key == "ip" ? 'left' : "right",
        })
      }).value(),

      items: []
    }
  },

  created(){
    fetchNodes().then((r) => {
      this.items = this.items.concat(r.items)
    })
  }
}
</script>
