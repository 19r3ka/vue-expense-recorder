import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import Openlayers from './plugins/openlayers'

createApp(App).use(i18n).use(vuetify()).use(Openlayers).mount('#app')
