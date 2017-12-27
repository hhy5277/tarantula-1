<template>
  <v-data-table
    v-bind:headers="headers"
    :items="items"
    hide-actions
    class="elevation-1"
  >
    <template slot="items" slot-scope="props">
      <td :class="i == 0 ? 'text-xs-left' : 'text-xs-right'" v-for="(n, i) in columns">{{ props.item[n] }}</td>
    </template>

  </v-data-table>
</template>

<script>
export default {
  props: ["headers", "items"],

  data(){
    return {
      columns: _.chain(this.headers).map("value").value()
    }
  },
}
</script>
