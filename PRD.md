# PHC Health Club - Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
PHC Health Club is a comprehensive telehealth platform for hormone optimization, peptide therapy, and lifestyle coaching. The platform connects patients with healthcare providers (MDs, PAs, NPs) for personalized treatment plans, blood work management, prescription refills, and ongoing wellness support.

### 1.2 Business Objectives
- Streamline patient-provider communication and consultations
- Automate blood work ordering and prescription refill scheduling
- Provide patients with comprehensive health tracking and education
- Enable providers to efficiently manage large patient panels
- Increase patient retention through engagement features (vision boards, gamification)
- Track business metrics (revenue, expenses, margins)

### 1.3 Target Users
| User Type | Description |
|-----------|-------------|
| **Patients** | Individuals seeking hormone optimization, peptide therapy, and wellness coaching |
| **Providers (PA/NP)** | Licensed practitioners managing assigned patients based on state licensure |
| **Providers (MD)** | Physicians with 50-state licenses who can order labs and prescriptions for all patients |
| **Admins** | Operations staff managing the clinic, product catalog, and financial reports |

---

## 2. User Roles & Permissions

### 2.1 Patient
- View and update personal information (shipping address, billing)
- View current treatment plan
- View blood work history and charts
- Write and view lifestyle notes
- Browse product catalog
- View blood work and refill schedules
- Request additional blood work
- Toggle auto-refill on/off for medications
- Book video consultations
- Message provider via text portal
- Sign off on treatment plan updates

### 2.2 Provider (PA/NP)
- View assigned patients only (based on state licensure)
- View/respond to messages from assigned patients only
- View their own schedule
- View patient treatment plans, blood work, and notes
- Add notes/charts for patients
- Request blood work orders (submitted to MD for approval)
- View product catalog
- View blood work and refill schedules for their patients

### 2.3 Provider (MD)
- View ALL patients in the clinic
- Respond to messages from any patient
- Order blood work (charge patient card, submit to Quest/Labcorp)
- Process prescription refills at compounding pharmacies
- Charge patient cards for products and services
- View and manage blood work and refill schedules
- Flag issues with card payments

### 2.4 Admin
- Full access to all provider schedules
- View all patients in the clinic
- Access all chat/message portals
- Edit product catalog (add/update/remove products)
- View blood work and refill schedules for all patients
- Access financial reports (revenue, expenses, profits, margins)
- Manage compounding pharmacy relationships
- Send clinic-wide notifications

---

## 3. Patient Portal Features

### 3.1 Dashboard / Home

#### 3.1.1 Header Section
- **Patient Name & Information Display**
- **Update Information Button** - Allows editing of:
  - Shipping address (primary)
  - Billing address
  - Payment method on file
- **Book Video Consult Button** - Opens calendar scheduler
- **Text Message Portal Button** - Opens messaging interface
- **Upcoming Appointment Banner** - Prominent notification that cannot be missed when appointment is scheduled

#### 3.1.2 Seasonal Address Notification
- **Trigger**: April and September each year (snowbird season)
- **Action**: System sends notification to ALL patients
- **Content**: Prompt to verify/update shipping address
- **Requirement**: Patient must confirm or update primary address in portal

#### 3.1.3 Navigation Tabs
1. Current Treatment Plan
2. Blood Work History
3. Lifestyle Notes
4. Performance & Fitness
5. Product Catalog
6. Blood Work Schedule
7. Refill Schedule

---

### 3.2 Current Treatment Plan

#### 3.2.1 Content Sections
| Section | Description |
|---------|-------------|
| **Lifestyle Behaviors** | Sleep, stress management, daily habits recommendations |
| **Nutrition** | Dietary guidelines, meal timing, macros if applicable |
| **Training** | Exercise recommendations, frequency, type |
| **Prescriptions** | Current prescription medications with dosing |
| **Peptides** | Current peptide protocols with dosing |
| **Supplements** | Recommended supplements |

#### 3.2.2 Display Requirements
- Each section displays as expandable/collapsible cards
- Items listed as bullet points within each section
- Provider can update during/after consultations
- Patient has read-only access (cannot edit)
- Shows last updated date and by which provider

---

### 3.3 Blood Work History

