import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Workout Plan",
  base: "/workout-plan/",
  description: "A daily guide to my fitness journey.",

  head: [
    [
      "meta",
      {
        "http-equiv": "Content-Security-Policy",
        content:
          "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://youtube.com https://www.gstatic.com; frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https:;",
      },
    ],
  ],

  markdown: {
    html: true,
    linkify: true,
    typographer: true,
  },

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Plans", link: "/plans/" },
    ],
    sidebar: {
      "/plans/": [
        {
          text: "Cycle 1",
          items: [
            { text: "Week 1", link: "/plans/cycle-1/week-1" },
            { text: "Week 2", link: "/plans/cycle-1/week-2" },
            { text: "Week 3", link: "/plans/cycle-1/week-3" },
            { text: "Week 4", link: "/plans/cycle-1/week-4" },
          ],
        },
        {
          text: "Cycle 2",
          items: [
            { text: "Week 1", link: "/plans/cycle-2/week-1" },
            { text: "Week 2", link: "/plans/cycle-2/week-2" },
            { text: "Week 3", link: "/plans/cycle-2/week-3" },
            { text: "Week 4", link: "/plans/cycle-2/week-4" },
          ],
        },
      ],
    },
  },
});
