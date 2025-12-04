# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Docusaurus 3.9, deployed to Cloudflare Pages via Wrangler. Uses Solarized light/dark color themes with Infima CSS framework.

## Commands

```bash
npm run start      # Start local dev server with hot reload
npm run build      # Build static site to ./build
npm run preview    # Build and preview with Wrangler Pages locally
npm run deploy     # Build and deploy to Cloudflare Pages
npm run typecheck  # Run TypeScript type checking
npm run clear      # Clear Docusaurus cache
```

## Architecture

- **docusaurus.config.ts** - Main site configuration (blog is the homepage via `routeBasePath: '/'`)
- **blog/** - Blog posts as markdown files with date-prefixed filenames (e.g., `2022-09-25-title.md`)
  - `authors.yml` - Author metadata
  - `tags.yml` - Tag definitions
- **src/css/custom.css** - Solarized theme colors using Infima CSS variables
- **static/img/** - Static images, organized by blog post subdirectories (e.g., `static/img/how-to-fill-knowledge-gaps/`)

## Static Assets

Place images in `static/img/<blog-post-slug>/`. Reference them in markdown as `/img/<blog-post-slug>/filename.ext`.
