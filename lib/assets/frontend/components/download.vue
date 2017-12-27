<template>
  <v-content>
    <v-container grid-list-md>
      <v-layout row wrap>
      <v-flex xs2>
        <v-select
          v-bind:items="projectItems"
          v-model="selectedProject"
          :label='$t("download.filter.selectProject")'
          single-line
          bottom
        ></v-select>
      </v-flex>

      <v-flex xs2>
        <v-select
          v-bind:items="scriptItems"
          v-model="selectedScript"
          :label='$t("download.filter.selectScript")'
          single-line
          bottom
        ></v-select>
      </v-flex>

      <v-flex xs2>
        <v-menu
            lazy
            v-model="startDayMenu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
          >
            <v-text-field
              slot="activator"
              :label='$t("download.filter.startDay")'
              v-model="startDay"

              readonly
            ></v-text-field>

            <v-date-picker v-model="startDay" no-title scrollable actions />
          </v-menu>
      </v-flex>

      <v-flex xs2>
        <v-menu
            lazy
            v-model="endDayMenu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
          >
            <v-text-field
              slot="activator"
              :label='$t("download.filter.endDay")'
              v-model="endDay"
              readonly
            ></v-text-field>
            <v-date-picker v-model="endDay" no-title scrollable actions />
          </v-menu>
      </v-flex>

      <v-flex xs4 style='margin-top: 15px;'>
        <v-btn small outline color="indigo" @click="preview" :disabled="!isAllowSubmit">{{ $t("download.filter.preview") }}</v-btn>
        <v-btn small outline color="indigo" @click="download" :disabled="!isAllowSubmit">{{ $t("download.filter.download") }}</v-btn>
      </v-flex>

      </v-layout>

      <div>
        <t-table :headers="previewHeaders" :items="previewData" v-if="previewData"></t-table>
      </div>
    </v-container>
  </v-content>
</template>

<script>
import { fetchScripts, fetchScriptData, fetchScriptDataPreview } from "../api"
import Table from "./table"

export default {
  components: {
    "t-table": Table,
  },

  metaInfo(){
    return {
      title: this.$t("menu.download")
    }
  },

  data(){
    return {
      scripts: {},

      startDayMenu: false,
      endDayMenu: false,

      startDay: null,
      endDay: null,

      // allowedDates: (day) => {
      //   return true
      //   return  day == '2017-12-20'
      // },

      selectedProject: null,
      selectedScript: null,

      previewHeaders: {},
      previewData: null,
    }
  },

  computed: {
    projectItems(){
      return _.chain(this.scripts).keys().value()
    },

    scriptItems(){
      return _.chain(this.scripts).get(this.selectedProject).map((n) => ({
        id: n.id,
        text: n.name
      })).value()
    },

    isAllowSubmit(){
      return !_.isEmpty(this.selectedProject) &&
             !_.isEmpty(this.selectedScript) &&
             !_.isEmpty(this.startDay) &&
             !_.isEmpty(this.endDay) &&
             moment(this.startDay).diff(moment(this.endDay), 'days') <= 0
    }
  },

  methods: {
    preview(){
      fetchScriptDataPreview(this.selectedScript.id, {
        startDay: this.startDay,
        endDay: this.endDay,
      }).then((r) => {
        this.previewHeaders = _.chain(r.data).first().keys().map((n, i) => {
          return {
            text: n,
            value: n,
            align: i == 0 ? 'left' : 'right',
            sortable: false
          }
        }).value()

        this.previewData = _.chain(r.data).map((n) => {
          return _.set(n, "@createdAt", moment(n['@createdAt']).format())
        }).value()
      })
    },

    download(){
      fetchScriptData(this.selectedScript.id, {
        startDay: this.startDay,
        endDay: this.endDay,
      }).then((r) => {
        window.open(r, '_blank');
      })
    }
  },

  watch:{
    selectedProject(){
      this.selectedScript = null
    }
  },

  created(){
    fetchScripts().then((r) => {
      //this.$set(this.scripts, r.scripts)
      // _.merge(this.scripts, r.scripts)
      // this.scripts = Object.assign({}, r.scripts)
      this.scripts = r.scripts
    })
  }
}
</script>
