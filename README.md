# Work Integrated Learning (W.I.L.) - Men Stand Tall


## Tech stack

- Web: .NET 8 Razor Pages, SignalR, Chart.js, FullCalendar
- Mobile: Android (Kotlin), Firebase Auth, Firestore
- Data: Firebase Firestore collections: `projects`, `tasks`, `events`
- Auth: Firebase Authentication (Email/Password, Google)

## Firebase setup (Web + Mobile)

- Web (Razor Pages)
  - Load Firebase SDK in `_Layout.cshtml` and initialize `firebase.auth()` and `firebase.firestore()` globally (so `window.firebaseAuth` and `window.firebaseDB` are available for pages like Dashboard and AddProjects).
  - Keep keys out of public repos. Use User Secrets for dev and environment variables in prod.

- Mobile (Android)
  - Place `google-services.json` in `app/`.
  - Repositories:
    - `ProjectRepository` (CRUD + real-time stream)
    - `TaskRepository` (CRUD + real-time stream)
    - `AuthRepository` (Email/Password + Google sign-in)

## CI pipeline (GitHub Actions)

- Web: Restore, Build, (optional Test), Publish artifact
- Android: Assemble Release APK and upload artifact
- Optional: Deploy to Azure Web App, Firebase Hosting, or upload to Play Console

## Local development

- Web: `dotnet run` (Razor Pages, .NET 8)
- Android: Open in Android Studio, run on emulator/device

## Notes

- Firestore collections used in both apps: `projects`, `tasks`, `events`
- Real-time UI updates are driven by Firestore reads and SignalR events on the web
- Protect secrets: do not commit credentials or service JSON files
## Documentation

[Documentation](https://docs.google.com/document/d/1gwvdK_JdPA11VeuhOR6JG9u5ksr8MgkAAyRXk0ziYTc/edit?usp=sharing) - documentation to be edited and updated.



## Features

- Task management
- Project management and filtering
- Calendar view
- Cross platform
- Dashboard overview

## Acknowledgment of Tooling (AI & Automation)

I used GitHub Copilot and GitHub Actions (actions bot) to assist with repository hygiene tasks, specifically moving CI workflow files into the correct `.github/workflows` folder and refining YAML syntax. All changes were reviewed and approved by me(Matthew Bothma). These tools were used as productivity aids; design decisions, implementation, and accountability for the code remain mine(Matthew Bothma). 

If this work is subject to academic or organizational integrity policies, this disclosure is intended to be transparent about tool usage. Please note that some commit messages may reference automated actions (e.g., Actions bot).
