<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, computed, reactive } from "vue";
import { IResult, results, sets } from "../../state";
import { v4 } from "uuid";

const id = useRoute().params.id as string | undefined;
const router = useRouter();
const set = computed(() => sets.value.find(s => s.id === id));
const currentIndex = ref(0);

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

const choiceMap = ref<IChoiceSet[]>([]);
const currentQuestion = computed(() => set.value?.questions[currentIndex.value]);
const quizResults = ref<IResult[]>([]);
const totalScore = computed(() => {
    let score = 0;
    for (const r of quizResults.value) {
        if (r.correct) { score++; }
    }
    return score;
});
const quizStates = reactive({
    loaded: false,
    ended: false,
});

console.log(set.value);
if (!set.value || set.value.questions.length === 0) {
    router.push("/sets");
}

interface IAPIAnswerResponse {
    related: ({
        "@id": string;
        weight: number;
    })[]
}

interface IChoiceSet {
    choices: string[],
    correctChoice: string,
    selected: string | null,
}

async function generateChoices(answer: string, id: string): Promise<IChoiceSet> {
    let payload = `https://api.conceptnet.io/related/c/en/${answer.toLowerCase().replaceAll(" ", "_")}`;
    const answerRes = await fetch(payload);
    const answers = ((await answerRes.json()) as IAPIAnswerResponse).related;
    const filteredAnswers = shuffle(answers.filter(a => a["@id"].includes("/c/en")).map(a => a["@id"]));
    return {
        choices: [answer.toLowerCase(), ...[...(new Set(filteredAnswers.map(a => a.toLowerCase().replaceAll("_", " ").replaceAll("/c/en/", ""))))].slice(0, 3)],
        correctChoice: answer.toLowerCase(),
        selected: null,
    };
}

async function buildAnswerBase() {
    for (const { answer, id } of set.value?.questions || []) {
        choiceMap.value.push(await generateChoices(answer, id));
    }

    quizStates.loaded = true;
}

function prepareResults() {
    for (const index in choiceMap.value) {
        const { correctChoice, selected } = choiceMap.value[index];
        quizResults.value.push({
            question: set.value?.questions[index].question as string,
            correct: correctChoice === selected,
            answer: selected as string,
            correctAnswer: correctChoice,
            set: set.value?.id as string
        });
    }

    const idOfResults = v4();
    results[idOfResults] = {
        answers: quizResults.value,
        questionCount: set.value?.questions.length || 1
    };
    quizStates.ended = true;
    router.push(`/results/${idOfResults}`);
}

function submitAnswer(answer: string) {
    choiceMap.value[currentIndex.value].selected = answer;
    if (currentIndex.value + 1 === set.value?.questions.length) {
        prepareResults();
    } else {
        currentIndex.value++;
    }
}

buildAnswerBase();
</script>

<template>
    <main class="text-white flex flex-col items-center">
        <div v-if="quizStates.loaded && currentQuestion" 
            class="flex flex-col justify-center px-32 flex-1 max-w-screen-lg"
        >
            <div class="question">
                <h1
                    class="text-3xl font-semibold"
                >{{ currentQuestion.question.toLowerCase() }}</h1>
            </div>
            <div class="choices">
                <div 
                    v-for="(choice, i) in shuffle(choiceMap[currentIndex].choices)" :key="i"
                    class="choice" 
                    @click="submitAnswer(choice)"
                >
                    <span class="pr-2">{{ i + 1 }}.</span>
                    <span class="text-xl">{{ choice }}</span>
                </div>
            </div>
            <div class="question-status text-sky-500">
                <span class="font-semibold mx-2 text-white">
                    question {{ currentIndex + 1 }} of {{ set?.questions.length || 0 }}
                </span>
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