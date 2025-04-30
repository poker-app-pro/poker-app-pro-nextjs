"use client";

import React from "react";
import { Amplify } from "aws-amplify";
import amplifyConfig from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
 
Amplify.configure(amplifyConfig, { ssr: true });

export const client = generateClient<Schema>()

export default function AmplifyClientSide({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
