import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The directory above this repo has its own lockfile, so Turbopack infers the
  // wrong workspace root and fails to resolve `next`. Pin it to this project.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
