<script lang="ts" setup>
import { useRoute } from "vue-router";
import { v4 } from "uuid";
import { ref, computed } from "vue";
import { sets } from "../../state";

const id = useRoute().params.id as string | undefined;
const set = computed(() => sets.value.find(s => s.id === id));

if (!set.value) {
    sets.value.push({
        name: `Untitled Set ${sets.value.length}`,
        id: id || v4(),
        description: "Oh, what an amazing set we have here!",
        questions: []
    });
}

function addQuestion() {
    set.value?.questions.push({
        question: `What is the meaning of life?`,
        answer: "Fortnite",
        id: v4()
    })
}

function deleteQuestion(id: string) {
    const removeIndex = set.value?.questions.findIndex(q => q.id === id);
    
    if (typeof removeIndex === "number" && removeIndex > -1) {
        set.value?.questions.splice(removeIndex, 1);
    }
}
</script>

<template>
    <main class="text-white bg-gray-900 flex flex-col items-center">
        <div class="flex flex-col px-32 py-6 flex-1 max-w-screen-lg w-full">
            <div v-if="set">
                <h1 class="text-3xl font-bold mb-5">Editing {{ set.name }}.</h1>

                <div class="field">
                    <label class="text-xl font-bold block mb-2">Set Name</label>
                    <input
                        class="input border-2 border-indigo-500 w-full rounded-md"
                        placeholder="Title"
                        v-model="set.name"
                    />
                </div>

                <div class="field">
                    <label class="text-xl font-bold block mb-2">Set Description</label>
                    <textarea
                        class="input border-2 border-indigo-500  w-full rounded-md"
                        placeholder="Title"
                        v-model="set.description"
                    ></textarea>
                </div>

                <details class="field">
                    <summary class="text-xl font-bold cursor-pointer">
                        Questions
                    </summary>

                    <div class="mt-2"></div>

                    <div v-for="q in set.questions" :key="q.id" class="field">
                        <div class="flex">
                            <input 
                                class="input border-2 border-indigo-500 flex-1 rounded-tl-md border-r-0" 
                                placeholder="What's your question?"
                                v-model="q.question"
                            />
                            <button class="p-3 text-sm border-2 border-red-500 button rounded-tr-md bg-red-500" @click="deleteQuestion(q.id)">
                                Delete
                            </button>
                        </div>
                        <input 
                            class="input w-full rounded-b-md border-2 border-indigo-500 border-t-0"
                            v-model="q.answer"
                            placeholder="Answer this question..."
                        />

                    </div>

                    <button
                        @click="addQuestion"
                        class="flex border-2 p-2 my-5 rounded-md border-indigo-500 hover:bg-indigo-500 justify-center transition-colors duration-200"
                    >
                        <h1 class="text-md">Create New Question</h1>
                    </button>
                </details>
            </div>
        </div>
    </main>
</template>

<style>
.field {
    @apply my-3;
}

.input {
    @apply p-3 text-sm text-white bg-transparent;
}
</style>