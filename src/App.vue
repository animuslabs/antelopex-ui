<template>
  <router-view />
  <div
    id="bg-wrap"
    style="    pointer-events: none; position:fixed; width:100vw; height:100vh;     top: 0;
    left: 0; z-index: -1;"
  >
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient
          id="Gradient1"
          cx="50%"
          cy="50%"
          fx="0.441602%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="51s"
            values="0%;3%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(64, 90, 204, .5)"
          />
          <stop
            offset="100%"
            stop-color="rgba(74, 50, 104, 0)"
          />
        </radialGradient>
        <radialGradient
          id="Gradient2"
          cx="50%"
          cy="50%"
          fx="2.68147%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="50.25s"
            values="0%;90%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(195, 40, 230, .4)"
          />
          <stop
            offset="100%"
            stop-color="rgba(34, 04, 200, 0)"
          />
        </radialGradient>
        <radialGradient
          id="Gradient3"
          cx="50%"
          cy="50%"
          fx="0.836536%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="30.25s"
            values="0%;90%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(20, 224, 194, .4)"
          />
          <stop
            offset="100%"
            stop-color="rgba(20, 214, 184, 0)"
          />
        </radialGradient>
        <radialGradient
          id="Gradient4"
          cx="50%"
          cy="50%"
          fx="4.56417%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="30s"
            values="0%;25%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(140, 24, 220, 1)"
          />
          <stop
            offset="100%"
            stop-color="rgba(100, 24, 200, 0)"
          />
        </radialGradient>
        <radialGradient
          id="Gradient5"
          cx="50%"
          cy="50%"
          fx="2.65405%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="36.75s"
            values="0%;5%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(10, 59, 204, 1)"
          />
          <stop
            offset="100%"
            stop-color="rgba(10, 20, 204, 0)"
          />
        </radialGradient>
        <radialGradient
          id="Gradient6"
          cx="50%"
          cy="50%"
          fx="0.981338%"
          fy="50%"
          r=".5"
        >
          <animate
            attributeName="fx"
            dur="28.25s"
            values="0%;5%;0%"
            repeatCount="indefinite"
          />
          <stop
            offset="0%"
            stop-color="rgba(104, 0, 0, 1)"
          />
          <stop
            offset="100%"
            stop-color="rgba(104, 0, 0, 0)"
          />
        </radialGradient>
      </defs>
      <rect
        x="-2.17916%"
        y="35.4267%"
        width="100%"
        height="100%"
        fill="url(#Gradient2)"
        transform="rotate(255.072 50 50)"
      >
        <animate
          attributeName="x"
          dur="24.5s"
          values="-25%;0%;-25%"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          dur="26s"
          values="0%;50%;0%"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="18s"
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="9.00483%"
        y="14.5733%"
        width="100%"
        height="100%"
        fill="url(#Gradient3)"
        transform="rotate(139.903 50 50)"
      >
        <animate
          attributeName="x"
          dur="39.5s"
          values="0%;25%;0%"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          dur="18s"
          values="0%;25%;0%"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 50 50"
          to="0 50 50"
          dur="48.5s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  mounted() {

  }

})
</script>
