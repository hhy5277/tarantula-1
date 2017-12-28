<style lang='scss' scoped>
.message{
  font-size: 12px;
  word-wrap: break-word;
  // /width: 200px;
  overflow: auto;

}
</style>

<template>
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
            <pre class='message'>{{ item.message }}</pre>
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
</template>

<script>
import { mapGetters, mapActions } from "vuex"

export default {
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
    ...mapGetters(['dashbordProjects']),

    orderItems(){
      return _.chain(this.items).sampleSize(20).orderBy("@createdAt", "desc").value()
    }
  },

  methods: {
    ...mapActions(['actionGetMessage'])
  },

  watch: {
    dashbordProjects(){
      this.actionGetMessage().then((r) => this.items = r)
    }
  },

  created(){
    this.actionGetMessage().then((r) => this.items = r)
  }
}
</script>
