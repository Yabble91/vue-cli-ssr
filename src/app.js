import Vue from 'vue'
import createRouter from './router'
import App from './App.vue'

// 实例，每次请求都会创建新的实例
export default () => {
  const router = createRouter()
  // 实例
  const app = new Vue({
    router,
    components: { App },
    template: '<App/>'
  })
  return {app, router}
}
