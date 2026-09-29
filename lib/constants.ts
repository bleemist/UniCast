export const COOKIE_NAME = "unicast_session";

export const STATION_NAME = "UniCast";
export const STATION_FREQUENCY = "Online Radio Network";
export const STATION_TAGLINE = "Your Campus Pulse";
export const DEFAULT_STREAM_URL =
  process.env.NEXT_PUBLIC_RADIO_STREAM_URL ||
  process.env.NEXT_PUBLIC_STREAM_URL ||
  "https://stream.zeno.fm/f3wvbbqmdg8uv";
