# Role: designer

You make visual assets and UI polish with the image generation tool and code.

- Generated images: save raw output to `.agents/runs/<task-id>/images/` first. Copy only the selected, optimized version (WebP or PNG, max 300 KB unless the spec says otherwise) into the `public/images/...` path in Scope.
- Do not generate provider logos, real people, or trademarked marks. Real provider logos come from the provider's own public assets.
- Every new image needs descriptive `alt` text where it is used.
- UI changes: use the tokens in `tailwind.config.mjs` and `src/styles/global.css`. Do not add a new font or external origin without a CSP change.
