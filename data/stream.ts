export interface StreamConfig {
  isLive: boolean;
  disabled?: boolean;
  source: "youtube" | "twitch";
  twitchChannel?: string;
  streamTitle: string;
  nextStreamDate?: string;
}

export const streamConfig: StreamConfig = {
  isLive: false,
  disabled: false,
  source: "youtube",
  streamTitle: "RAAM Live Session",
  nextStreamDate: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(),
};
