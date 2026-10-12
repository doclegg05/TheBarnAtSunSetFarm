# Google Analytics Setup Guide

The website is ready for Google Analytics, but it stays switched off until you give it your Analytics ID. Once it's on, you'll see visits, where visitors came from, and every inquiry with its "How did you hear about us?" answer. It's free and takes about 20 minutes.

Analytics only runs on the live site (thebarnatsunsetfarm.com). Netlify previews and test copies never send data, so testing won't skew your numbers.

## 1. Create the Analytics property

1. Go to [analytics.google.com](https://analytics.google.com/) and sign in with the business Google account.
2. Click **Start measuring** (or **Admin → Create → Property** if you already use Analytics).
3. Property name: `The Barn at Sunset Farm`. Time zone: **United States – New York**. Currency: **US Dollar**.
4. When asked for a platform, choose **Web**.
5. Website URL: `https://thebarnatsunsetfarm.com`. Stream name: `Website`.
6. Leave **Enhanced measurement** switched on. Click the gear icon next to it, open **Page views → Show advanced settings**, and make sure **Page changes based on browser history events** is ticked. Without it, visits to the Gallery and Virtual Tour pages aren't counted.
7. Copy the **Measurement ID**. It starts with `G-`.

You can ignore Google's "install your tag" instructions. The website already contains the code.

## 2. Give the ID to the website

1. Sign in to [Netlify](https://app.netlify.com/) and open the **thebarnatsunsetfarm** project.
2. Go to **Project configuration → Environment variables → Add a variable**.
3. Key: `VITE_GA_MEASUREMENT_ID`. Value: the `G-…` ID from step 1.
4. Go to **Deploys → Trigger deploy → Deploy project**. The ID only takes effect after a fresh deploy.

## 3. Check it works

1. Open [thebarnatsunsetfarm.com](https://thebarnatsunsetfarm.com) on your phone.
2. In Analytics, open **Reports → Realtime**. Your visit should appear within a minute.

## 4. Turn on the inquiry reports (one time)

So Analytics can show inquiries by source:

1. **Admin → Data display → Custom definitions → Create custom dimension.**
   - Dimension name: `How did you hear about us`
   - Scope: **Event**
   - Event parameter: `heard_about`
2. **Admin → Data display → Key events → New key event.** Enter `generate_lead` and save. This counts each sent inquiry as a key result.

Reports start filling in from the day you complete these steps. Earlier inquiries aren't added retroactively.

## Reading the numbers each month

- **Inquiries by source:** **Explore → Free form.** Add the dimension `How did you hear about us` as rows and `Key events` as values. Filter `Event name` exactly matches `generate_lead`.
- **Where visitors come from:** **Reports → Acquisition → Traffic acquisition.**
- **Clicks to The Knot and WeddingWire:** **Explore → Free form.** Add `Link domain` as rows and `Event count` as values. Filter `Event name` exactly matches `click`.

## What is and isn't recorded

- **Recorded:** page visits, rough location, device type, the site that sent the visitor, each sent inquiry with its "How did you hear about us?" answer, and clicks to The Knot, WeddingWire, and other outside links.
- **Never recorded:** names, email addresses, phone numbers, messages, or the "Other" free-text answer. Google Analytics doesn't allow personal details, and the code never sends them.
- **Disclosure:** the website's [Privacy Notice](https://thebarnatsunsetfarm.com/privacy) explains this to visitors, as Google's terms require. Update it if what you collect changes.
