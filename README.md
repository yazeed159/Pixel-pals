# Pixel Companion

A personal pixel-art chat app: talk to an AI character (a dog in bed, a therapist, a fox at a campfire) shown as a tiny scene with a typed-out dialogue box. Tap the scene to advance. Runs in any browser on PC and Android. No build step.

## Run it
Open `index.html` in a browser. With no API key it gives demo replies. Open **Setup** to pick a provider (Claude, ChatGPT, Gemini, OpenRouter, or any OpenAI-compatible URL) and paste a key.

Your key and chats are stored only in your browser (localStorage). Nothing secret lives in this repo.

## Where things live
```
index.html          page layout and the settings dialog
css/style.css       all styling
js/config.js        settings, saved chats, system prompt
js/art/core.js      canvas helper, time-of-day palettes, scene registry
js/art/dog.js       the dog sprite
js/scenes/          one file per scene (bed, therapy, camp)
js/dialogue.js      typewriter text, tap to advance, typing sound
js/chat.js          AI providers, sending messages, greetings
js/ui.js            settings dialog and the sun / scene buttons
js/main.js          startup (loads last)
```
Scripts load in the order listed in `index.html`, and they share globals, so it also works when opened straight from disk.

## Add a scene
1. Create `js/scenes/rooftop.js`:
```js
function drawRooftop(s){ /* draw with px(x,y,w,h,color) on the 160x90 canvas; s = time-of-day palette */ }
SCENES.rooftop={label:'Rooftop at night',icon:'🌃',name:'Robo',
  prompt:'You are {pet}, a friendly robot on a rooftop...',
  greet:'Hello there!',back:'Welcome back!',draw:drawRooftop};
```
2. Add `<script src="js/scenes/rooftop.js"></script>` in `index.html` before `js/dialogue.js`.

It then shows up in Setup and on the scene button automatically.

## Deploy (Cloudflare Pages)
Push this folder to GitHub, then in Cloudflare: Workers & Pages -> Create -> Pages -> Import an existing Git repository. Leave the build command blank and set the output directory to `/`. Every push to `main` redeploys.
