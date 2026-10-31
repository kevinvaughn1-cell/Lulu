# Lulu Artisan Goods

A simple, phone-friendly catalog site with order requests. Plain HTML/CSS/JS, so there's no build step.

## Deploy on Netlify
1. In Netlify: **Add new site → Import an existing project → GitHub**, then pick this repo. Leave the build command empty and set the publish directory to `.`
2. After the first deploy, go to **Site configuration → Forms** and turn on form detection if it isn't already on, then redeploy.
3. Under **Forms → Form notifications**, add an **Email notification** for the `order` form so every order request lands in your inbox.

(Or skip GitHub and drag this folder onto https://app.netlify.com/drop.)

## Editing products
Everything (names, prices, descriptions, options, fabrics) lives in `catalog.js`. Photos are in `images/`.
