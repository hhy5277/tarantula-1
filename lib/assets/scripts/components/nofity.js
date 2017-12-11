'use strict'


const Nofity = {
  template: `
    <div>
      <v-snackbar
        :timeout="timeout"
        :top="y === 'top'"
        :bottom="y === 'bottom'"
        :right="x === 'right'"
        :left="x === 'left'"
        :multi-line="mode === 'multi-line'"
        :vertical="mode === 'vertical'"
        :color="color"
        v-model="snackbar"
      >
        {{ text }}
        <!-- color="pink" -->
        <v-btn flat color="white" @click.native="snackbar = false">{{ $t("string.close") }}</v-btn>
      </v-snackbar>
    </div>
  `,

  data () {
    return {
      snackbar: false,
      y: 'top',
      x: "right",
      mode: '',
      color: 'success',
      timeout: 1000 * 3,
      text: ''
    }
  },

  methods: {
  },

  created(){
    Vue.prototype.$notify = (params) => {
      _.merge(this, _.pick(params, ['text', 'color', 'mode']), {snackbar: true})
    }
  }
}
