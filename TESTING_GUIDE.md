# BrazilianClean — How to Use the Platform

---

## FOR CLIENTS

### Getting started

Clients don't need to create an account in advance. Everything starts from the homepage. When you click **"Book a Cleaning"**, the platform takes you directly to the booking page at `/request`. If you're not logged in yet, there's a quick registration form right on that page — just enter your name, email, and a password. Your account is created and activated instantly, no email verification required.

If you already have an account, there's a **"Sign in"** link on the same page.

---

### Making a booking request

After logging in, the booking form appears. You'll fill in a few details about the job:

- **Service type** — choose between Standard Clean (regular home cleaning), Deep Clean (thorough top-to-bottom), Post-Construction (after renovations), or Move In/Move Out.
- **Address** — enter the full address including the ZIP code, since the system uses it to find nearby cleaners.
- **Date and time** — pick when you need the service.
- **Home details** — number of bedrooms, bathrooms, and approximate square footage. These affect the price estimate.
- **Frequency** — if you want a one-time service, biweekly (10% discount), or weekly (15% discount).
- **Extras** — optional add-ons like Inside Fridge ($45), Oven Cleaning ($35), Windows ($90), or Carpet Cleaning ($70).
- **Phone number** — so the cleaner can reach you after being accepted.

The page shows a real-time price estimate as you fill in the details. When ready, click **Submit Booking**.

---

### Waiting for a cleaner

Once submitted, the system automatically looks for available cleaners near you. This matching process happens in waves. First, the highest-ranked cleaner nearby gets an exclusive window to respond. If they don't respond in time, the lead opens to more cleaners. You don't need to do anything during this step — just wait for a notification.

---

### Reviewing and accepting a cleaner

When one or more cleaners respond, you'll see them appear in your **Client Dashboard** under the booking. Each card shows the cleaner's name, rating, and whether they're verified. You can click their name to see their full profile — bio, badges, and review history.

To proceed, click **Accept** on the cleaner you want. The system automatically declines the others and refunds any fees they paid to respond.

---

### Chatting and coordinating

After accepting, a direct chat opens between you and the cleaner. You can go to the **Messages** section or click **Open Chat** on the booking card. Use it to share entry instructions, confirm timing, or ask any questions. Once accepted, the cleaner can also see your phone number on the booking.

---

### Completing the job and leaving a review

After the service is done, go to your dashboard and click **Mark as Completed** on the job. A review prompt will appear — you can leave a star rating from 1 to 5 and an optional written comment. Your review directly affects the cleaner's ranking score on the platform.

---
---

## FOR PROFESSIONALS (CLEANERS)

### Creating your account

Cleaners register through the **"Become a Cleaner"** link on the homepage, which takes you to `/auth/register`. Fill in your name, email, phone number, and password. After submitting, a verification email is sent to your inbox. Click the link in that email to activate your account, then log in.

---

### Completing onboarding

The first time you log in, an onboarding wizard opens automatically. It walks you through four steps:

**Step 1 — Services.** Select which types of cleaning you offer. You can choose any combination of Standard Clean, Deep Clean, Post-Construction, and Move In/Move Out. Only leads matching your selected services will appear in your dashboard.

**Step 2 — Location.** Enter your home address or allow location access. You'll also set your ZIP code (which gives you +10 ranking points for leads in your area) and your service radius — how far you're willing to travel. Options go from 5 miles up to 110 miles.

**Step 3 — About you.** Write a short bio that clients will see on your profile. You can also upload a profile photo here.

**Step 4 — All set.** Review everything and save. You're ready to receive leads.

---

### Choosing a plan

A plan is optional, but it directly affects how often and how quickly you receive leads. Go to **Dashboard → My Plan** to see the options.

The **Free plan** costs nothing but limits you to Wave 2 only (meaning you compete with others for leads) and a maximum radius of 25 miles, with no ranking bonus.

The **Basic plan** ($39/month) gives you access to Wave 1 (where you get an exclusive window before others), expands your radius to 60 miles, and adds +15 points to your CFS ranking score.

The **Pro plan** ($79/month) unlocks Instant Book (the system assigns you the lead directly when your score is high enough), extends your radius to 110 miles, and adds +30 points to your ranking.

To subscribe, click the plan you want and you'll be redirected to Stripe's checkout page. Enter your card details and complete the payment. You're returned to the platform immediately with the plan active.

---

### Getting verified

Verification is optional but strongly recommended — it adds a **Verified** badge to your profile, which increases client trust and affects your ranking.

To apply, click the **Get Verified** banner that appears at the top of your dashboard. You'll fill in your legal name, ID number, and address, then upload three photos: the front of your ID document, the back of the ID, and a selfie holding the ID. Submit the form and wait — an admin reviews it within 48 hours. You'll receive a notification when approved or rejected.

---

### Understanding your ranking (CFS score)

The platform uses a score called **CFS (Cleaner Fit Score)** to decide which cleaners get leads first. Your score is calculated from four factors:

Your **plan** contributes up to 30 points — Free gives 0, Basic gives 15, Pro gives 30. Your **service match** contributes up to 40 points — if you offer exactly the service the client requested, you score higher. Your **rating** contributes up to 20 points based on your average review score. Your **area proximity** contributes up to 10 points — leads in your ZIP code score highest.

The maximum possible score is 100. Cleaners with a score of 85 or above qualify for **Instant Book**, where the system directly assigns the lead to them without any wave competition.

---

### Receiving and responding to leads

When a lead matches your services, radius, and ranking, it appears in the **Available Leads** section of your dashboard. Each card shows the service type, the address, the scheduled date and time, an estimated price range for the job, and the lead fee — the amount you'll pay to unlock the client's contact and conversation.

To respond, click **Accept & Pay $X**. You'll be taken to Stripe to complete the payment. Once paid, the conversation is created, the client is notified, and the lead moves to your **Accepted Jobs** section.

One important detail: in Wave 2, two cleaners can respond at the same time. If another cleaner pays a split second before you, the system detects the conflict and automatically refunds your payment. You only lose the lead fee if you're the one who won and the client later declines you — in that case you're also refunded.

---

### After responding — waiting for client acceptance

After you pay the lead fee, the client receives a notification and can review your profile before deciding. While you wait, the job appears under **Accepted Jobs** in your dashboard. If the client accepts you, a chat opens and you proceed to coordinate the service. If the client declines you, the lead fee is refunded automatically.

---

### Chatting and completing the job

Once accepted, go to **Messages** or click **Open Chat** on the job card. Use the chat to confirm the address details, agree on entry instructions, and discuss any specifics. After being accepted, you can also see the client's phone number directly on the job card.

When the job is done, the client marks it as completed on their side. The job then moves to your history, and any review the client leaves updates your CFS score going forward.

---

### Other pages available to you

**My Plan** — upgrade, downgrade, or manage your Stripe subscription.  
**Profile** — edit your bio, photo, service types, radius, and map location.  
**Finances** — see a history of all lead fees you've paid.  
**Payment Methods** — add or remove saved cards via the Stripe portal.  
**Schedule** — view your upcoming confirmed jobs on a calendar.
