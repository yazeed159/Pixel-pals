# Pixel Companion

A personal pixel-art chat app: talk to an AI character (a dog in bed, a therapist, a fox at a campfire) shown as a tiny scene with a typed-out dialogue box. Tap the scene to advance. Runs in any browser on PC and Android. No build step.

## Run it
Open `index.html` in a browser. With no API key the characters cannot answer yet (nothing is made up for them). Open **Setup** to pick a provider (Claude, ChatGPT, Gemini, Groq, OpenRouter, or any OpenAI-compatible URL) and paste a key.

Your key and chats are stored only in your browser (localStorage). Nothing secret lives in this repo.

## Where things live
```
index.html          page layout and the settings dialog
css/style.css       all styling
js/config.js        settings, saved chats, system prompt
js/art/core.js      canvas helper, time-of-day palettes, idle timing, seasons, color moods, scene registry
js/art/face.js      mouths, blinks, expressions and small body motions for every character
js/art/chars.js     the six character species, drawChar(), ready-made characters
js/art/dog.js       the dog sprite
js/scenes/          one file per scene (bed, therapy, camp, rooftop, sea, train, diner, library, lighthouse, kitchen, trading)
js/dialogue.js      typewriter text, tap to advance, typing sound
js/chat.js          AI providers, sending/redo/edit, quick replies, memory summaries, check-in, greetings
js/ui.js            settings, character creator, journal, backup/restore, stage buttons
js/look.js          photo mode, seasonal events
js/closing.js       closing the loop: wrap-ups, weekly look-back, milestones, sign-off
js/backgrounds.js   import your own pixel art as a scene
js/sceneeditor.js   scene editor: draw a backdrop, AI scene art with cleanup, share and import scenes
js/sun.js           real sunrise and sunset for your location drives the sky
js/together.js      the Together menu: journal question, breathing, grounding, stories, focus timer, games
js/behavior.js      initiative, sit mode, voices, characters remembering each other, honest mode
js/pace.js          motion setting: normal, calm, static scene (helpers still(), quietMotion(), basePace() are in config.js)
js/i18n-data.js     interface translations (Arabic, Hebrew, Spanish, French), keyed by the English text
js/i18n.js          language switching, right-to-left layout, reply language for the AI
js/welcome.js       the first-run screen
js/main.js          startup (loads last)
manifest.json, icon-*.png          home-screen icon and name
wrangler.jsonc, .assetsignore      Cloudflare deploy config
```
Scripts load in the order listed in `index.html`, and they share globals, so it also works when opened straight from disk.

## Faces: mouths, blinks, expressions (`js/art/face.js`)
One shared system moves every character's face, in every scene and species, so a new scene only has to call `Face.mouth(...)` and `Face.blink()`.
- **Speech:** the mouth follows the letters as they are typed (and as they arrive when a reply streams in). Vowels open in different shapes (A wide, E mid, I a grin, O round, U a small pucker), M/B/P press the lips shut, F/V bite the lower lip, S/Z clench the teeth, L shows the tongue. Commas, full stops, `?` and `!` pause the mouth. Each syllable has a slightly different loudness, and capitals and `!` open wider.
- **Actions in `*asterisks*` are not spoken:** the mouth shows an expression instead (smile, laugh, sigh, yawn, surprise, smirk, "hm"), picked from the words in the action.
- **At rest:** a mood shows (happy: smile and grin, sad: frown and a sigh, sleepy or tired: a drowsy mouth and a yawn with the eyes shut, thinking: a pursed "hm"), plus small random moments (a smile, a smirk, a sigh). After a reply the last punctuation colors the face for a moment (`!` laugh, `?` curious).
- **Eyes:** blinks at irregular intervals, now and then a double blink, slow and heavy when sleepy, going through a half-closed lid. Eyes glance away while talking and look up while thinking. Laughing squints them.
- **Body:** a slow breath, a small nod on stressed syllables, a shake when laughing (off with *reduce motion*). The owl opens its beak.
- It redraws between the 3 fps scene ticks (about 20 fps, only when something on a face changes). `Face.force({v:'A'})` or `Face.force({e:'smile'})` pins a face for screenshots.

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
- **Tap the characters and props** (the dog, the fire, the drone...) for a small reaction. Each scene lists its tappable spots in `hot:` in its scene file.
- **Ambient sound** (Setup > More options) is generated in the browser, one soundscape per scene, and starts after your first tap.
- **Chat bubbles** style shows AI replies live as they stream in. The dialogue box style keeps the typed-out look.
- **Moods:** the character shows a small sign (sparkles, a tear, Zzz) after replies that sound happy, sad or sleepy.
- **/remember** in the chat adds a fact to About you (for example `/remember I have a dog named Max`). `/forget` clears it.
- **Log** shows the chat and exports it as text. Space or Enter advances dialogue when no box is focused.