#### 3.3.1 Search Functionality
- **Search bar**: "Search for biomarker"
- **Behavior**: Typing biomarker name filters and displays relevant results
- **Auto-complete**: Suggests biomarkers as user types

#### 3.3.2 Raw Data Panel
- Displays all blood work results organized by date (newest first)
- Each result shows:
  - Date of test
  - Biomarker name
  - Value
  - Unit
  - Reference range
  - Flag (high/low/normal)

#### 3.3.3 Charts Panel
- **Chart Type**: Line graphs
- **Default View**: Key biomarkers trending over time
- **Interactive**: When user searches for a biomarker, chart updates to show that biomarker's history
- **Data Points**: Each blood work date becomes a point on the graph
- **Y-Axis**: Biomarker value
- **X-Axis**: Date
- **Reference Range**: Shaded area showing optimal range

---

### 3.4 Lifestyle Notes

#### 3.4.1 Meeting Notes Section
- **Organization**: By provider meeting date
- **Format**:
  ```
  Provider Meeting [Date]
  • Note 1
  • Note 2
  • Note 3
  ```
- **Editing**: Patient can add their own notes (free-write)
- **Provider Visibility**: Providers can see patient notes to identify misunderstandings

#### 3.4.2 Body Metrics Tracking
- **Weight tracking** with historical chart
- **Body circumference measurements**:
  - Waist
  - Chest
  - Arms
  - Thighs
  - Hips
- **Entry**: Patient can manually enter measurements
- **Display**: Charts showing trends over time

#### 3.4.3 Vision Board (Future Enhancement)
- **Purpose**: Patient engagement and retention
- **Functionality**: Patients can customize their portal with goals, images, motivational content
- **Rationale**: "If client invests time building and customizing their portal, they are less likely to leave"

#### 3.4.4 Gamification (Future Enhancement)
- Achievement badges
- Streak tracking (consistent check-ins, measurements, etc.)
- Progress milestones

---

### 3.5 Performance & Fitness

#### 3.5.1 PR (Personal Record) Tracking
- Track gym PRs for major lifts
- Historical view of strength progress

#### 3.5.2 Fitness Notes
- Free-form notes about workouts
- Training log

#### 3.5.3 Nutrition Tracking
- Basic nutrition logging capability

#### 3.5.4 Third-Party Integration (Future)
- Potential integration with STNDRD app
- API connection for automatic data sync

---

### 3.6 Product Catalog

#### 3.6.1 Search & Organization
- **Search bar**: "Search for prescription, peptide, or supplement"
- **Category folders organized by goals**:
  - Muscle Building
  - Fat Loss
  - Energy Enhancement
  - Cognitive Clarity
  - Skin Texture
  - Hair Growth
  - Libido Enhancement

#### 3.6.2 Product Detail View
Each product displays as expandable tabs:

| Tab | Content |
|-----|---------|
| **Short Description** | Bullet points of how product works |
| **Long Description** | PubMed-style scientific write-up (expandable) |
| **Cost** | Pricing information |
| **Dosing** | Dosing guidelines with disclaimer: "For educational purposes only" |

#### 3.6.3 E-Commerce (Future Enhancement)
- Add to cart functionality
- Direct checkout for peptides and supplements
- Subscribe & save options

---

### 3.7 Blood Work Schedule

#### 3.7.1 Calendar Display
- **Views**: Monthly and yearly
- **Icons**: Blood drop icon on days when labs are scheduled
- **Click behavior**: Clicking a date shows details

#### 3.7.2 Date Detail View
```
[Date]
Your provider will be ordering new labs for you.
Please make sure to complete them at your earliest
convenience after this date.
```

#### 3.7.3 Request Additional Blood Work
- **Action Button**: "Request Additional Blood Work"
- **Date Picker**: Patient selects preferred date
- **Notification**: Request automatically visible to provider
- **Note**: Additional blood work outside standard schedule will be billed separately

---

### 3.8 Refill Schedule

#### 3.8.1 Calendar Display
- **Views**: Monthly and yearly
- **Icons**: Pill/vial icon on refill dates
- **Click behavior**: Shows what's being refilled that day

