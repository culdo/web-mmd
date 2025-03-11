# Web-MMD
<p align="center">
  <a href="https://culdo.github.io/web-mmd/">
    <img alt="Web-MMD" src="tests/index.spec.ts-snapshots/changing-camera-mode-with-saving-config-3-Google-Chrome-darwin.png" width="80%"/>
  </a>
</p>

[> Try it now ! <](https://culdo.github.io/web-mmd/)

For who wants to play MMD in the browser, now you can play it anywhere.

This project is inspired by [the amazing three.js example](https://takahirox.github.io/three.js/examples/webgl_loader_mmd_audio.html) which by @takahirox.

# Features
* Play MMD with time control bar(time seeking, jump to time...etc)
* Change Model, Stage, Motion, Camera and Music(From YT or file)
* Turn on/off auto camera(can play manually)
* Adjust shadow/outline/color/...etc
* Layout settings (Auto-hide gui/Show FPS/Fullscreen...etc)
* Presets (open/save-as/copy/export as `JSON` format)
* Camera Composition mode (create/delete/jump forward/backward camera cuts)
* Camera Fixed-Follow mode (can adjust using mouse)
* Camera Editor mode (can edit on dope-sheet timeline)
* Keyboard Shortcuts(play/pause, toggle camera mode, manipulate camera cuts...)

# Keyboard shortcuts
* **Space**: Play/Pause
* **`** : Toggle Camera mode (between motion and composite mode)
* **<** : Previous frame (under 30 fps) 
* **\>** : Next frame (under 30 fps)
* At camera composite mode
  * **→** : Previous keyframe
  * **←** : Next keyframe

# Demo credits
* music: GimmexGimme by 八王子P × Giga
* model: つみ式みくさんv4 by つみだんご
* motion: ぎみぎみ（みっちゃん）_原曲音源 by シガー
* emotion: GimmeGimmeリップ表情v07 by ノン
* camera: Gimme x Gimme镜头 by 冬菇
* stage: RedialC_EpRoomDS by RedialC

# Development
1. Install deps via `npm install`
2. Run `npm run dev`
* Modules which mainly come from [the three.js example](https://threejs.org/examples/#webgl_loader_mmd_audio) is refactored to Classes and Async/Await styles.
* This projects is refactored to using `Next.js`(TypeScript).

## Tech stacks
* `three.js` (For MMD)
* `postprocessing.js` (For effects)
* `theatre.js` (For camera editor mode)
* `Next.js` (For static site generating)
* `media-chrome` (For audio from YT)
* `playwright` (For testing)

## E2E Testing using Playwright
Run `npm test`

## CI/CD
It uses `Github Action` to deploy the demo site. Relative files located at `./.github/workflows`.

# To-do list
## Done
- [x] play/pause
- [x] turn on/off shawdow
- [x] choose light color
- [x] player control bar
- [x] can choose different model, stage, motion, camera, music
- [x] Layout settings
- [x] Auto-save all gui settings in browser
- [x] Open/Save-As/Copy/Export MMD presets
- [x] SDEF rendering
- [x] camera Fixed-Follow mode
- [x] PBR rendering
- [x] refactor to Typescript
- [x] refactor to @react-three eco-system
- [x] Skybox rendering
- [x] timeline editor
    - [x] camera composition mode
    - [x] camera editor mode (using Theatre.js)

## WIP
- [ ] Better bone animation

## Planning
- [ ] In-APP Credits list
- [ ] Efficient Bokeh effect
