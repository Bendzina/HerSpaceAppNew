# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


1. Base Setup (what you already did ✅)
Navigation (tabs + stack)
Theme / Language context
Welcome screen (with animation)
Settings screen (dark mode, language toggle)
Dagi AI Chat UI
2. Authentication Flow (next big step)
 Login & Register screens (email/password)
 JWT auth integration with backend (/auth/login/, /auth/register/)
 Store tokens in AsyncStorage
 Auto-redirect unauthenticated → Welcome/Login
 Token refresh flow
👉 ამის მერე შეძლებ backend–თან ყველა endpoint–ის გამოყენებას.
3. Core Features Integration
📓 Journal
 Create Entry (POST /journal/)
 View Entries List (GET /journal/)
 Single Entry View / Delete
🎭 Mood
 Mood picker (happy, sad, neutral, etc)
 POST to /moods/
 Mood history chart (GET /moods/)
🔮 Ritual Library
 List rituals (GET /rituals/)
 Ritual detail (GET /rituals/:id)
 Mark ritual as completed (POST /rituals/complete/)
4. Progress & Profile
 Progress screen with stats (streak, completed rituals, journal count, moods)
 Charts (maybe react-native-svg-charts or VictoryNative)
 Profile screen (username, joined date, settings shortcut)
5. Community (Phase 2 🌸)
ეს დამატებითია, მაგრამ ძლიერი ღერძი გახდება:
 Community feed (posts from users → /community/posts/)
 Post detail (likes, comments)
 Create post (text + optional image)
 Simple chat or groups (optional first version → only comments under posts)
👉 შეგიძლია დაიწყოს ძალიან მარტივად, როგორც journaling–ის საჯარო ვერსია.
მაგალითად:
შენი journal entry → შეგიძლია share–ად community feed–ში.
სხვები მხოლოდ “💜 react” და კომენტარს აკეთებენ.
6. Polish & Experience
 Lottie animations (welcome, rituals complete, mood selected)
 Push notifications (reminders for journal, meditation)
 App icons & branding (HerSpace theme 💜)
 Final onboarding flow (“What is your focus?” screen)
🌟 MVP Checklist (before community):
Auth ✅
Journal ✅
Mood ✅
Rituals ✅
Profile/Progress ✅
Dagi AI ✅
ამის მერე community ჩასვავ როგორც “bonus wow factor” 🚀