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
    console.log(
      "publishing cast: ",
      this.signerUUID,
      text,
    );
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
}