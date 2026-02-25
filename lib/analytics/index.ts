/**
 * Analytics Module
 * Main entry point for all analytics tracking
 */

// Re-export all event definitions
export * from "./events";

// Re-export all Hotjar/Contentsquare tracking functions
export {
  trackEvent,
  identifyUser,
  tagRecording,
  trackPageViewed,
  trackWalletConnected,
  trackWalletDisconnected,
  trackBumicertCardClicked,
  trackBumicertDetailViewed,
  trackBumicertFlowStarted,
  trackStepViewed,
  trackStepCompleted,
  trackBumicertPublished,
  trackFlowAbandoned,
  trackError,
  getStepName,
  getFlowDurationSeconds,
} from "./hotjar";
