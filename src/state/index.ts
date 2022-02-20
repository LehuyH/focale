import { reactive, ref, watchEffect } from "vue";
import localforage from "localforage";

interface ISet {
    name: string;
    description: string;
    id: string;
    questions: ({
        question: string;
        answer: string;
        id: string;
    })[];
}

export interface IResult {
    question: string;
    answer: string;
    correct: boolean;
    correctAnswer: string;
    set: string;
}

type TResultsStore = Record<string, ({
    answers: IResult[];
    questionCount: number;
})>

export const sets = ref<ISet[]>([]);
export const results = reactive<TResultsStore>({});


(async () => {
    const tmpSets = await localforage.getItem<ISet[]>("sets"); 
    console.log({ tmpSets });

    if (tmpSets) {
        sets.value = tmpSets;
    }

    const tmpResults = await localforage.getItem<TResultsStore>("results");
    if (tmpResults) {
        for (const k in tmpResults) {
            results[k] = tmpResults[k];
        }
    }

    watchEffect(() => localforage.setItem("sets", JSON.parse(JSON.stringify(sets.value))));
    watchEffect(() => localforage.setItem("results", JSON.parse(JSON.stringify(results))));
})();

//@ts-ignore
window.__state = { sets };