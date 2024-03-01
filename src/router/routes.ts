import { RouteRecordRaw } from "vue-router"

const routes:RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "unwrap", component: () => import("pages/Unwrap.vue"), name: "unwrap" },
      { path: "auth", component: () => import("pages/Auth.vue") },
      { path: "status", strict: false, component: () => import("pages/Status.vue"), name: "status" },
      { path: "retry", strict: false, component: () => import("pages/Retry.vue"), name: "retry" }
    ]
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
