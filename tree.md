```
sgee_project
├─ backend
│  ├─ .dockerignore
│  ├─ .editorconfig
│  ├─ .env
│  ├─ .env.docker
│  ├─ .env.example
│  ├─ .markdownlintignore
│  ├─ .phpunit.result.cache
│  ├─ API_DOCUMENTATION.md
│  ├─ app
│  │  ├─ Console
│  │  │  ├─ Commands
│  │  │  │  └─ FinalizeDocumentNotifications.php
│  │  │  └─ Kernel.php
│  │  ├─ Exceptions
│  │  │  └─ Handler.php
│  │  ├─ Exports
│  │  │  └─ EtudiantsExport.php
│  │  ├─ Jobs
│  │  │  └─ SendEmailJob.php
│  │  ├─ Mail
│  │  │  ├─ EnrollementValidatedMail.php
│  │  │  ├─ LoginConfirmationMail.php
│  │  │  ├─ PasswordResetMail.php
│  │  │  ├─ VerificationMail.php
│  │  │  └─ WelcomeMail.php
│  │  ├─ Models
│  │  │  ├─ CentreDepot.php
│  │  │  ├─ CentreExamen.php
│  │  │  ├─ Concours.php
│  │  │  ├─ Departement.php
│  │  │  ├─ Document.php
│  │  │  ├─ Enrollement.php
│  │  │  ├─ Etudiant.php
│  │  │  ├─ Filiere.php
│  │  │  ├─ Niveau.php
│  │  │  ├─ Notification.php
│  │  │  ├─ Paiement.php
│  │  │  ├─ Permission.php
│  │  │  ├─ QR_token.php
│  │  │  ├─ Role.php
│  │  │  └─ User.php
│  │  ├─ Policies
│  │  │  └─ EnrollementPolicy.php
│  │  ├─ Providers
│  │  │  ├─ AppServiceProvider.php
│  │  │  ├─ AuthServiceProvider.php
│  │  │  ├─ BroadcastServiceProvider.php
│  │  │  ├─ EventServiceProvider.php
│  │  │  └─ RouteServiceProvider.php
│  │  └─ Services
│  │     ├─ ChatService.php
│  │     └─ NotificationService.php
│  ├─ artisan
│  ├─ bootstrap
│  │  ├─ app.php
│  │  └─ cache
│  │     ├─ packages.php
│  │     └─ services.php
│  ├─ composer.json
│  ├─ composer.lock
│  ├─ config
│  │  ├─ app.php
│  │  ├─ auth.php
│  │  ├─ broadcasting.php
│  │  ├─ cache.php
│  │  ├─ cors.php
│  │  ├─ excel.php
│  │  ├─ filesystems.php
│  │  ├─ hashing.php
│  │  ├─ logging.php
│  │  ├─ mail.php
│  │  ├─ queue.php
│  │  ├─ sanctum.php
│  │  ├─ services.php
│  │  ├─ session.php
│  │  └─ view.php
│  ├─ docker
│  │  ├─ nginx
│  │  │  └─ laravel.conf
│  │  ├─ nginx.conf
│  │  ├─ start.sh
│  │  └─ supervisord.conf
│  ├─ Dockerfile
│  ├─ phpunit.xml
│  ├─ Procfile
│  ├─ public
│  │  ├─ .htaccess
│  │  ├─ favicon.ico
│  │  ├─ index.php
│  │  └─ robots.txt
│  ├─ README.Docker.md
│  ├─ README.md
│  ├─ resources
│  │  ├─ css
│  │  │  └─ app.css
│  │  ├─ js
│  │  │  ├─ app.js
│  │  │  └─ bootstrap.js
│  │  └─ views
│  │     ├─ emails
│  │     │  ├─ enrollement-validated.blade.php
│  │     │  ├─ login_notification.blade.php
│  │     │  ├─ password-reset.blade.php
│  │     │  ├─ verification.blade.php
│  │     │  └─ welcome.blade.php
│  │     ├─ pdf
│  │     │  ├─ enrollement.blade.php
│  │     │  └─ etudiants-departement.blade.php
│  │     └─ welcome.blade.php
│  └─ routes
│     ├─ api.php
│     ├─ channels.php
│     ├─ console.php
│     └─ web.php
├─ compose.yaml
└─ frontend
   ├─ .dockerignore
   ├─ .env
   ├─ .env.production
   ├─ dist
   │  ├─ assets
   │  │  ├─ index-BVXuLzNH.css
   │  │  └─ index-DJcYsh1X.js
   │  ├─ index.html
   │  └─ vite.svg
   ├─ Dockerfile
   ├─ index.html
   ├─ nginx.conf
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  └─ vite.svg
   ├─ README.Docker.md
   ├─ README.md
   ├─ src
   │  ├─ App.tsx
   │  ├─ components
   │  │  ├─ ChatWidget.tsx
   │  │  ├─ ConcoursSelector.tsx
   │  │  ├─ Layout.tsx
   │  │  └─ UserGuide.tsx
   │  ├─ contexts
   │  │  ├─ AuthContext.tsx
   │  │  └─ EnrollementContext.tsx
   │  ├─ hooks
   │  │  └─ useNotifications.ts
   │  ├─ index.css
   │  ├─ main.tsx
   │  ├─ pages
   │  │  ├─ admin
   │  │  │  ├─ AdminConcours.tsx
   │  │  │  ├─ AdminDashboard.tsx
   │  │  │  ├─ AdminDepartements.tsx
   │  │  │  ├─ AdminDocuments.tsx
   │  │  │  └─ AdminPaiements.tsx
   │  │  ├─ agent
   │  │  │  ├─ AgentDashboard.tsx
   │  │  │  └─ AgentDocuments.tsx
   │  │  ├─ centre-depot
   │  │  ├─ Dashboard.tsx
   │  │  ├─ Documents.tsx
   │  │  ├─ Enrollement.tsx
   │  │  ├─ EnrollementList.tsx
   │  │  ├─ ForgotPassword.tsx
   │  │  ├─ Login.tsx
   │  │  ├─ NewEnrollement.tsx
   │  │  ├─ Notifications.tsx
   │  │  ├─ Paiement.tsx
   │  │  ├─ Register.tsx
   │  │  ├─ ResetPassword.tsx
   │  │  ├─ StudentProfile.tsx
   │  │  ├─ VerifyEmail.tsx
   │  │  ├─ VerifyEmailCode.tsx
   │  │  └─ VerifyEmailNotice.tsx
   │  ├─ services
   │  │  └─ api.ts
   │  ├─ typescript.svg
   │  └─ vite-env.d.ts
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   └─ vite.config.ts

```