#### 3.8.2 Current Medications Panel
Displays all current Rx, peptides, and supplements with:
- Medication name
- Next refill date
- Auto-refill toggle (ON/OFF)

#### 3.8.3 Auto-Refill Rules

| Product Type | Default Setting | Toggle Available |
|--------------|-----------------|------------------|
| Prescriptions | ON (auto-refill) | Yes - can turn OFF |
| Peptides | OFF | Yes - can turn ON |
| Supplements | ON (auto-refill) | Yes - can turn OFF |

#### 3.8.4 Auto-Refill Warning Modal
**Trigger**: Patient attempts to toggle OFF auto-refill for prescription medications

**Modal Content**:
```
Warning

We cannot guarantee delivery of medication and you might
miss doses if you disable auto-refill.

Furthermore, it will be your responsibility to contact
your provider to refill the medication.

[Cancel] [I Understand, Disable Auto-Refill]
```

#### 3.8.5 Subscribe & Save
- Available for peptides
- Discount for committing to recurring orders

---

### 3.9 Appointment Notifications

#### 3.9.1 In-App Notification
- Prominent banner at top of dashboard when appointment is scheduled
- Cannot be dismissed until acknowledged

#### 3.9.2 SMS Reminders
| Timing | Content |
|--------|---------|
| Night before | "Reminder: You have an appointment tomorrow at [TIME] with [PROVIDER]" |
| 2 hours before | "Your appointment with [PROVIDER] starts in 2 hours. Click here to join: [LINK]" |

---

### 3.10 Messaging Portal (Patient Side)

#### 3.10.1 Features
- Text-based messaging with assigned provider
- Photo upload capability
- Copy/paste text support
- Message history preserved
- Read receipts (optional)

#### 3.10.2 Behavior
- Messages go to patient's assigned provider
- If provider is on vacation, messages route to designated backup provider

---

## 4. Video Consultation Features

### 4.1 Meeting Interface Layout

#### 4.1.1 Patient Screen (During Meeting)
```
+------------------------+----------------------------------+
|                        | [Treatment] [Blood] [Notes] [Products] |
|                        +----------------------------------+
|    VIDEO CHAT          |                                  |
|    WITH PROVIDER       |         TAB CONTENT AREA         |
|                        |                                  |
|                        |                                  |
+------------------------+----------------------------------+
|   [Chat Input Box]     |                                  |
+------------------------+----------------------------------+
```

#### 4.1.2 Multi-Party Video Support
- **Requirement**: Support for 4-way video calls
- **Use cases**:
  - Patient + Spouse + Provider + Health Coach
  - Couples consultations

#### 4.1.3 Available Tabs During Meeting (Patient View)
1. Current Treatment Plan
2. Blood Work History
3. Lifestyle Notes
4. Product Catalog

#### 4.1.4 Chat Feature
- Text chat available during video call
- Useful for sharing links, spelling medication names
- Chat history saved to patient record

---

### 4.2 Meeting Conclusion Protocol

#### 4.2.1 Updated Treatment Plan
At end of every meeting:
1. Provider sends updated plan to patient (in writing via chat)
2. Updated plan includes:
   - Prescriptions being ordered
   - Peptides being ordered
   - Supplements being ordered
3. Patient must review and sign off before meeting ends

#### 4.2.2 Patient Sign-Off
- **Modal/Form**: Displays summary of changes
- **Action Required**: Patient clicks "I Agree" or similar
- **Timestamp**: Captures date/time of agreement
- **Record**: Stored in patient record for compliance

---

## 5. Provider Portal Features

### 5.1 Dashboard / Home

#### 5.1.1 Header Section
- Provider name and information
- Update information button (shipping address, billing)

#### 5.1.2 Navigation Tabs
1. Schedule
2. Patients
3. Patient Text Message Portal
4. Messages from Team
5. Product Catalog
6. Blood Work Schedule
7. Refill Schedule
8. Billing

---

### 5.2 Schedule

#### 5.2.1 Calendar Display
- Weekly view with daily columns
- Time slots in 15/30-minute increments
- Shows all appointments for the provider

#### 5.2.2 Appointment Color Coding
| Color | Meeting Type |
|-------|--------------|
| Green | Introductory meeting (initial blood work review) |
| Blue | Follow-up blood work check-up |
| Yellow | Patient-scheduled meeting |

