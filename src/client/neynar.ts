import { Cast, CastsResponse, ChannelsResponse } from "./types";

export class Client {
  apiKey: string;
  clientId: string;
  signerUUID: string | null;
  fid: string | null;
  baseUrl: string = "https://api.neynar.com/v2/farcaster";

  constructor(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
    console.log("Client created with API key: ", apiKey);
  }

  setCredentials(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
  }

  setSignerData(signerUUID: string | null, fid: string | null) {
    this.signerUUID = signerUUID;
    this.fid = fid;
    console.log("setSignerData", signerUUID, fid);
  }

  async doRequest(method: string, url: string, body: any): Promise<Response> {
    if (!this.apiKey) {
      throw new Error("No API key set");
    }
    let options: RequestInit = {
      method: method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": this.apiKey,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }
    console.log("doRequest", url, options);
    return await fetch(url, options);
  }

  async publishCast(text: string): Promise<Response> {
    if (!this.signerUUID) {
      throw new Error("No signer UUID set");
    }
    console.log("publishing cast: ");
    let url = this.baseUrl + "/cast";

    let resp = await this.doRequest("POST", url, {
      signer_uuid: this.signerUUID,
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

  async getFeed(): Promise<CastsResponse> {
    let path = "/feed/following" +
      `?with_recasts=true&fid=${this.fid}&viewer_fid=${this.fid}`;
    let url = this.baseUrl + path;
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
  async getCastByUrl(u: string): Promise<Cast> {
    let path = `/cast?type=url&identifier=${u}&viewer_fid=${this.fid}`;
    let url = this.baseUrl + path;
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
