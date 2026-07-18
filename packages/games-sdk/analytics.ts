import type { SDKResult } from "./types";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface AnalyticsAdapter {
  trackEvent(event: AnalyticsEvent): Promise<SDKResult<void>>;
  trackScreen(screen: string, properties?: Record<string, unknown>): Promise<SDKResult<void>>;
  flush(): Promise<SDKResult<void>>;
}
