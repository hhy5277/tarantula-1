<template>
  <v-content>
    <v-container>
    <v-layout row>
      <v-flex xs12 sm10 offset-sm1>
        <v-card class='elevation-1' flat>
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="email"
                    box
                    :label="$t('feedback.email')"
                    :rules="emailRules"
                    ref='email'
                    persistent-hint
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="content"
                    box
                    multi-line
                    :rules="contentRules"
                    ref='content'
                    :label="$t('feedback.content')"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>

            <v-divider class="mt-5"></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="submit" :disabled="valid ? false : true">{{ $t("string.submit")}}</v-btn>
            </v-card-actions>
          </v-form>
         </v-card>
       </v-flex>
    </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import { postFeedback } from "../api"

export default {
  metaInfo(){
    return {
      title: this.$t("menu.feedback")
    }
  },

  data(){
    return {
      valid: false,
      email: '',
      emailRules: [
         v => !!v || this.$t('feedback.emailHint'),
         v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(v) || this.$t('feedback.emailHint')
      ],
      content: "",
      contentRules: [
        v => (v || "").length >= 10 || ""
      ],
    }
  },

  methods: {
    submit(){
      this.valid = false
      postFeedback({email: this.email, content: this.content}).then((r) => {
        this.$refs.form.reset()
      }).catch(() => {
        this.valid = ture
      })
    }
  },
}
</script>
