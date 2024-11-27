import { FarcasterSettings } from "src/settings";
import { Cast, CastsResponse, ChannelsResponse } from "./types";

export class Client {
  settings: FarcasterSettings;

  constructor(settings: FarcasterSettings) {
    this.settings = settings;
  }

  updateSettings(settings: FarcasterSettings) {
    this.settings = settings;
  }

  async doRequest(method: string, url: string, body: any): Promise<Response> {
    let headers: Record<string, string> = {
      "accept": "application/json",
      "content-type": "application/json",
    };
    if (this.settings.customAPI && this.settings.neynarAPIKey) {
      headers["x-api-key"] = this.settings.neynarAPIKey;
    }

    let options: RequestInit = {
      method: method,
      headers: headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }
    console.log("doRequest", url, options);
    return await fetch(url, options);
  }

  async publishCast(text: string): Promise<Response> {
    if (!this.settings.signerUUID) {
      throw new Error("No signer UUID set");
    }
    console.log("publishing cast: ");
    let url = this.settings.apiBaseUrl + "/cast";

    let resp = await this.doRequest("POST", url, {
      signer_uuid: this.settings.signerUUID,
      text: text,
    });

    if (resp.status === 200) {
      return resp;
    } else {
      throw new Error(
        `Failed to publish cast: ${resp.status} ${resp.statusText}`,
      );
    }
  }

  async getChannelFeed(ids: string[]): Promise<CastsResponse> {
    let path = "/feed/channels" +
      `?with_recasts=true&channel_ids=${
        ids.join(",")
      }&fid=${this.settings.fid}&viewer_fid=${this.settings.fid}`;
    return await this.getFeedCasts(this.settings.apiBaseUrl + path);
  }

  async getFeed(f: string): Promise<CastsResponse> {
    let path = "/feed/" + f +
      `?with_recasts=true&fid=${this.settings.fid}&viewer_fid=${this.settings.fid}&limit=50`;
    let url = this.settings.apiBaseUrl + path;
    return await this.getFeedCasts(url);
  }

  async getFeedCasts(url: string): Promise<CastsResponse> {
    let resp = await this.doRequest("GET", url, null);

    if (resp.status !== 200) {
      throw new Error(
        `Failed to get cast feed ${resp.status} ${resp.statusText}`,
      );
    }
    let result = await resp.json();
    let castResponse = result as CastsResponse;
    if (castResponse.casts) {
      console.log("Casts response", castResponse);
      return castResponse;
    }

    throw new Error("Invalid response");
  }

  async getUserChannels(): Promise<ChannelsResponse> {
    let path = `/user/channels?limit=100&fid=${this.settings.fid}`;
    let url = this.settings.apiBaseUrl + path;
    let resp = await this.doRequest("GET", url, null);
    if (resp.status !== 200) {
      throw new Error(
        `Failed to get user channels ${resp.status} ${resp.statusText}`,
      );
    }
    let result = await resp.json();
    let channelsResponse = result as ChannelsResponse;
    if (channelsResponse.channels) {
      console.log("Channels response", channelsResponse);
      return channelsResponse;
    }
    throw new Error("Invalid response");
  }

  async getCastByUrl(u: string): Promise<Cast> {
    let path = `/cast?type=url&identifier=${u}&viewer_fid=${this.settings.fid}`;
    let url = this.settings.apiBaseUrl + path;
    let resp = await this.doRequest("GET", url, null);
    if (resp.status !== 200) {
      throw new Error(
        `Failed to get cast by URL ${resp.status} ${resp.statusText}`,
      );
    }
    let result = await resp.json();
    let cast = result?.cast as Cast;
    if (cast) {
      console.log("Cast response", cast);
      return cast;
    }
    throw new Error("Invalid response");
  }
}
