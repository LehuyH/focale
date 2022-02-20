import { ref, watchEffect } from "vue";
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

export const sets = ref<ISet[]>([]);

(async () => {
    const tmp = await localforage.getItem<ISet[]>("sets"); 
    console.log({ tmp });

    if (tmp) {
        sets.value = tmp;
    }

    watchEffect(() => localforage.setItem("sets", JSON.parse(JSON.stringify(sets.value))));
})();

//@ts-ignore
window.__state = { sets };