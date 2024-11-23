export const publishCast = async (
  apiKey: string,
  signerUUID: string,
  text: string,
): Promise<Response> => {
  const resp = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      signer_uuid: signerUUID,
      text: text,
    }),
  });
  if (resp.status === 200) {
    return resp;
  } else {
    throw new Error(
      `Failed to publish cast: ${resp.status} ${resp.statusText}`,
    );
  }
};
