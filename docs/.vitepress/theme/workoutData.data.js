import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

export default {
  watch: ["../plans/**/*.md"],
  load() {
    const workoutData = {};
    const plansDir = join(process.cwd(), "docs/plans");

    // Read all cycle directories
    const cyclePattern = /^cycle-(\d+)$/;
    const cycles = readdirSync(plansDir)
      .filter((dir) => cyclePattern.test(dir))
      .sort((a, b) => {
        const numA = parseInt(a.match(cyclePattern)[1]);
        const numB = parseInt(b.match(cyclePattern)[1]);
        return numA - numB;
      });

    for (const cycleDir of cycles) {
      const cycleNum = parseInt(cycleDir.match(cyclePattern)[1]);
      const cyclePath = join(plansDir, cycleDir);

      if (!existsSync(cyclePath)) continue;

      workoutData[cycleNum] = {};

      // Read all week files in this cycle
      const weekPattern = /^week-(\d+)\.md$/;
      const weekFiles = readdirSync(cyclePath)
        .filter((file) => weekPattern.test(file))
        .sort((a, b) => {
          const numA = parseInt(a.match(weekPattern)[1]);
          const numB = parseInt(b.match(weekPattern)[1]);
          return numA - numB;
        });

      for (const weekFile of weekFiles) {
        const weekNum = parseInt(weekFile.match(weekPattern)[1]);
        const weekPath = join(cyclePath, weekFile);

        try {
          const content = readFileSync(weekPath, "utf-8");
          workoutData[cycleNum][weekNum] = processMarkdownContent(content);
        } catch (error) {
          console.warn(`Failed to read ${weekPath}:`, error.message);
        }
      }
    }

    return {
      workoutData,
      availableCycles: Object.keys(workoutData)
        .map(Number)
        .sort((a, b) => a - b),
      startDate: "2025-06-30T00:00:00.000Z",
      weeksPerCycle: 4,
    };
  },
};

function extractSectionContent(markdownText, sectionTitle) {
  if (!markdownText || !sectionTitle) return null;

  // Create regex to match the section and capture content until next section
  const sectionRegex = new RegExp(
    `## ${sectionTitle}[\\s\\S]*?(?=\\n## [A-Z]|$)`,
    "i",
  );

  const match = markdownText.match(sectionRegex);
  return match ? match[0].trim() : null;
}

function extractDayContent(markdownText, dayOfWeek) {
  if (!markdownText) return null;

  let dayTitle;

  // Handle weekend days (often combined as "Days 6 & 7")
  if (dayOfWeek === 6 || dayOfWeek === 7) {
    // Try multiple variations of weekend day titles
    const weekendPatterns = [
      "Days? 6 & 7",
      "Days? 6 and 7",
      "Day 6 & 7",
      "Weekend",
      "Rest.*Recovery",
    ];

    for (const pattern of weekendPatterns) {
      const content = extractSectionContent(markdownText, pattern);
      if (content) return content;
    }

    // If no weekend section found, try individual day
    dayTitle = `Day ${dayOfWeek}`;
  } else {
    dayTitle = `Day ${dayOfWeek}`;
  }

  return extractSectionContent(markdownText, dayTitle);
}

function extractGeneralInstructions(markdownText) {
  return extractSectionContent(markdownText, "General Instructions");
}

function processMarkdownContent(content) {
  const processed = {
    rawContent: content,
    generalInstructions: extractGeneralInstructions(content),
    days: {},
  };

  // Extract content for each day (1-7)
  for (let day = 1; day <= 7; day++) {
    processed.days[day] = extractDayContent(content, day);
  }

  return processed;
}
