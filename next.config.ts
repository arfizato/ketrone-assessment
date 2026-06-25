import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // @google-cloud/firestore pulls in grpc/native deps — keep it out of the
  // bundle and load it at runtime from node_modules.
  serverExternalPackages: ["@google-cloud/firestore"],
}

export default nextConfig
