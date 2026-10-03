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
js/art/core.js      canvas helper, time-of-day palettes, idle timing, seasons, color moods, scene registry
js/art/chars.js     the six character species, drawChar(), ready-made characters
js/art/dog.js       the dog sprite
js/scenes/          one file per scene (bed, therapy, camp, rooftop, sea, moon, train, diner, library, lighthouse, kitchen)
js/dialogue.js      typewriter text, tap to advance, typing sound
js/chat.js          AI providers, sending/redo/edit, quick replies, memory summaries, check-in, greetings
js/ui.js            settings, character creator, journal, backup/restore, stage buttons
js/main.js          startup (loads last)
manifest.json, icon-*.png          home-screen icon and name
wrangler.jsonc, .assetsignore      Cloudflare deploy config
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

## Settings worth knowing
- **About you** is sent to the AI with every message, so the character keeps it in mind.
- **Weather** adds rain or snow over any scene.
- **Tap the characters and props** (the dog, the fire, the robot, the drone...) for a small reaction. Each scene lists its tappable spots in `hot:` in its scene file.
- **Ambient sound** (Setup > More options) is generated in the browser, one soundscape per scene, and starts after your first tap.
- **Chat bubbles** style shows AI replies live as they stream in. The dialogue box style keeps the typed-out look.
- **Moods:** the character shows a small sign (sparkles, a tear, Zzz) after replies that sound happy, sad or sleepy.
- **/remember** in the chat adds a fact to About you (for example `/remember I have a dog named Max`). `/forget` clears it.
- **Log** shows the chat and exports it as text. Space or Enter advances dialogue when no box is focused.

## Deploy (Cloudflare Workers)
Push this folder to GitHub, then in Cloudflare: Workers & Pages -> Create -> Import a repository. Leave the build command blank and keep the deploy command `npx wrangler deploy`. `wrangler.jsonc` serves the repo root as static files and `.assetsignore` keeps repo-only files out of the upload. Every push to `main` redeploys.

On Android, open the site in Chrome and use Add to Home screen to install it.

## Newer features
- **Idle behavior:** the dog shifts position, the fox pokes the fire, the cat checks the window (and smaller ones elsewhere). Use `ev(period,duration,offset)` and `held(...)` from `core.js` to add your own to a scene.
- **Sky and seasons:** Time of day has Dawn, Day, Sunset, Dusk, Night, or *Follow the clock*. In winter (Setup > More options > Seasons) snow falls in outdoor scenes and in the windows of indoor ones. A scene needs `outdoor:true` or `win:[x,y,w,h]` for that.
- **Colors in this place:** Natural / Warm / Cold / Muted, remembered per scene (the paint-palette button on the scene).
- **Characters:** *Create or edit your own characters* in Setup (species, two colors, name, personality, first line). Pick who plays each scene under *Character here*, so the fox can sit on the train. Scenes mark their character with an `if(PC)drawChar(PC,x,y,2);else{...}` block and give a `setting:` line for the prompt.
- **Long-term memory:** after about 30 unsummarized messages, or when you leave a scene, the AI writes a short summary that is saved and sent with every message, so the thread outlives the last 40 messages. It can be shared by all scenes (this is how a conversation follows you from the bed to the rooftop), kept per scene, or turned off. You can read and edit it in Setup > Memory & journal.
- **Time awareness:** the character is told the local time and how long since you last talked.
- **Daily check-in and Journal:** optional "how was today?" once a day; your answer is saved to the Journal, which you can read, add to and export.
- **Quick replies:** two or three suggested answers under the text box (the model adds them; they are hidden from the text).
- **Redo / Edit:** *Redo* asks for a different reply; *Edit* takes your last message back into the box.
- **Back up / Restore:** one JSON file with chats, settings, characters, memory and journal. API keys are only included if you say so.
