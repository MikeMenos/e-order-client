# Mobile Shell (iOS + Android) with Capacitor

This project now includes a Capacitor shell for publishing to Google Play and Apple App Store.

## What is configured

- Capacitor dependencies in `package.json`
- `capacitor.config.ts` with:
  - `appId: "gr.eorder.app"`
  - `appName: "eorder"`
  - `webDir: "capacitor-web"` (tooling fallback)
  - Optional remote app loading via `CAPACITOR_SERVER_URL`
- Native projects:
  - `android/`
  - `ios/`

## Important: Remote URL mode (for Next.js app)

Because this app is a Next.js app (not static-exported), use a hosted URL in production:

```bash
export CAPACITOR_SERVER_URL="https://mobile.e-order.pro/"
npm run cap:sync
```

Capacitor will load the hosted app in the native shell.

## Scripts

- `npm run cap:sync` -> syncs config/plugins/assets to native projects
- `npm run cap:sync:local` -> syncs using `http://localhost:3000`
- `npm run cap:sync:ios:local` -> syncs iOS only using `http://localhost:3000`
- `npm run cap:open:ios:local` -> syncs iOS with local URL and opens Xcode
- `npm run cap:sync:android:local` -> syncs Android only using `http://10.0.2.2:3000`
- `npm run cap:open:android:local` -> syncs Android with emulator URL and opens Android Studio
- `npm run cap:copy` -> copies web assets/config only
- `npm run cap:open:android` -> opens Android Studio project
- `npm run cap:open:ios` -> opens Xcode project

## Build workflow

1. Set `CAPACITOR_SERVER_URL` to production HTTPS domain.
2. Run `npm run cap:sync`.
3. Open native IDE:
   - Android: `npm run cap:open:android`
   - iOS: `npm run cap:open:ios`
4. Configure signing:
   - Android keystore + Play App Signing
   - Apple team, bundle signing, provisioning profiles
5. Produce release artifacts:
   - Android `.aab`
   - iOS archive upload via Xcode Organizer

## Notes

- The `capacitor-web/index.html` file is a required fallback entry for Capacitor tooling.
- If `CAPACITOR_SERVER_URL` is not set, the fallback page is what the shell loads.
- For store submission, always use a stable production `https://` URL.

## Local iOS development (Simulator)

1. Run your app in another terminal:
   - `npm run dev`
2. Sync iOS shell against local server:
   - `npm run cap:sync:ios:local`
3. Open Xcode:
   - `npm run cap:open:ios`
   - or `npm run cap:open:ios:local`
4. In Xcode press `Cmd + R` to launch Simulator.

## Local Android development (Emulator)

1. Run your app in another terminal:
   - `npm run dev`
2. Sync Android shell against emulator host mapping:
   - `npm run cap:sync:android:local`
3. Open Android Studio:
   - `npm run cap:open:android`
   - or `npm run cap:open:android:local`
4. Run the app on an Android emulator.

Note: Android emulator cannot use `localhost` for host machine services. Use `10.0.2.2`.
