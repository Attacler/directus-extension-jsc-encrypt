import { defineHook } from "@directus/extensions-sdk";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export default defineHook(({ filter, action }, { env }) => {
  const totalEncryptionFields: { [key: string]: string[] } = {};

  for (const fields of env.DE_ENCRYPTION) {
    const [collection] = fields.split(".");

    if (totalEncryptionFields[collection] == undefined)
      totalEncryptionFields[collection] = [];

    (totalEncryptionFields as any)[collection].push(
      fields.replace(collection + ".", "")
    );
  }

  action("items.read", async ({ collection, payload }) => {
    if (totalEncryptionFields[collection] != null) {
      for (const item of payload)
        for (const field of (totalEncryptionFields as any)[collection])
          if (item[field] != null && item[field].length > 0)
            item[field] = decrypt(item[field], env.DE_KEY);
    }
  });

  filter("items.update", async (payload: any, meta) => {
    const { collection } = meta;

    if (totalEncryptionFields[collection] != null)
      for (const field of (totalEncryptionFields as any)[collection])
        if (payload[field] != null && payload[field].length > 0)
          payload[field] = encrypt(payload[field], env.DE_KEY);
  });

  filter("items.create", async (payload: any, meta) => {
    const { collection } = meta;

    if (totalEncryptionFields[collection] != null)
      for (const field of (totalEncryptionFields as any)[collection])
        if (payload[field] != null && payload[field].length > 0)
          payload[field] = encrypt(payload[field], env.DE_KEY);
  });
});

const algorithm = "aes-256-ctr";

function encrypt(text: any, secretKey: string) {
  const Isstring = typeof text == "string" ? 1 : 0;
  if (!Isstring) text = JSON.stringify(text);

  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return Isstring + ":" + iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(stringToDecode: string, secretKey: string) {
  const [Isstring, iv, content] = stringToDecode.split(":");
  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv as string, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content as string, "hex")),
    decipher.final(),
  ]);
  const output = decrpyted.toString();

  if (Isstring != "1") {
    try {
      return JSON.parse(output);
    } catch (error) {
      return output;
    }
  } else {
    return output;
  }
}