## Pace and motion (Setup > Pace & motion, `js/pace.js`)
Made for people who find animation distracting, or who want text to arrive more slowly.
- **Normal:** everything moves.
- **Calm:** the scene ticks at half speed (600 ms instead of 300). No body sway, nods, restless rocking, visitors, fireworks or bats. A phone or PC that asks for *reduced motion* starts here.
- **Static scene:** one still picture. The scene loop stops ticking (`tick` is pinned to 0, so every scene shows its resting pose), eyes stay open, the mouth stays closed while talking, there is no gaze, no tap sparkles, no mood signs, no visitors and no CSS animation. Rain and snow are drawn frozen. Time-lapse acts like *Follow the clock*, which redraws once every 30 seconds. Breathing swaps its moving light for counted words ("Breathe in... 1, 2, 3, 4").
- **Typing speed** is separate and now has *Very slow* (90 ms a letter) next to Slow, Normal, Fast and Instant. Static scene plus Instant gives a page where nothing moves at all.
- The first-run screen offers the same Motion choice. To make a new effect respect it, check `quietMotion()` (calm and static) or `still()` (static only), and use `basePace()` instead of a fixed 300.

## Languages and right-to-left text (Setup > Language, `js/i18n.js`)
- **Interface:** English, Arabic, Hebrew, Spanish and French. The page is translated by exact match: each English string in `index.html`, and a few made in code, is a key in `js/i18n-data.js`, and a walker (plus a MutationObserver for text added later) swaps text, placeholders and aria-labels. A string without an entry stays English. Chat text, journal entries, letters and your own names are never touched. Use `T('English text')` for `confirm()` and `alert()`.
- **Replies:** *Replies in* is *The interface language* or *Whatever language I write in*. Either way a LANGUAGE line is added to the system prompt and to the quick-reply prompt, and the model may answer in a regional dialect if you write in one.
- **Right to left:** Arabic and Hebrew set `<html dir="rtl">`, so rows, the stage buttons, the name tag, the dialogue arrow and the chat bubbles mirror. The pixel picture is never mirrored. Each line of dialogue, bubble and text field also takes its own direction from its first letter (`dirOf()`), so an English name inside Arabic text, or Arabic inside English, reads correctly. Photo mode draws right-to-left text right-aligned.
- **Mouths:** `face.js` maps Arabic and Hebrew letters, and any other script by a stable guess, to mouth shapes, skips Arabic harakat and Hebrew niqqud, and treats ؟ ، ؛ as punctuation. Dialogue also breaks after ؟.
- **Still English:** the characters' pre-written lines (scene greetings, tap reactions, silence lines, visitor lines, riddles, grounding steps), scene and character names, and the scene-import dialog. Replies from a real AI model are in your language.
- **Add a language:** add a line to `LANGS` in `i18n.js` (`dir:'rtl'` for a right-to-left one) and a block with the same keys in `i18n-data.js`.

## First-run walkthrough (`js/welcome.js`)
One short screen, shown once on a fresh install: three short blocks on scenes, the API key, and where chats live (chats, key and settings stay on this device; messages go only to the AI provider you pick). Anyone who already has chats or a key is not interrupted. Start, Open Setup and Escape all count as seen. Setup > *Show the welcome screen again* reopens it.

## Deploy (Cloudflare Workers)
Push this folder to GitHub, then in Cloudflare: Workers & Pages -> Create -> Import a repository. Leave the build command blank and keep the deploy command `npx wrangler deploy`. `wrangler.jsonc` serves the repo root as static files and `.assetsignore` keeps repo-only files out of the upload. Every push to `main` redeploys.

