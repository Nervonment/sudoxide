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

### To Dev Android
ensure the [prerequirements](https://v2.tauri.app/start/prerequisites/) is confirmed.
```sh
npm install -D @tauri-apps/cli@next
cd ./src-tauri/
npx tauri android init
npx tauri android dev
```

### To Build Android
ensure the [prerequirements](https://v2.tauri.app/start/prerequisites/) is confirmed.
```sh
npm install -D @tauri-apps/cli@next
cd ./src-tauri/
npx tauri android init
npx tauri android build --target <arch> --debug --apk # if without debug, need sign the apk to install in the real android
                                                      # for this, follow <https://github.com/tauri-apps/tauri-docs/issues/1674#issuecomment-2131307100>
```