#### 5.2.3 Appointment Preview
- Clicking an appointment shows:
  - Patient name
  - Meeting type
  - Key notes/flags
  - "What provider is walking into"

#### 5.2.4 Admin View
- Admins see ALL provider schedules
- Filter by provider
- View clinic-wide availability

---

### 5.3 Patients List

#### 5.3.1 Display
- List of all patients assigned to provider
- Shows: Name, last appointment, next scheduled, status

#### 5.3.2 Sorting Options
- Alphabetical (A-Z, Z-A)
- Oldest first
- Newest first
- Last activity

#### 5.3.3 Access Control
| Role | Patient Visibility |
|------|-------------------|
| MD | All patients in clinic |
| Admin | All patients in clinic |
| PA/NP | Only their assigned patients (based on state licensure) |

---

### 5.4 Patient Text Message Portal

#### 5.4.1 Features
- Inbox view with all patient conversations
- Unread message indicators (notification badges)
- Photo upload support
- Copy/paste functionality
- Search within messages

#### 5.4.2 Response Time Tracking
- System tracks: Time from original question to initial answer
- Metric visible to admins for provider performance review

#### 5.4.3 Provider Absence Handling
- When provider goes on vacation:
  - Admin assigns backup provider
  - Messages from that provider's patients route to backup
  - Backup provider has full context

#### 5.4.4 Access Control
| Role | Message Visibility |
|------|-------------------|
| MD | All patient messages |
| Admin | All patient messages |
| PA/NP | Only messages from their assigned patients |

#### 5.4.5 Future Scaling
- Dedicated provider for 24/7 message answering as clinic grows
- Triage system for urgent vs. routine questions

---

### 5.5 Messages from Team

#### 5.5.1 Features
- Internal messaging between providers and admin
- Notification badges for unread messages
- Threaded conversations
- @mention support

---

### 5.6 Product Catalog (Provider View)

#### 5.6.1 Purpose
- Providers need to know what they're selling
- Stay current with product information
- Understand costs for patient discussions

#### 5.6.2 Search
- "Search for prescription, peptide, or supplement"

#### 5.6.3 Product Detail View (Provider-Enhanced)
| Tab | Content |
|-----|---------|
| **Short Description** | Bullet points (same as patient view) |
| **Long Description** | PubMed-style write-up (same as patient view) |
| **Cost** | Universal cost shown to patients; Note about backend cost variation |
| **Compounding Pharmacies** | Which pharmacy fulfills based on patient state |

#### 5.6.4 Compounding Pharmacy Example
```
Testosterone

Cost: $XX (patient price)
Backend Note: Actual cost varies $30-70 per vial + shipping
depending on source pharmacy

Compounding Pharmacies:
- Revive: All states except [X, Y, Z]
- Strive: California orders
- Wells: South Carolina orders
```

#### 5.6.5 Product Update Notifications
- Provider receives notification when product information changes
- Ensures providers stay current with latest research

#### 5.6.6 Admin Editing
- Only Admins can add/edit/remove products
- COO/Admin responsible for building out catalog

---

### 5.7 Blood Work Schedule (Provider View)

#### 5.7.1 Calendar Display
- Shows all dates when labs are ordered for patients
- Patient search filter to view specific patient's schedule

#### 5.7.2 Daily View
```
June 8, 2025
☐ Joe Smith, 6-week blood work
☐ John Doe, 6-month blood work
☐ Phil McCrackin, add-on 3-month blood work $$$
☐ Jake Tyler, add-on 2-month blood work – issues with card, blood work not ordered
```

#### 5.7.3 Checkbox System
- MDs check off when order is placed
- System tracks completion status
- Red flag indicator for issues (payment failed, etc.)

#### 5.7.4 Auto-Population Rules

| Event | Scheduled Blood Work |
|-------|---------------------|
| Initial visit | 8 weeks after (6-week post-product + 2 weeks shipping buffer) |
| Initial visit | 6 months after |
| After each blood work | 6 months later (perpetual) |

#### 5.7.5 Manual Additions
- PA/NP can request additional blood work
- MD must approve and order
- Additional blood work requires card charge before ordering
- If card fails, status shows: "issues with card, blood work not ordered"

