export interface StreamConfig {
  isLive: boolean;
  disabled?: boolean;
  youtubeUrl?: string;
  streamTitle: string;
  nextStreamDate?: string;
}

export const streamConfig: StreamConfig = {
  isLive: false,
  disabled: false,
  streamTitle: "RAAM Live Session",
  nextStreamDate: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(),
};
