import DefaultTheme from "vitepress/theme";
import Workout from "./components/Workout.vue";
import VideoEmbed from "./components/VideoEmbed.vue";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("Workout", Workout);
    app.component("VideoEmbed", VideoEmbed);
  },
};
