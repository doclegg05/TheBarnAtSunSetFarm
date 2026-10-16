/**
 * Questions for the homepage FAQ, grouped by topic.
 *
 * Every published answer restates something the venue has already put in
 * writing (this site, its packages, or Sunset Willow's flyer). Questions
 * whose answer is a policy only the owner can set have `answer: null` —
 * they stay hidden until he confirms the wording. Never guess a policy
 * here: couples treat FAQ answers as promises.
 */
export interface FaqItem {
  question: string;
  answer: string | null;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Booking & Pricing',
    items: [
      {
        question: 'How much does it cost?',
        answer:
          'Packages start at $3,800. The Classic Celebration is a one-day rental of the barn, porch and outdoor areas. The Sunset Weekend runs Friday to Sunday and adds tables and chairs, rehearsal dinner space, the bridal suite and groom’s quarters, and an overnight stay for the couple. Send us your date for an exact quote.',
      },
      {
        question: 'How do I check whether my date is available?',
        answer:
          'Look at the availability calendar on this page, then send us an inquiry with your date and we’ll confirm it.',
      },
      {
        question: 'Can we visit before we book?',
        answer:
          'Yes. Tours are by appointment only. Send us an inquiry or call (304) 619-6805 to set up a time.',
      },
      {
        question: 'What kinds of events do you host?',
        answer: 'Weddings, elopements, family reunions and other celebrations.',
      },
      {
        question: 'How much is the deposit, and when are payments due?',
        answer: null,
      },
      {
        question: 'What is your cancellation and rescheduling policy?',
        answer: null,
      },
    ],
  },
  {
    title: 'The Venue',
    items: [
      {
        question: 'What is the venue capacity?',
        answer:
          'We can comfortably accommodate up to 200 guests for both the ceremony and reception, ensuring an intimate and enjoyable experience for everyone.',
      },
      {
        question: 'Is there parking on-site?',
        answer: 'Yes, we have ample parking available for all your guests.',
      },
      {
        question: 'Is the venue wheelchair accessible?',
        answer:
          'Yes, our facilities are wheelchair accessible. The last stretch of road to the farm is gravel, so tell us about any guests’ needs when you inquire and we’ll help plan for them.',
      },
      {
        question: 'Is there Wi-Fi?',
        answer: 'Yes, free Wi-Fi is available for you and your guests.',
      },
      {
        question: 'What happens if it rains?',
        answer: null,
      },
    ],
  },
  {
    title: 'Planning, Vendors & Décor',
    items: [
      {
        question: 'Can we bring our own vendors?',
        answer:
          'We have a curated list of preferred vendors we love and trust, but you are welcome to bring your own licensed and insured professionals for catering, photography, and florals.',
      },
      {
        question: 'Do you require event insurance?',
        answer:
          'Yes, we require a standard event insurance policy for the day of your wedding. This protects both you and the venue and is a standard practice in the industry.',
      },
      {
        question: 'Do you offer event planning or day-of coordination?',
        answer:
          'Yes. Our partner, Sunset Willow Event Planning, offers full-service planning and day-of coordination and knows the barn’s layout, logistics and policies. Contact Heather Tharp at (304) 619-6805 or MUHeather08@gmail.com to ask about availability and packages.',
      },
      {
        question: 'Are tables and chairs provided?',
        answer:
          'Tables and chairs are included in the Sunset Weekend package. If you’re booking the Classic Celebration, ask us about your options.',
      },
      {
        question: 'Can we serve alcohol?',
        answer: null,
      },
      {
        question: 'Is there a kitchen or prep space for our caterer?',
        answer: null,
      },
      {
        question: 'When can we set up, and when does cleanup need to finish?',
        answer: null,
      },
      {
        question: 'Is there an end time or a music cutoff?',
        answer: null,
      },
      {
        question:
          'Are there decoration rules (candles, sparklers, confetti, hanging items)?',
        answer: null,
      },
    ],
  },
  {
    title: 'Staying Overnight',
    items: [
      {
        question: 'Can we and our guests stay on the property?',
        answer:
          'Yes. The property sleeps up to 15 guests across five bedrooms in the barn and a one-bedroom cottage. The Sunset Weekend includes an overnight stay for the couple, and the Classic Celebration can add a night in the cottage.',
      },
      {
        question: 'What are the check-in and check-out times?',
        answer: null,
      },
      {
        question: 'Are pets allowed?',
        answer: null,
      },
    ],
  },
  {
    title: 'Getting Here',
    items: [
      {
        question: 'Where are you located?',
        answer:
          '86 Harper Ln, Mount Nebo, WV 26679, in Nicholas County overlooking the Gauley River Gorge, just minutes from Summersville and the New River Gorge.',
      },
      {
        question: 'Why can’t my GPS find your address?',
        answer:
          'Our address is new, so most GPS apps can’t find it yet. Use the Google Maps or Apple Maps buttons in the Get In Touch section below: they go straight to our exact location. The last stretch is a gravel road.',
      },
    ],
  },
];

/** Only questions with a confirmed answer, and only topics that have one. */
export function publishedFaqCategories(
  categories: FaqCategory[] = FAQ_CATEGORIES
): { title: string; items: { question: string; answer: string }[] }[] {
  return categories
    .map((category) => ({
      title: category.title,
      items: category.items.flatMap((item) =>
        item.answer ? [{ question: item.question, answer: item.answer }] : []
      ),
    }))
    .filter((category) => category.items.length > 0);
}
