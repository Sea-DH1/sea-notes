/**
 * Generated by "@vuepress/internal-routes"
 */

import { injectComponentOption, ensureAsyncComponentsLoaded } from '@app/util'
import rootMixins from '@internal/root-mixins'
import GlobalLayout from "/Volumes/MacDocument/myProjects/sea-notes/node_modules/@vuepress/core/lib/client/components/GlobalLayout.vue"

injectComponentOption(GlobalLayout, 'mixins', rootMixins)
export const routes = [
  {
    name: "v-3b60cb0b",
    path: "/",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-3b60cb0b").then(next)
    },
  },
  {
    path: "/index.html",
    redirect: "/"
  },
  {
    name: "v-a6d4e5ca",
    path: "/Three.js/",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-a6d4e5ca").then(next)
    },
  },
  {
    path: "/Three.js/index.html",
    redirect: "/Three.js/"
  },
  {
    name: "v-fce5cc60",
    path: "/Three.js/home.html",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-fce5cc60").then(next)
    },
  },
  {
    name: "v-19dcde9b",
    path: "/view/",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-19dcde9b").then(next)
    },
  },
  {
    path: "/view/index.html",
    redirect: "/view/"
  },
  {
    name: "v-f6f3be6a",
    path: "/algorithm/",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-f6f3be6a").then(next)
    },
  },
  {
    path: "/algorithm/index.html",
    redirect: "/algorithm/"
  },
  {
    name: "v-d4b62460",
    path: "/view/home.html",
    component: GlobalLayout,
    beforeEnter: (to, from, next) => {
      ensureAsyncComponentsLoaded("Layout", "v-d4b62460").then(next)
    },
  },
  {
    path: '*',
    component: GlobalLayout
  }
]