#### 5.7.6 Provider Permissions
| Role | Capabilities |
|------|-------------|
| PA/NP | View calendar, request new blood work orders |
| MD | View calendar, approve orders, charge cards, order from Quest/Labcorp |

#### 5.7.7 Automation Goals
- Auto-charge patient card on scheduled date
- Auto-submit order to Quest/Labcorp
- Alert MDs if card issues
- Track order status

---

### 5.8 Refill Schedule (Provider View)

#### 5.8.1 Calendar Display
- Shows all dates when refills are due
- Patient search filter

#### 5.8.2 Daily View with Details
```
June 8, 2025

☐ John Smith, 11/13/1991
  • Medication: Testosterone Cypionate 200 mg/mL Injection
  • Quantity: 10 mL
  • Instructions: Inject 0.2 ml (20 units) subcutaneously once daily.
  • Pharmacy: ReviveRx

☐ John Doe, 6/9/1992
  • Medication: Thyroid Capsules 60 mg
  • Quantity: 90 capsules
  • Instructions: Take 1 capsule by mouth once daily in the morning before meals.
  • Pharmacy: Strive Pharmacy
```

#### 5.8.3 Required Information Per Refill
- Patient name and DOB
- Medication name and concentration/dose
- Quantity of medication (vials or pill count)
- Medication instructions
- Pharmacy used to order

#### 5.8.4 Table View Option
| Medication | Date Written | Last Filled | Date Due |
|------------|--------------|-------------|----------|
| Testosterone Cypionate 200 mg/mL Injection - 10ml | 6/05/25 | 6/06/25 | 7/26/25 |
| Inject 0.2 ml (20 units) subcutaneously once daily. | | [Fills] | |

#### 5.8.5 Auto-Scheduling Logic

**Example 1: Injectable (Testosterone)**
```
Patient dose: 200 mg/week
Vial size: 200 mg/mL, 10 mL
Vial duration: 10 weeks
→ Auto-schedule refills every 10 weeks
```

**Example 2: Oral (Thyroid)**
```
Patient dose: 1 pill/day
Quantity: 90 pills
Duration: 90 days
→ Auto-schedule refills every 90 days
```

#### 5.8.6 Dose Change Handling
- When dose changes, system recalculates refill schedule
- New refill dates auto-populated
- Old schedule replaced

#### 5.8.7 Refill Continuation
Refills continue in perpetuity unless:
- Patient quits clinic
- Medication is discontinued
- Patient toggles off auto-refill

#### 5.8.8 Provider Workflow
1. MDs manually fill each Rx at compounding pharmacy (cannot be automated - regulatory requirement)
2. Before refill: Charge card on file
3. If card fails: Flag in system, notify patient, notify PA/NP
4. After successful order: Mark as complete

#### 5.8.9 Compounding Pharmacy Timing Issue
**Warning**: Some compounding pharmacies won't dispense controlled medications early
- System must account for pharmacy rules
- May need to adjust charge timing vs. order timing
- Communicate delays to patients

---

### 5.9 Billing

#### 5.9.1 Search
- "Search for product sale"

#### 5.9.2 Transaction History View
| Date | Item | Staff Member | Invoice | Status | Amount | Balance |
|------|------|--------------|---------|--------|--------|---------|
| Sep 16, 2024 | test1 | | Patient Invoice 1-P01... | Paid | $2.00 | $0.00 |

#### 5.9.3 Patient Statement View
```
Account:
[Patient Name]
[Address]
Tel: [Phone]
Email: [Email]

Summary:
Total Invoiced | Total Paid | Balance
$2.00          | $2.00      | $0.00

Statement:
Date | # | Payer | Item | Credit | Debit
[Details...]
```

#### 5.9.4 Provider Actions
- View billing history for any patient
- Send receipts to patients via email
- Charge card for new products ordered
- Charge card for peptide orders requested via text

#### 5.9.5 Payment Failure Handling
- Alert sent to MD
- Alert sent to PA/NP (for communication with patient)
- Alert sent to patient
- Product/service not delivered until payment resolved

#### 5.9.6 Patient Notifications
- Alert when card is charged for refill
- Alert when card is declined
- Prompt to update payment method

