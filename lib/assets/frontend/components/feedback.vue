<template>
  <v-content>
    <v-container>
    <v-layout row>
      <v-flex xs12 sm10 offset-sm1>
        <v-card class='elevation-1' flat>
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
                 ></v-text-field>
               </v-flex>
               <v-flex xs12>
                 <v-text-field
                   v-model="content"
                   box
                   multi-line
                   ref='content'
                   :label="$t('feedback.content')"
                 ></v-text-field>
               </v-flex>
             </v-layout>
           </v-container>

           <v-divider class="mt-5"></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="submit" :disabled="formHasErrors ? true : false">{{ $t("string.submit")}}</v-btn>
            </v-card-actions>
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
      email: '',
      emailRules: [
         v => {
           return !!v || this.$t('feedback.emailHint')
         },
         v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || this.$t('feedback.emailHint')
      ],
      content: "",

      formHasErrors: true
    }
  },

  watch: {
    email(v1, v2){
      this.verifyForm()
    },

    content(v1, v2){
      this.verifyForm()
    }
  },

  computed: {
    form () {
      return {
        email: this.email,
        content: this.content,
      }
    }
  },

  methods: {
    verifyForm(){
      this.formHasErrors = false

      Object.keys(this.form).forEach(f => {
        if (!this.form[f]){
          this.formHasErrors = true
        }

        this.$refs[f].validate(true)
      })
    },

    submit(){
      this.formHasErrors = true
      postFeedback({email: this.email, content: this.content}).then((r) => {
        this.formHasErrors = false
      }).catch((e) => {
        this.formHasErrors = false
      })
    }
  },
}
</script>
