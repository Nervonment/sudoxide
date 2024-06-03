A sudoku app made with [Tauri](https://tauri.app) and [Next.js](https://nextjs.org).

## Run & Build

### To Run
```sh
npm run tauri dev
```

### To Build
Change the bundle identifier in `src-tauri/tauri.conf.json > tauri > bundle > identifier` to `"com.tauri.build"`, then run the command below:
```sh
npm run tauri build
```