// next.config.js (add at very top)
if (
  typeof global !== "undefined" &&
  typeof global.localStorage === "undefined"
) {
  global.localStorage = {
    getItem: (k) => null,
    setItem: (k, v) => {},
    removeItem: (k) => {},
    clear: () => {},
  };
}

/**
 * Initialize Cron Jobs on Server Startup
 * This runs only once when the Next.js server starts
 */
if (typeof global !== "undefined" && !global._cronJobsInitialized) {
  global._cronJobsInitialized = true;

  // Import dynamically to avoid issues with module resolution
  import("./lib/cronJobs.js")
    .then(({ initializeCronJobs }) => {
      console.log("[SERVER-INIT] Initializing cron jobs...");
      // initializeCronJobs();
      console.log("[SERVER-INIT] Cron jobs initialized successfully");
    })
    .catch((error) => {
      console.error(
        "[SERVER-INIT] Failed to initialize cron jobs:",
        error.message,
      );
    });
}
