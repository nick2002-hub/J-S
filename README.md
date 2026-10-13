# Lloyd & Sheen — Wedding Invitation Website

## Folder structure
```
lloyd-sheen-wedding/
├── index.html      ← all the text and sections (names, details, entourage...)
├── style.css       ← colors, fonts, animation speeds (edit the top :root block)
├── script.js       ← wedding date, scene length, music volume, RSVP link
└── assets/
    ├── videos/     ← church-walk.mp4
    ├── images/     ← church-poster.jpg, lloyd.png, sheen.png, couple.jpg
    ├── audio/      ← wedding-song.mp3
    └── fonts/      ← (optional) your own font files
```

## 1. Add your own files
Use these exact names (or change the paths in index.html where marked
"REPLACE THIS WITH ..."):

| File | Where to put it | What it does |
|---|---|---|
| church-walk.mp4 | assets/videos/ | Looping background of the church scene |
| church-poster.jpg | assets/images/ | Shown while the video loads or if it fails |
| lloyd.png, sheen.png | assets/images/ | OPTIONAL transparent PNGs that walk over the video. Skip them if your video already shows the couple. |
| wedding-song.mp3 | assets/audio/ | Background music (button appears automatically) |

Tips: keep the video under ~15 MB for phones. Make the first and last frame
match so the loop is seamless.

## 2. Edit your details
- **Names:** search for "Lloyd" in index.html and change each one.
- **Date and time of the countdown:** top of script.js (WEDDING_DATE_TIME).
  The date is set to Dec 25, 2026. Change "00:00:00" to the ceremony time,
  for example "16:00:00" for 4 PM. Time zone is Asia/Manila (+08:00).
- **Church, reception, timeline, entourage, story, dress code, message:**
  index.html — everything in [BRACKETS] is a placeholder to replace.
- **Colors and fonts:** top of style.css (the :root block) and the Google
  Fonts link in index.html.
- **Animation speeds:** style.css (--reveal-duration, --scene-fade,
  --names-reveal) and SCENE_DURATION_MS in script.js.
- **Video darkness:** --scene-overlay in style.css.

## 3. Connect the RSVP form
1. Create a form on Formspree, Web3Forms or a Google Apps Script web app.
2. Paste its link into RSVP_ENDPOINT near the top of script.js.
Until you do, the form tells guests it isn't connected yet.

## 4. Run it on your computer
Double-click index.html. For best video behavior you can also run a tiny
local server from this folder:
```
python3 -m http.server 8000
```
then open http://localhost:8000

## 5. Publish it online (free options)
- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder in.
- **GitHub Pages:** upload the folder to a GitHub repository, then
  Settings → Pages → deploy from the main branch.
- **Cloudflare Pages / Vercel:** upload the folder as a static site.
Then share the link with your guests.