---

## 6. Video Consultation Features (Provider Side)

### 6.1 Meeting Interface Layout

```
+------------------------+----------------------------------+
|                        | [Treatment] [Blood] [Notes] [Products] [Billing] |
|                        +----------------------------------+
|    VIDEO CHAT          |                                  |
|    WITH PATIENT        |         TAB CONTENT AREA         |
|                        |                                  |
|                        |                                  |
+------------------------+----------------------------------+
|   [Chat Input Box]     |                                  |
+------------------------+----------------------------------+
```

### 6.2 Available Tabs (Provider View)
1. **Current Treatment Plan** - Editable during meeting
2. **Blood Work History** - View raw data and charts
3. **Notes/Charts** - Provider notes + patient intake form
4. **Product Catalog** - Reference during discussion
5. **Billing** - Charge for new products discussed

### 6.3 Treatment Plan Editing
- Provider can edit all sections during meeting
- If patient mentions address change, provider can update (copy/paste from chat)
- Changes immediately visible to patient

### 6.4 Notes/Charts Tab

#### 6.4.1 Provider Charts/Notes
- Organized by date
- Standardized format (to be determined with MDs)
- Ensures continuity if provider changes

#### 6.4.2 Patient Intake Form Access
- View original intake form data
- Reference during consultations

#### 6.4.3 Patient Notes Visibility
- Provider can see what patient wrote in their lifestyle notes
- Helps identify misunderstandings
- "Providers will say X and patient will interpret Y based on their own pre-existing bias"

### 6.5 Billing Tab (During Meeting)
- Provider can charge card for products discussed
- Real-time receipt generation
- Email receipt to patient

---

## 7. Admin Portal Features

### 7.1 Full Access Areas
- All provider schedules
- All patients in clinic
- All chat portals (patient and team)
- Product catalog (edit access)
- All blood work and refill schedules

### 7.2 Financial Reports

#### 7.2.1 Revenue Reports
- Total revenue by period
- Revenue by product category
- Revenue by provider

#### 7.2.2 Expense Reports
- Compounding pharmacy costs
- Lab costs (Quest/Labcorp)
- Operating expenses

#### 7.2.3 Profit Analysis
- Gross profit by product
- Net profit by period
- Margin analysis
- "Always re-evaluate to see how margins can increase"

### 7.3 Product Catalog Management
- Add new products (Rx, peptides, supplements)
- Update product information
- Set pricing
- Manage compounding pharmacy assignments by state
- Send notifications when products change

---

## 8. Notifications System

### 8.1 Patient Notifications

| Trigger | Channel | Timing |
|---------|---------|--------|
| Appointment scheduled | In-app, Email | Immediately |
| Appointment reminder | SMS | Night before |
| Appointment reminder | SMS | 2 hours before |
| Card charged for refill | Email, In-app | Immediately |
| Card declined | Email, SMS, In-app | Immediately |
| Blood work order placed | Email, In-app | Immediately |
| New message from provider | In-app | Real-time |
| Address verification | Email, In-app | April 1, September 1 |
| Treatment plan updated | In-app | After meeting |

### 8.2 Provider Notifications

| Trigger | Channel | Timing |
|---------|---------|--------|
| New message from patient | In-app | Real-time |
| Product information updated | In-app | Immediately |
| Card payment failed | In-app | Immediately |
| Blood work request from patient | In-app | Immediately |
| New appointment booked | In-app | Immediately |

### 8.3 Admin Notifications

| Trigger | Channel | Timing |
|---------|---------|--------|
| Payment failures | In-app, Email | Daily digest |
| Provider response time alerts | In-app | When threshold exceeded |
| New patient signup | In-app | Immediately |

---

## 9. Technical Requirements

### 9.1 Integrations

#### 9.1.1 Laboratory Services
- **Quest Diagnostics** - Blood work ordering
- **Labcorp** - Blood work ordering (alternative)
- API integration for order submission and results retrieval

#### 9.1.2 Compounding Pharmacies
- **ReviveRx** - Most states
- **Strive Pharmacy** - California
- **Wells Pharmacy** - South Carolina
- Additional pharmacies as needed by state regulations

