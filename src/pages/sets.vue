<script setup lang="ts">
import { sets } from "../state";
import { v4 } from "uuid";

function deleteSet(id: string) {
    const removeIndex = sets.value.findIndex(s => s.id === id);
    
    if (removeIndex > -1) {
        sets.value.splice(removeIndex, 1);
    }
}
</script>

<template>
    <main class="text-white flex flex-col items-center">
        <div class="flex flex-col px-16 py-6 flex-1 max-w-screen-lg w-full">
            <h1 class="text-3xl font-semibold">view your sets</h1>
            <div v-for="set in sets" :key="set.id" class="my-4 set border-sky-500">
                <div class="flex-1">
                    <h1 class="text-xl font-bold">{{ set.name }}</h1>
                    <p class="text-sm mt-2">{{ set.description }}</p>
                </div>
                <div class="ml-2">
                    <router-link
                        :to="`/mc/${set.id}`" 
                        class="button inline-block ml-2 bg-green-500"
                    >
                        Quiz!
                    </router-link>
                    <router-link 
                        :to="`/set/${set.id}`" 
                        class="button inline-block ml-2 bg-gray-800"
                    >
                        Modify
                    </router-link>
                    <button 
                        class="button inline-block ml-2 bg-red-500" 
                        @click="deleteSet(set.id)"
                    >
                        Delete
                    </button>
                </div>
            </div>

        <router-link 
            :to="`/set/${v4()}`" 
            class="set border-indigo-500 hover:bg-indigo-500 justify-center transition-colors duration-200"
        >
            <h1 class="text-xl font-bold">Create New Set</h1>
        </router-link>
        </div>
    </main>
</template>

<style scoped>
.set {
    @apply flex border-2 p-5 my-5 rounded-2xl;
}

.button {
    @apply p-2 text-sm text-center my-2 rounded-2xl;
}
</style>