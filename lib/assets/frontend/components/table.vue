<template>
  <div>
    <v-content>
      <v-container>
        <v-data-table
          v-bind:headers="headers"
          :items="items"
          hide-actions
          class="elevation-1"
        >

        <template slot="items" slot-scope="props">
          <td class="text-xs-left" v-for="n in columns">{{ props.item[n] }}</td>
        </template>

      </v-data-table>
      </v-container>
    </v-content>
  </div>
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
