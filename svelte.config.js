import { readFileSync } from 'node:fs';
import adapter from '@sveltejs/adapter-cloudflare';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/** @type {import("@sveltejs/kit").Config} */
export default {
  kit: {
    adapter: adapter({
      config: './wrangler.jsonc'
    }),
    version: { name: pkg.version }
  }
};