#### 9.1.3 Payment Processing
- Credit card storage (PCI compliant)
- Recurring billing
- Failed payment retry logic
- Receipt generation

#### 9.1.4 Video Conferencing
- 4-party video support minimum
- Screen sharing capability
- In-meeting chat
- Recording (with consent) - optional

#### 9.1.5 SMS/Messaging
- Transactional SMS for reminders
- HIPAA-compliant messaging within portal

### 9.2 Security & Compliance

#### 9.2.1 HIPAA Compliance
- All PHI encrypted at rest and in transit
- Audit logging for all data access
- Business Associate Agreements with all vendors

#### 9.2.2 Authentication
- Secure login (email/password minimum)
- Optional 2FA
- Session timeout after inactivity
- Password requirements enforcement

#### 9.2.3 Authorization
- Role-based access control (RBAC)
- State-based patient assignment (PA/NP licensure)
- Audit trail for permission changes

### 9.3 Data Requirements

#### 9.3.1 Patient Data
- Personal information (name, DOB, contact)
- Shipping addresses (multiple, with primary designation)
- Billing information (cards on file)
- Medical history
- Blood work results
- Treatment plans
- Medications/prescriptions
- Messages
- Notes

#### 9.3.2 Provider Data
- Personal information
- Credentials/licenses (state licensure tracking)
- Schedule/availability
- Patient assignments
- Response time metrics

#### 9.3.3 Product Data
- Name, category
- Short/long descriptions
- Pricing (patient-facing and cost)
- Dosing information
- Compounding pharmacy mapping by state

---

## 10. User Interface Requirements

### 10.1 General Guidelines
- Clean, professional medical aesthetic
- Easy navigation between sections
- Mobile-responsive design
- Accessible (WCAG 2.1 AA minimum)

### 10.2 Dashboard Patterns
- Tab-based navigation for main sections
- Cards for displaying grouped information
- Tables for list/schedule views
- Line charts for biomarker trends

### 10.3 Calendar Component
- Monthly and yearly views
- Icons/badges on dates with events
- Click to expand date details
- Color coding by event type

---

## 11. Terms & Conditions / Legal

### 11.1 Display Requirements
- Terms and conditions link in footer of all portal pages
- Consent required at signup
- Re-consent required for material changes

### 11.2 Disclaimers
- Product catalog dosing: "For educational purposes only"
- Auto-refill toggle warning for prescriptions
- Treatment plan sign-off before meeting conclusion

---

## 12. Future Enhancements (Roadmap Ideas)

### 12.1 Phase 2 Considerations
- Vision board functionality
- Gamification (badges, streaks, achievements)
- STNDRD app integration
- E-commerce checkout for peptides/supplements
- AI-assisted message responses
- Dedicated 24/7 message provider scaling

### 12.2 Phase 3 Considerations
- Mobile native apps (iOS/Android)
- Wearable integration (Apple Watch, Whoop, etc.)
- Advanced analytics dashboard
- Patient community features

---

## 13. Success Metrics

### 13.1 Patient Metrics
- Patient retention rate
- Portal engagement (logins, feature usage)
- Appointment attendance rate
- Auto-refill opt-in rate
- Patient satisfaction scores

### 13.2 Provider Metrics
- Average message response time
- Patients per provider capacity
- Appointment completion rate
- Treatment plan compliance monitoring

### 13.3 Business Metrics
- Revenue per patient
- Product margins
- Payment failure rate
- Patient lifetime value
- Churn rate

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Biomarker** | A measurable substance in the body (e.g., testosterone level, cholesterol) |
| **Compounding Pharmacy** | A pharmacy that customizes medications to meet specific patient needs |
| **PA** | Physician Assistant |
| **NP** | Nurse Practitioner |
| **MD** | Medical Doctor |
| **Peptide** | Short chains of amino acids used therapeutically |
| **PRs** | Personal Records (fitness achievements) |
| **Rx** | Prescription medication |
| **Snowbird** | Patients who seasonally relocate (typically to warmer climates in winter) |

---

## 15. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Generated from Software Draft | Initial PRD creation |

---

*This PRD is based on the PHC Health Club Software Draft 1 document and captures all specified requirements. Additional clarification may be needed from stakeholders on specific implementation details.*
