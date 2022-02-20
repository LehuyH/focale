<template>
  <div class="min-h-screen grid bg-gray-900" style="grid-template-rows: auto 1fr;">
    <header class="bg-gray-800 p-5 text-white flex items-center">
      <router-link to="/" class="text-2xl font-extrabold title">
        focale
        <span class="ml-[-5px]">🔮</span>
      </router-link>
      <router-link to="/sets">sets</router-link>
    </header>
    <router-view></router-view>
    <div class="back"></div>
  </div>
</template>

<style scoped>
.back {
    background-image: url(./assets/pog.png);
    background-position: center;
    background-size: cover;
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
}
a:not(.title) {
  @apply text-xl text-sky-500;
}

a {
  @apply mr-2;
}
</style>
