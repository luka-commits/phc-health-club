# Phase 7: Profile Management - Context

**Gathered:** 2025-01-18
**Status:** Ready for planning

<vision>
## How This Should Work

Patienten können ihr komplettes Profil bearbeiten: persönliche Daten, Shipping-Adresse und Billing-Adresse. Die Formulare haben echte Validierung - besonders bei Adressen, da hier Medikamente hingeschickt werden.

Wenn der User speichert, bekommt er klares Feedback: Toast-Meldung bei Erfolg, deutliche Fehlermeldungen wenn etwas fehlt oder falsch ist. Kein Rätselraten ob gespeichert wurde.

</vision>

<essential>
## What Must Be Nailed

- **Shipping-Adresse korrekt** - Hier gehen Medikamente hin, muss 100% funktionieren
- **Klares Feedback** - User muss wissen ob gespeichert wurde oder was fehlt
- **Formular-Validierung** - Pflichtfelder, Format-Prüfung (PLZ, Email, etc.)

</essential>

<specifics>
## Specific Ideas

- Toast-Meldungen für Erfolg/Fehler (Sonner bereits installiert)
- Zod-Validierung für alle Formularfelder
- Separates Speichern pro Sektion (Profil, Shipping, Billing)
- Ladezustand während Speichern

</specifics>

<notes>
## Additional Context

Die Settings-Seite existiert bereits mit UI, aber ohne Speicher-Logik. Diese Phase macht die Formulare funktional.

Fokus auf Patient-Rolle, Provider/Admin Settings können später erweitert werden.

</notes>

---

*Phase: 07-profile-management*
*Context gathered: 2025-01-18*
