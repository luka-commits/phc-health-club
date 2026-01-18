# PHC Health Club

## What This Is

Telemedizin-Portal für Hormon- und Peptidtherapie für Thrive Telehealth (thrivehrt.com).
Eine Web-App (responsive) die Patienten, Provider (Ärzte/PA/NP) und Admins verbindet.

## Core Value

Patienten können ihre Behandlungspläne einsehen, Blutwerte tracken, Refills managen und mit ihren Providern kommunizieren. Provider können Patienten verwalten, Treatment Plans erstellen und Termine koordinieren.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **File Storage**: Supabase Storage
- **OCR**: OpenAI Vision API (geplant)
- **Payments**: Stripe (geplant)
- **SMS**: Twilio (geplant)
- **Email**: Resend (geplant)

## Key Decisions

- HIPAA-fähige Architektur (Audit Logging, RLS, Session Timeout)
- Single-Tenant (nur Thrive)
- Video via externe Links (Zoom/Google Meet)
- Email + Passwort Auth
- Responsive Web (kein Native)

## Repository

`/Users/lukaknieling/Desktop/Custom software/phc-health-club`

## Links

- Supabase: https://chrnfjocblwqmxpmefqj.supabase.co