## Install as an app (phones and desktop)
Pixel Pals is a PWA: once it is served over HTTPS (the Cloudflare deploy above is), it can be installed and it works offline after the first visit.
- **Android / desktop Chrome and Edge:** open Setup and tap **Install app** (or use the browser menu: Install app / Add to Home screen).
- **iPhone / iPad:** in Safari tap Share, then **Add to Home Screen**. iOS has no install prompt, so Setup shows these steps instead.
- **Offline:** the app shell is cached by `sw.js`. Chats still need a network (or a local model) to get replies.
- **Updating:** online, the newest files are always used first. If you add or rename a file, add it to `SHELL` in `sw.js` and bump `C` (for example `pp-v3`) so installed copies refresh.
- Icons: `icon-192/512.png` (any), `icon-maskable-192/512.png` (padded for Android's round and squircle masks), `apple-touch-icon.png` (iOS).

## Visitors, quiet moods and rituals (`js/life.js`)
- **Visitors:** now and then something small wanders into the scene: a moth at the lamp (bed, library, lighthouse, kitchen, therapy), a stray cat on the rooftop ledge or the kitchen sill, a hedgehog at camp, a mouse in the library and kitchen, a bird at the therapy window, a passing train, someone with an umbrella outside the diner. The character may mention it once, it is tappable, and it is told to the AI so a reply can notice it. Setup > Visitors, moods & rituals sets how often (or Off) and has a **Preview a visitor** button. Add your own by adding a drawer to `VD`, a line to `VK`, and a placement in `PLACEV`.
- **Quiet moods:** after a long talk (about eight exchanges, or most of an hour) the character is *tired* for a few hours: slumped posture, a sleepy sign, and a softer opening. After three or more days away they are *restless*: they rock and hop a little and open eagerly, until you have said a few things. It is worked out from the saved chats, so there is nothing extra to store or clear. The therapy room is excluded. Scenes mark their character with `CH.b()` and `CH.e()` so posture can move only the character; do the same in a new scene.
- **Rituals:** pick Evening tea, Morning coffee, Goodnight or your own, and a time. If you open the app within 90 minutes of it, the character acknowledges it, and notices streaks (day 2, day 4, "back to it" after a break). The days you kept it are saved in your settings. Missing a day is never mentioned as a failure.

## Newer features
- **Idle behavior:** the dog shifts position, the fox pokes the fire, the cat checks the window (and smaller ones elsewhere). Use `ev(period,duration,offset)` and `held(...)` from `core.js` to add your own to a scene.
- **Sky and seasons:** Time of day has Dawn, Day, Sunset, Dusk, Night, or *Follow the clock*. In winter (Setup > More options > Seasons) snow falls in outdoor scenes and in the windows of indoor ones. A scene needs `outdoor:true` or `win:[x,y,w,h]` for that.
- **Colors in this place:** Natural / Warm / Cold / Muted, remembered per scene (the paint-palette button on the scene).
- **Characters:** *Create or edit your own characters* in Setup (species, two colors, name, personality, first line). Pick who plays each scene under *Character here*, so the fox can sit on the train. Scenes mark their character with an `if(PC)drawChar(PC,x,y,2);else{...}` block and give a `setting:` line for the prompt.
- **Long-term memory:** after about 30 unsummarized messages, or when you leave a scene, the AI writes a short summary that is saved and sent with every message, so the thread outlives the last 40 messages. It can be shared by all scenes (this is how a conversation follows you from the bed to the rooftop), kept per scene, or turned off. You can read and edit it in Setup > Memory & journal.
- **Time awareness:** the character is told the local time and how long since you last talked.
- **Daily check-in and Journal:** optional "how was today?" once a day; your answer is saved to the Journal, which you can read, add to and export.
- **Quick replies:** three tappable answers under the text box, always there (Setup > More options > Quick replies). The model must end every reply with them; each one answers what the character just said or asked, goes in a different direction (open up, doubt or joke, ask back), and can be a full sentence or two. If a reply comes without them, or the character speaks unprompted (a silence line, a visitor), one small extra call writes them. Two-character scenes, dreams and rough days get their own options too. Demo mode uses canned ones.
- **Redo / Edit:** *Redo* asks for a different reply; *Edit* takes your last message back into the box.
- **Back up / Restore:** one JSON file with chats, settings, characters, memory and journal. API keys are only included if you say so.

## How the characters behave (Setup > Presence & honesty, plus the Sit button)
- **They speak up:** after about 5 minutes of silence (2, 5, 10 or never) the character says something small in their own voice, and notices rain or snow if it is on. At most two per silence, never while you are typing or a dialog is open. These lines are local (no API call); the character knows it said one if you answer it.
- **Just sit together:** the *Sit* button hides the chat and shows only the scene, with idle movement and the ambient soundscape (even if ambient sound is off in Setup). *Leave* brings the chat back.
- **Distinct voices:** `VOICES` in `behavior.js` gives each one a speech habit (added to the prompt), a typing sound (wave and pitch, used when Typing sound is On) and their own silence lines. The fox tells stories, the cat is dry and brief. Cast characters use their species' voice; add a voice by adding an entry and a `SCENE_VOICE` line.
- **They talk to each other:** in the first two replies of a visit, the character is told what you recently said (last 7 days) to the others, and may mention the gist once ("I hear you've been busy"). Therapy is never shared. Turn off with *They talk to each other: No*, or Long-term memory: Off.
- **They disagree with you:** *How they respond > Honest* adds an instruction to push back plainly and kindly, hold a view unless given a reason, and stay supportive first when you are in distress.

## Things to do together (the Together button)
One activity runs at a time; changing scene or character ends it. *Stop* (a chip, or in the menu) always ends it.
- **Journal question:** the character asks one reflective question (24 built in, not repeating your recent ones). Your answer is saved to the Journal with the question above it, and the character replies in a sentence or two. *Another question* / *Not now* are chips. Saved entries are included in the character's prompt only when the daily check-in is on, same as other journal entries.
- **Breathing:** five slow rounds (in 4, hold 2, out 6) with a light in the top-right corner that grows and shrinks. The scene's animation slows to about half speed and dims slightly. **Grounding** is the 5-4-3-2-1 exercise, one step per tap or answer. Both are local: no API calls, tap reactions are paused.
- **Stories:** *Tell me a story* has the character tell a short one in their own voice. *Write one together* alternates one or two sentences each; *The end* saves the finished story to the Journal.
- **Focus:** pomodoro timer (25/5, 50/10, 15/3 or 90/15). The timer sits next to the scene buttons and in the tab title. The character either works beside you (a small action line every 6 to 10 minutes) or sits quietly. A soft chime at each switch. It never talks over you: lines wait until you have been still for 20 seconds. The timer is not saved if you reload the page.
- **Games:** riddles (14), word chain, and twenty questions in both directions. Riddles and word chain are local and are not added to the chat history. Word chain only checks the first letter and repeats, not spelling. Twenty questions needs an API key; the secret is picked locally so the character keeps to it.

## Making replies feel less generic
- Every character gets a "how to talk" block (`CONVO` in `config.js`): react to what you actually said, have opinions and small stories of their own, no rule about how a reply ends (a question, an idea, a provoking thought, or nothing in particular), vary openings, no therapy-speak. It overrides older brevity lines in scene prompts.
- *Reply length > Natural* now follows the moment (short for small talk, longer when you bring something real). The dialogue box splits at about 260 characters instead of 150, so there are fewer taps.
- The chat sends the last 60 messages instead of 40.
- With no API key there are no canned replies at all: when you send something, the character says an AI key is needed and your message goes back into the text box. Silence lines, tap reactions and visitor lines are still pre-written, but nothing is ever said as if it had understood you.
- Small models (gpt-4o-mini, Gemini Flash) write blander replies than larger ones. Pick a stronger model in Setup if replies still feel thin.

## Closing the loop (Setup > Closing the loop, `js/closing.js`)
Four quiet endings, each with its own On/Off switch. All of it is plain words: no scores, counts, streaks or graphs. It is stored in `cfg.loop`, so backups, restore and *Erase all* cover it.
- **Wrap-up:** when a conversation ends, the AI writes one or two lines about what it was about, and they are saved with the date. A conversation is a stretch of chatting in one place that ends after 30 quiet minutes, when you switch scene, or when the app is closed (it is finished the next time the app opens). Chats with fewer than two messages from you get none. Nothing is written in demo mode.
- **Weekly look-back:** once a week has finished and holds at least two wrap-ups, the AI writes two to four sentences on its themes. The character mentions it once (right away if the screen is quiet, otherwise in the next greeting).
- **Looking back:** Journal > Looking back lists the weekly notes and the wrap-ups. Each can be deleted, and the list exports as .txt.
- **Milestones:** the greeting carries one quiet line when it is your 10th, 25th, 50th, 100th, 250th, 500th or 1000th conversation, or a year (then two, three...) since the first. Each is said once. People who already had chats get their real start date and count worked out from their history. These lines are local; no API call.
- **Sign-off:** when the window is hidden, switched away from, or closed, the dialogue box shows a short line that fits the scene (the Sea has a fin wave), and the tab title shows it too. A web page cannot show anything after it has really closed, so this is what is visible in the tab strip, the app switcher or the moment you leave. Coming back within 30 minutes puts the previous text back; coming back after longer starts a fresh greeting.

## Look and feel
- **Photo mode:** the 📷 button on the stage opens a preview. Choose *Scene only* or *Scene with dialogue* (the dialogue box goes under the picture, like in the app) and 640, 1280 or 1920 px wide, then Save (a PNG) or Share (on phones). The image is always drawn flat, without the depth shift, and crisp: no smoothing.
- **Day and night:** *Time of day > Follow the clock* now blends continuously. The presets are the look at their peak hour (dawn 6:00, day 8:00 to 16:30, sunset 18:00, dusk 19:30, night 21:30 to 4:30) and the sky, walls, floors, window light and the scenes' own tables (rooftop sky, camp hills, sea, lighthouse water, moon ground) blend between them by the minute. *Time-lapse* plays a whole day in two minutes (the stage clock button cycles through it). Stars still switch on at one moment.
- **Seasonal events:** New Year's Eve and Day, fireworks over the rooftop (the character also knows and may mention them). Oct 25 to 31, bats cross the sky in outdoor scenes. Winter (Dec to Feb, or Jun to Aug in the southern hemisphere; Setup > Seasons) puts snow on the camp's pines and ground and thickens the snowfall. *Seasonal events* in Setup can be turned off or previewed.
- **Your own scenes** (Setup > Look & feel > Import your own scenes): pick a PNG, GIF or WebP and it is resized to 160x90 with no smoothing (Fill crops, Fit adds bars, Stretch distorts). Exact 16:9 pixel art works best, at any multiple of 160x90. Choose who is there (any ready-made or your own character), their size and position, whether the picture darkens with the time of day, whether it is outdoors (snow falls in winter), and a sentence describing the place for the character. It is saved in your settings as a small PNG (so it is in backups), and it works as a normal scene: chat, memory, weather, the Together menu, photo mode. It has no tappable hot spots.

## Company: two characters, rough days, letters, dreams (`js/company.js`, Together > Company)
- **Listen in on two characters:** a second character (pick one, or *Surprise me*) stands at the right of the scene and the two of them talk, disagreeing about something small, in their own voices. *Join in* lets you say something and they both react; *New topic* starts over. One AI call writes a few lines at a time. Demo mode plays a canned exchange.
- **Their rough day:** role reversal. The character opens up about a small bad day and you listen; they answer what you say, push back on glib advice, and slowly feel lighter. It is a normal chat underneath, so it is saved in the history.
- **Last night's dream:** a short dream that loosely echoes recent conversations and memory, never explained. One dream per character per day (asking again tells the same one), and it is added to the chat so you can talk about it.
- **Letters** (the Letters button): write to the character in the current scene. The reply is written at the next 8:00 in the morning (at least six hours later) and is longer and more considered than a chat message. It is generated the next time the app is open after that time. *Skip the wait* delivers replies now. A badge shows unread replies and the character mentions it when you arrive. Letters are stored in your settings, so backups include them.

## Groq (Setup > AI provider)
Groq uses the OpenAI-style API (`https://api.groq.com/openai/v1`), so it streams like ChatGPT does. Pick **Groq**, paste a key from console.groq.com, and the model defaults to `llama-3.3-70b-versatile` (change it in *Model name* any time). Everything that calls the AI (chat, memory, quick replies, letters, AI scene art) works with it. Groq's own limits (requests per minute, daily tokens) apply, so a long burst of messages can return a rate-limit error.

## Sunrise and sunset (Setup > Look & feel > Sky follows, `js/sun.js`)
Set *Sky follows* to **Sunrise and sunset where I am** and the *Follow the clock* sky (and the time-lapse) use today's real sunrise and sunset instead of fixed hours: dawn peaks just before sunrise, sunset just before the sun goes, with the same blend as before. Press **Use my location** (the browser asks first) or type `latitude, longitude`. Coordinates are rounded to about 10 km, saved only in this browser (and your backups), and never sent to the AI. The times are read as clock hours on the device, so the device time zone should match the place. Where the sun does not rise or set that day (polar summer or winter) the fixed hours are used. Presets (Dawn, Day...) are unchanged.

## Make and share scenes (Import your own scenes > Draw or generate art, `js/sceneeditor.js`)
- **Draw:** a 160x90 canvas with Pencil, Fill, Line, Box, a color picker, brush sizes, a 16-color palette plus any color, and 40 steps of Undo. *Show who is here* previews the character you picked, at the size and place set in the scene form. *Use this picture* puts the PNG into the scene; press *Save scene* to keep it.
- **AI scene art:** describe a place and the provider you set up paints a simple SVG, which is drawn at 160x90 and then cleaned up: reduced to 6 to 24 colors (median cut) and smoothed with a majority filter so specks and stray edge pixels disappear. *Colors* and *Smoothing* redo the cleanup from the AI's original without another call. Quality varies, so try again or finish it by hand. SVGs with scripts, images, links or styles are refused, and the picture is only ever rendered as an image. It needs an API key.
- **Share:** *Share this scene* makes a small `.pixelscene.json` (picture, name, size and position, outdoors, place sentence, and the character only if it is a ready-made one). It uses the phone's share sheet where there is one, otherwise it downloads. Chats and memory are never included. *Add a shared scene* reads one back: it must be a 160x90 PNG and all values are checked. The place sentence ends up in the character's prompt, so only add scenes from people you trust.
- New interface text here is English only until it is added to `js/i18n-data.js`.

## One conversation across places (`js/handoff.js`)
Moving to another scene no longer starts from nothing. The new character is handed the end of your talk with the one you just left (their last 14 messages, only if you spoke there in the last 6 hours), so it is one conversation told by different personalities. In its **first reply** it shows, in its own voice, that it knows you came from them: a little teasing, wondering how they took it, noticing how different the two are. Then it carries on from where you were, and keeps the thread for the next dozen messages. If you only click through a scene without saying anything, the earlier hand-off carries on to the next one.

The character you left remembers too: when you come back (within 3 days) they may notice you went off to sit with someone else. That is a tiny `cfg.away` note (who you left them for, and when); it is in backups.

It is controlled by Setup > Presence & honesty > **They talk to each other** and needs Long-term memory not set to Off. Therapy stays private in both directions. The transcript goes to the same AI provider as your messages, nowhere else. The older "I heard what you told my friends" line is skipped while a hand-off is active so it does not repeat the transcript.

## Ada, the greenhouse (`js/scenes/trading.js`)
A greenhouse at dusk with Ada, an older woman in round glasses and a sage cardigan who spent a lifetime around money and now tends plants. A potting bench holds a notebook, a cup of tea and a brass balance scale (a coin on one pan, a leaf on the other: risk and reward), with shelves of pots and hanging plants around. It is deliberately calm: the hanging plants sway very slowly and the scale tilts gently, nothing else moves. She is warm, patient and never competitive: she takes the long view and asks what the money is for before any talk of a trade. She explains markets in plain words (how stocks, funds, crypto and options work, orders and fees, charts, position sizing, risk and reward, the habits that cost people money) and thinks in odds, not certainties. She never promises returns or gives a confident buy or sell call, says briefly that she is not a licensed advisor when real money is on the line, has no live prices and says so instead of guessing, and slows people down around leverage, money they cannot afford to lose, and trading to escape stress or win back a loss. If you are having a hard time she sets the markets aside and sits with you first. The scene id is still `trading`, so earlier chats and any character you cast there carry over. The scene label is English only until it is added to `js/i18n-data.js`.

## Removed and simplified
The Moon base (Comet) is gone, including its astronaut voice and the passing rover. The Sea (Luma) is now deliberately calm: one jellyfish drifting slowly, a few bubbles and a still sea floor, with no fish, background jellyfish, whale shadow or passing turtle and ship. Chats you already had on the Moon base stay in your saved data but are no longer reachable; if the Moon base was your selected scene the app opens on the bed instead.
