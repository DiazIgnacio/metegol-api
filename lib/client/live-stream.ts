import type { Match } from "@/types/match";

interface LiveMatchUpdate {
  type: "live_matches" | "no_live_matches" | "error";
  matches?: Match[];
  message?: string;
  error?: string;
  timestamp: string;
  count?: number;
}

type LiveStreamCallback = (update: LiveMatchUpdate) => void;

export class LiveMatchStream {
  private eventSource: EventSource | null = null;
  private callbacks: Set<LiveStreamCallback> = new Set();
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  }

  /**
   * Start streaming live matches for specified leagues
   */
  connect(leagueIds: number[]): void {
    if (this.isConnected) {
      console.log("Live stream already connected");
      return;
    }

    if (typeof window === "undefined") {
      console.warn("Live streaming is only available in browser environment");
      return;
    }

    const url = `${this.baseUrl}/api/stream/live-matches?leagues=${leagueIds.join(",")}`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log("🔴 Live stream connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = event => {
        try {
          const update: LiveMatchUpdate = JSON.parse(event.data);
          this.callbacks.forEach(callback => callback(update));
        } catch (error) {
          console.error("Error parsing live stream data:", error);
        }
      };

      this.eventSource.onerror = error => {
        console.error("Live stream error:", error);
        this.isConnected = false;

        // Attempt reconnection with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
          this.reconnectAttempts++;

          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );

          this.reconnectTimeout = setTimeout(() => {
            this.disconnect();
            this.connect(leagueIds);
          }, delay);
        } else {
          console.log("Max reconnection attempts reached");
          this.callbacks.forEach(callback =>
            callback({
              type: "error",
              error: "Connection lost after multiple attempts",
              timestamp: new Date().toISOString(),
            })
          );
        }
      };
    } catch (error) {
      console.error("Failed to create live stream connection:", error);
    }
  }

  /**
   * Disconnect from live stream
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
    console.log("🔴 Live stream disconnected");
  }

  /**
   * Subscribe to live match updates
   */
  subscribe(callback: LiveStreamCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Force reconnection
   */
  reconnect(leagueIds: number[]): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(leagueIds), 1000);
  }
}
