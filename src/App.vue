<template>
  <div class="min-h-screen grid" style="grid-template-rows: auto 1fr;">
    <header class="bg-gray-800 p-5 text-white flex items-center">
      <router-link to="/" class="text-2xl font-extrabold title">
        Focale
        <span class="ml-[-5px]">🔮</span>
      </router-link>
      <router-link to="/sets">Sets</router-link>
    </header>
    <router-view></router-view>
  </div>
</template>

<style scoped>
a:not(.title) {
  @apply text-xl text-sky-500;
}

a {
  @apply mr-2;
}
</style>
