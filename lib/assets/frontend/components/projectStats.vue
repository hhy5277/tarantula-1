<template>
  <div>
    <v-content>
      <v-container>
        <v-layout row>
          <v-flex xs12 sm10 offset-sm1>
            <template v-for="(item, i) in options">
              <v-card class='elevation-1' color="grey lighten-4" flat :key="i" style="margin-bottom: 20px">
                <t-chart :options="item"></t-chart>
              </v-card>
            </template>
          </v-flex>
        </v-layout>

        <v-alert
          outline
          color="info"
          icon="info"
          :value="!options"
        >
          {{ $t("dashboard.projectStats.emptyHint") }}
        </v-alert>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import Chart from "./chart"

export default {
  components: {
    "t-chart": Chart
  },

  metaInfo(){
    return {
      title: this.$t("stats.title")
    }
  },

  data: () => ({
    options: []
  }),

  methods: {
    ...mapActions(['actionGetProjectStats']),
    getDateRange(result){
      return _.chain(result)
              .map("day")
              .uniq()
              // .thru((items) => {
              //   items.push("2017-12-05")
              //   items.push("2017-12-01")
              //
              //   return items
              // })
              .sort()
              .thru((items) => {
                const days = moment(items.slice(-1)[0]).diff(moment(items[0]), 'days')

                return _.map(_.range(days + 1), (n) => moment(items[0]).add(n, 'days').format("YYYY-MM-DD"))
              })
              .value()
    },

    toChartOptions(result){
      const days = this.getDateRange(result)

      const statusAll = ['undo', 'delivered', 'succeed', 'failed']

      _.chain(result).groupBy("scriptName").map((items, k) => {
        const series = _.map(statusAll, (status) => {
          const data = _.map(days, (day) => {
            return _.chain(items).find((m) => m.day == day).get(status, 0).value()
          })

          return {
            name: status,
            data
          }
        })

        return {
          chart: {
            type: 'column'
          },
          title: {
            //text: _.chain(result).first().get("name").value()
            text: k,
          },
          xAxis: {
            categories: days,
          },
          yAxis: {
            title: {
              text: 'Number of tasks'
            }
          },
          series: series
        }
      }).tap((options) => {
        this.options = options
      }).value()
    },
  },

  created(){
    this.actionGetProjectStats(this.$route.params.id).then((r) => {
      if (r.length == 0){
        this.options = null
      }else{
        this.toChartOptions(r)
      }
    })
  }
}
</script>
