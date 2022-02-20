<template>
    <main class="text-white bg-gray-900">
        <section class="absolute p-8 z-10">
            <span>
                <label>Relevancy</label>
                <br />
                <input v-model="minRelevancy" :max="maxRelevancy" min="0" type="range" />
            </span>
            <span class="px-8 animate-pulse" v-if="loading">Loading ⏳</span>
        </section>
        <section class="h-[90vh]" ref="webRef"></section>
        <section
            class="fixed z-10 top-0 right-0 bg-white h-full p-8 text-white transition-transform ease-in-out duration-200 shadow-md"
            :class="infoClasses"
            :style="`background: linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${selectedTopic?.image}') no-repeat center center; background-size: cover;`"
        >
            <button
                @click="selectedTopic = null"
                class="block my-4 rounded-full w-12 h-12 text-white bg-blue-500 hover:bg-blue-600"
            >→</button>
            <section v-if="selectedTopic" class="w-[500px]">
                <section class="p-4">
                    <h1 class="font-bold text-3xl">{{ selectedTopic.focaleTitle }}</h1>
                </section>
                <section class="p-4" v-if="selectedTopic.audio">
                    <h1 class="font-bold text-xl">Active Listening</h1>
                    <audio controls>
                        <source :src="selectedTopic.audio" type="audio/mpeg" />
                    </audio>
                </section>
                <section class="p-4" v-if="videoUrl">
                    <h1 class="font-bold text-2xl">Watch It! 📺</h1>
                    <iframe
                        :src="videoUrl"
                        class="border-2 border-indigo-500 mt-3"
                        style="width: 475px; height: calc(475px * 9 / 16)"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </section>
            </section>
        </section>
    </main>
</template>

<script setup lang="ts">
import * as vis from 'vis-network';
import { DataSet } from 'vis-data'
import { computed, ref, onMounted, reactive, watch, nextTick } from 'vue';
import localforage from 'localforage';
import { useRoute } from "vue-router";
import { toGraph } from '../../logic/graph';

const selectedTopic = ref(null as any | null);
const loading = ref(false);
const webRef = ref<HTMLElement | null>(null);
let network = null as vis.Network | null;
const minRelevancy = ref(0);
const maxRelevancy = ref(0);
const videoUrl = ref(null as string | null);

const id = useRoute().params.id as string;

let graphData = null as any

const infoClasses = computed(() => {
    return {
        'translate-x-full': !selectedTopic.value,
        'translate-x-0': selectedTopic.value
    }
});

const analysisGraph = reactive({
    nodes: [],
    edges: [] as any,
})

const relevantGraph = computed(() => {
    return {
        nodes: new DataSet(analysisGraph.nodes.filter((n: any) => {

            if (!n.relevancy || n.forceRelevant) return true;
            return n.relevancy > minRelevancy.value;
        })),
        edges: new DataSet(analysisGraph.edges),
    }
})

watch(() => relevantGraph.value, async () => {
    loading.value = true;
    await nextTick()
    await nextTick()
    network?.setData({
        nodes: relevantGraph.value.nodes as any,
        edges: relevantGraph.value.edges as any,
    })
    loading.value = false;
})


onMounted(async () => {
    if (!id) {
        alert('no id provided');
        return;
    }

    try {
        const results = await localforage.getItem<Record<string, any>>("results");
        if (!results || !results[id]) {
            throw new Error("No results found with ID " + id);
        }


        //Restore cache if available
        const cachedGraph = await localforage.getItem("cache-" + id);
        if (cachedGraph) {
            graphData = cachedGraph;
            minRelevancy.value = graphData.maxRelevance;
            maxRelevancy.value = graphData.maxRelevance + 1;
            console.log(graphData)
            analysisGraph.nodes = graphData.nodes;
            analysisGraph.edges = graphData.edges;
            var container = webRef.value as HTMLElement;
            var options = {
                height: '100%',
                width: '100%',
                nodes: {
                    font: {
                        color: "white"
                    }
                },
                edges: {
                    width: 2
                },
                physics: {
                    solver: "forceAtlas2Based"
                }
            };
            network = new vis.Network(container, {
                nodes: relevantGraph.value.nodes as any,
                edges: relevantGraph.value.edges as any
            }, options);
        }
        //Fetch the analysis
        const analysisReq = await fetch(`/.netlify/functions/analyze`, {
            method: 'POST',
            body: JSON.stringify({
                answers: results[id].answers
            })
        }).then(res => res.json())

        graphData = toGraph(analysisReq.data);
        //Save cache to localforage
        localforage.setItem("cache-" + id, graphData);

        minRelevancy.value = graphData.maxRelevance;
        maxRelevancy.value = graphData.maxRelevance + 1;

        analysisGraph.nodes = graphData.nodes;
        analysisGraph.edges = graphData.edges;



    } catch (e) {
        alert(e)
        console.error(e)
        return;
    }

    // create a network
    var container = webRef.value as HTMLElement;
    var options = {
        height: '100%',
        width: '100%',
        nodes: {
            font: {
                color: "white"
            }
        },
        edges: {
            width: 2
        },
        physics: {
            solver: "forceAtlas2Based"
        }
    };
    network = new vis.Network(container, {
        nodes: relevantGraph.value.nodes as any,
        edges: relevantGraph.value.edges as any
    }, options);

    network.on("click", async (props) => {
        videoUrl.value = null;
        selectedTopic.value = (graphData.questionData as any)[props.nodes[0]]

        //Fetch the video
        const videoReq = await fetch(`/.netlify/functions/video`, {
            method: 'POST',
            body: JSON.stringify({
                search: selectedTopic.value.focaleTitle
            })
        }).then(res => res.json())
        if (videoReq.success) {
            videoUrl.value = videoReq.data;
        }
    })

    //@ts-ignore
    window.a = analysisGraph
})
</script>