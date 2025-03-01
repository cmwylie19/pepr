import Log from "../telemetry/logger";
import { fetch } from "undici";

const PEPR_INFORMER_URL = process.env.PEPR_INFORMER_URL || "http://localhost:8080";

export type WatchEvent = {
  eventType: "ADDED" | "MODIFIED" | "DELETED";
  details: string;
};

export type WatchType = {
  group: string;
  version?: string;
  resource: string;
  namespace?: string;
};

/**
 * Send a request to the Go backend to start watching a resource.
 * Returns the `natsTopic` to subscribe to.
 */
async function startWatch(watchTarget: WatchType): Promise<string | null> {
  try {
    const req = await fetch(`${PEPR_INFORMER_URL}/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(watchTarget),
    });

    if (!req.ok) {
      throw new Error(`Failed to start watch: ${req.statusText}`);
    }

    const { natsTopic } = (await req.json()) as { natsTopic: string };
    Log.info(
      `Started watch for ${watchTarget.group}/${watchTarget.version}/${watchTarget.resource} in namespace ${watchTarget.namespace || "all"} - Listening on: ${natsTopic}`,
    );

    return natsTopic;
  } catch (error) {
    Log.error(`Failed to start watch: ${error}`);
    return null;
  }
}

export { startWatch };
