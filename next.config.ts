import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Correctly define externals in a format expected by Webpack
      config.externals = [
        ...config.externals,
        {
          "onnxruntime-node": "commonjs onnxruntime-node",
        },
      ];
    }

    return config;
  },
};

export default nextConfig;
