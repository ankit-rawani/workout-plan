<template>
    <div class="workout-container">
        <!-- Navigation Controls -->
        <div class="workout-navigation">
            <button
                @click="goToPreviousDay"
                :disabled="loading"
                class="nav-button prev-button"
                title="Previous Day"
            >
                ←
            </button>

            <div class="current-date">
                <h3>{{ formatDate(currentDate) }}</h3>
                <p v-if="workoutData" class="workout-info">
                    Cycle {{ workoutData.cycle }}, Week
                    {{ workoutData.weekOfCycle }}, Day
                    {{ workoutData.dayOfWeek }}
                </p>
            </div>

            <button
                @click="goToNextDay"
                :disabled="loading"
                class="nav-button next-button"
                title="Next Day"
            >
                →
            </button>
        </div>

        <!-- Workout Content -->
        <div v-if="workoutData" class="workout-content">
            <div v-html="renderedContent" ref="workoutContainer"></div>
        </div>
        <div v-else-if="loading" class="loading">Loading workout...</div>
        <div v-else class="no-workout">No workout for today.</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import {
    getWorkoutForDate,
    getNextWorkoutDate,
    getPreviousWorkoutDate,
} from "../workoutData.js";
import md from "markdown-it";

const workoutData = ref(null);
const renderedContent = ref("");
const loading = ref(true);
const currentDate = ref(new Date());
const workoutContainer = ref(null);
const markdown = md({
    html: true,
    linkify: true,
    typographer: true,
});

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Convert iframes to properly wrapped video containers
function convertIframesToVideoEmbeds(htmlContent) {
    // Replace iframe tags with wrapped versions
    return htmlContent.replace(
        /<iframe([^>]*?)src="([^"]*?)"([^>]*?)>[\s\S]*?<\/iframe>/g,
        (match, beforeSrc, src, afterSrc) => {
            // Extract title attribute if present
            const titleMatch = match.match(/title="([^"]*?)"/);
            const title = titleMatch ? titleMatch[1] : "Video";

            return `<div class="video-container">
                <iframe
                    src="${src}"
                    title="${title}"
                    width="560"
                    height="315"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
            </div>`;
        },
    );
}

// Load workout for a specific date
async function loadWorkoutForDate(date) {
    loading.value = true;
    workoutData.value = null;
    renderedContent.value = "";

    try {
        const workout = await getWorkoutForDate(date);

        console.log(`Loading workout for: ${date.toDateString()}`);
        console.log(`Workout data:`, workout);

        if (workout.error) {
            renderedContent.value = `<div class="error"><h2>Unable to Load Workout</h2><p>${workout.error}</p></div>`;
        } else if (workout && workout.dayContent) {
            let fullContent = workout.dayContent;

            // Add general instructions if available
            if (workout.generalInstructions) {
                fullContent += "\n\n" + workout.generalInstructions;
            }

            // Render markdown to HTML
            let htmlContent = markdown.render(fullContent);

            // Convert iframes to properly wrapped video containers
            const iframeCount = (htmlContent.match(/<iframe/g) || []).length;
            if (iframeCount > 0) {
                console.log(
                    `Converting ${iframeCount} iframes to responsive video containers`,
                );
                htmlContent = convertIframesToVideoEmbeds(htmlContent);
            }

            // Store the rendered content
            renderedContent.value = htmlContent;
            workoutData.value = workout;
        } else {
            const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
            renderedContent.value = `<h2>Day ${dayOfWeek}</h2><p>No workout scheduled for this day.</p>`;
        }
    } catch (error) {
        console.error("Error loading workout:", error);
        renderedContent.value =
            "<p>Failed to load workout content. Please try refreshing the page.</p>";
    } finally {
        loading.value = false;
    }
}

// Navigation functions
async function goToNextDay() {
    const nextDate = getNextWorkoutDate(currentDate.value);
    currentDate.value = nextDate;
    await loadWorkoutForDate(nextDate);
}

async function goToPreviousDay() {
    const prevDate = getPreviousWorkoutDate(currentDate.value);
    currentDate.value = prevDate;
    await loadWorkoutForDate(prevDate);
}

// Keyboard navigation handler
function handleKeydown(event) {
    if (loading.value) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goToPreviousDay();
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goToNextDay();
    }
}

onMounted(async () => {
    await loadWorkoutForDate(currentDate.value);
    // Add keyboard event listener
    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    // Remove keyboard event listener
    document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.workout-container {
    max-width: 100%;
    outline: none; /* Remove focus outline since we handle keyboard navigation */
}

.workout-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: var(--vp-c-bg-soft);
    border-radius: 12px;
    border: 1px solid var(--vp-c-divider);
}

.current-date {
    text-align: center;
    flex: 1;
    margin: 0 1rem;
}

.current-date h3 {
    margin: 0 0 0.5rem 0;
    color: var(--vp-c-brand-1);
    font-size: 1rem;
    font-weight: 600;
}

.current-date .keyboard-hint {
    font-size: 0.75rem;
    color: var(--vp-c-text-3);
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--vp-c-default-soft);
    border-radius: 4px;
    border: 1px solid var(--vp-c-divider-light);
}

.workout-info {
    margin: 0;
    font-size: 0.9rem;
    color: var(--vp-c-text-2);
    font-style: italic;
}

.nav-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--vp-c-brand-1);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
    background-color: var(--vp-c-brand-2);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-button:active:not(:disabled) {
    transform: translateY(0);
}

.nav-button:disabled {
    background-color: var(--vp-c-text-3);
    cursor: not-allowed;
    opacity: 0.6;
}

.workout-content {
    max-width: 100%;
}

.workout-content :deep(.video-container) {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    margin: 1rem 0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.workout-content :deep(.video-container iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
}

.workout-content :deep(h2) {
    color: var(--vp-c-brand-1);
    border-bottom: 2px solid var(--vp-c-divider);
    padding-bottom: 0.5rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.workout-content :deep(h3) {
    color: var(--vp-c-brand-2);
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.workout-content :deep(ul) {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.workout-content :deep(li) {
    margin: 0.5rem 0;
    line-height: 1.6;
}

.workout-content :deep(em) {
    color: var(--vp-c-text-2);
    font-style: italic;
}

.loading,
.no-workout {
    text-align: center;
    padding: 2rem;
    color: var(--vp-c-text-2);
    font-style: italic;
}

.workout-content :deep(.error) {
    background-color: var(--vp-c-danger-soft);
    border: 1px solid var(--vp-c-danger);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
}

.workout-content :deep(.error h2) {
    color: var(--vp-c-danger);
    margin-top: 0;
}
</style>
