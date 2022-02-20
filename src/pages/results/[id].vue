<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { results } from "../../state";

const id = useRoute().params.id as string;
const router = useRouter();
const result = computed(() => results[id]);
const totalScore = computed(() => {
    let score = 0;
    for (const r of result.value.answers) {
        if (r.correct) { score++; }
    }
    return score;
});

if (!id) {
    router.push("/sets");
}
</script>

<template>
    <main class="text-white bg-gray-900 flex flex-col items-center">
        <div
            class="flex flex-col px-16 py-6 flex-1 max-w-screen-lg"
        >
            <h1 class="text-5xl font-bold mb-5">
                you scored {{ totalScore }} / {{ result.questionCount }} ({{ totalScore * 100 / result.questionCount }}%)
            </h1>
            
            <router-link :to="`/focus/${id}`" class="text-3xl font-bold mb-2 text-sky-500">Analyze your results.</router-link>
            <h2 class="text-3xl font-bold mb-2">score breakdown.</h2>

            <div v-for="(answer, i) in result.answers" :key="i" 
                class="question-result"
                :class="[answer.correct ? 'border-green-500' : 'border-red-500']"
            >
                <div>
                    {{ (i + 1) + "." }}&nbsp; 
                    {{ answer.question }} 
                    <span :class="[answer.correct ? 'text-green-500' : 'text-red-500']">
                        ({{ answer.correct ? "correct" : "wrong" }})
                    </span>
                </div>
                <br>
                <div>your answer: {{ answer.answer }}</div>
                <div v-if="!answer.correct">correct answer: {{ answer.correctAnswer }}</div>
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

.question-result {
    @apply flex border-2 p-5 my-3 rounded-2xl flex-col;
}
</style>