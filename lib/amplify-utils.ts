// src\lib\amplify-utils.ts
import {
  generateServerClientUsingCookies,
  generateServerClientUsingReqRes,
} from "@aws-amplify/adapter-nextjs/api";
import { cookies } from "next/headers";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import amplifyConfig from "@/amplify_outputs.json";
import { Schema } from "@/amplify/data/resource";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
});

export const reqResBasedClient = generateServerClientUsingReqRes<Schema>({
  config: amplifyConfig,
});

export const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: amplifyConfig,
  cookies,
});
