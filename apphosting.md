# Settings for Backend (on Cloud Run).
# See https://firebase.google.com/docs/app-hosting/configure#cloud-run
runConfig:
  minInstances: 0
  # maxInstances: 100
  # concurrency: 80
  # cpu: 1
  # memoryMiB: 512

# Environment variables and secrets.
env:
  # Firebase configuration
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: "AIzaSyBlw_fzjEs-NbOabJkHEpGbfBdDEt7RVvI"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    value: "galatea-ai.firebaseapp.com"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_DATABASE_URL
    value: "https://galatea-ai-default-rtdb.firebaseio.com"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    value: "galatea-ai"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    value: "galatea-ai.firebasestorage.app"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    value: "727737899444"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    value: "1:727737899444:web:16152c4885a96302af7ae1"
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    value: "G-6ZQT56XSCV"
    availability:
      - BUILD
      - RUNTIME

  # Grant access to secrets in Cloud Secret Manager.
  # See https://firebase.google.com/docs/app-hosting/configure#secret-parameters
  # - variable: MY_SECRET
