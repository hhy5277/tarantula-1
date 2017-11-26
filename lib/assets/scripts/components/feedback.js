'use strict'

const Feedback = {
  template: `
    <v-content>
      <v-container>
      <v-layout row>
        <v-flex xs12 sm10 offset-sm1>
          <v-card class='elevation-1' color="grey lighten-4" flat>
             <v-container grid-list-md>
               <v-layout row wrap>
                 <v-flex xs12>
                   <div class="body-2">问题反馈</div>
                 </v-flex>
                 <v-flex xs12>
                   <v-text-field
                     box
                     label="Email address"
                     :rules="emailRules"
                     v-model="email"
                     hint="Enter your email!"
                     persistent-hint
                   ></v-text-field>
                 </v-flex>
                 <v-flex xs12>
                   <v-text-field box multi-line label="Content"></v-text-field>
                 </v-flex>
               </v-layout>
             </v-container>

             <v-divider class="mt-5"></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-slide-x-reverse-transition>
                  <v-tooltip
                    left
                    v-if="formHasErrors"
                  >
                    <v-btn
                      icon
                      @click="resetForm"
                      slot="activator"
                      class="my-0"
                    >
                      <v-icon>refresh</v-icon>
                    </v-btn>
                    <span>Refresh form</span>
                  </v-tooltip>
                </v-slide-x-reverse-transition>
                <v-btn color="primary" flat @click="submit">Submit</v-btn>
              </v-card-actions>
           </v-card>
        </v-flex>
      </v-layout>
      </v-container>
    </v-content>
  `,

  data: () => ({
    first: 'John',
    last: 'Doe',
    email: '',
    emailRules: [
       v => {
         return !!v || 'E-mail is required'
       },
       v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ]
  }),
}
