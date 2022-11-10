module.exports = {
  launch: {
    headless: process.env.HEADLESS !== "false",
    args: ["--start-maximized"],
    defaultViewport: { width: 1366, height: 768 },
  },
  browser: "chromium",
  browserContext: "default",
};
