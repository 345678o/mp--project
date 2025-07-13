import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        "timers/promises": false,
        "fs/promises": false,
        buffer: false,
        util: false,
        events: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        constants: false,
        domain: false,
        dns: false,
        dgram: false,
        cluster: false,
        module: false,
        vm: false,
        inspector: false,
        perf_hooks: false,
        readline: false,
        repl: false,
        tty: false,
        v8: false,
        worker_threads: false,
      };
    }
    
    // Ignore MongoDB warnings in client-side builds
    config.ignoreWarnings = [
      { module: /node_modules\/mongodb/ },
      { module: /node_modules\/bson/ },
    ];
    
    return config;
  },
  serverExternalPackages: ['mongodb', 'bson'],
};

export default nextConfig;
