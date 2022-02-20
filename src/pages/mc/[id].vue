<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { v4 } from "uuid";
import { ref, computed } from "vue";
import { sets } from "../../state";

const id = useRoute().params.id as string | undefined;
const set = computed(() => sets.value.find(s => s.id === id));

function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

const choiceMap = [
    { correct: "Fortnite", choices: ["Fortnite", "vbucks", "potato", "appleberry"] }
]

if (!set.value) {
    useRouter().push("/sets");
}

function generateChoices() {

}
</script>

<template>
    <main class="text-white bg-gray-900 flex flex-col items-center">
        <div v-if="set" class="flex flex-col justify-center px-32 flex-1 max-w-screen-lg">
            <div class="question">
                <h1
                    class="text-3xl font-semibold"
                >Who is the Chief Creative Officer at Epic Games Incorporated?</h1>
            </div>
            <div class="choices">
                <div class="choice" v-for="(q, i) in shuffle(choiceMap)">
                    <span class="pr-2">A.</span>
                    <span class="text-xl">Donald Duck</span>
                </div>
            </div>
            <div class="question-status text-sky-500">
                <span class="cursor-pointer">⮜</span>
                <span class="font-semibold mx-2 text-white">
                    1 of {{ set.questions.length }}
                </span>
                <span class="cursor-pointer">⮞</span>
            </div>
        </div>
    </main>
</template>

<style scoped>
.choice {
    @apply flex items-center border-2 border-indigo-500 p-5 my-5 rounded-2xl cursor-pointer transition-colors duration-200;
}

.choice:hover {
    @apply bg-indigo-500;
}
</style>