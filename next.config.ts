import type { NextConfig } from "next";
import { withRedact } from "@tanstack/redact/next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withRedact(nextConfig);
