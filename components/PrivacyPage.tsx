import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Google Analytics' terms require a privacy notice that discloses its use.
// Keep this in step with lib/analytics.ts and the contact form fields.
const PrivacyPage: React.FC = () => (
  <div className="bg-[#FDF8F5] min-h-screen flex flex-col">
    <Header />

    <main className="flex-grow pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-3xl text-gray-600 leading-relaxed">
        <h1
          className="text-4xl md:text-5xl font-bold text-[#4a4a4a] text-center"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Privacy Notice
        </h1>
        <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto mb-4"></div>
        <p className="text-center text-sm mb-12">
          Last updated October 12, 2026
        </p>

        <h2 className="text-2xl font-bold text-[#4a4a4a] mb-3">
          When you send us an inquiry
        </h2>
        <p className="mb-8">
          Our contact form sends your name, email address, phone number, event
          dates, how you heard about us and your message to us by email, through
          a form service called Formspree. We use it only to reply to you and
          plan your event. We do not sell it.
        </p>

        <h2 className="text-2xl font-bold text-[#4a4a4a] mb-3">
          Website statistics
        </h2>
        <p className="mb-4">
          We use Google Analytics to understand how visitors find and use this
          website: which pages are viewed, what kind of device is used, the
          general area visitors come from and the website that sent them. Google
          Analytics uses cookies to do this. When an inquiry is sent, we also
          record that it happened and the answer to &ldquo;How did you hear
          about us?&rdquo; &mdash; never your name, contact details or message.
        </p>
        <p className="mb-8">
          Read{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4a4a4a] underline hover:text-[#A2B29F]"
          >
            how Google uses information from sites that use its services
          </a>
          . To opt out, install the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4a4a4a] underline hover:text-[#A2B29F]"
          >
            Google Analytics opt-out browser add-on
          </a>{' '}
          or block cookies in your browser.
        </p>

        <h2 className="text-2xl font-bold text-[#4a4a4a] mb-3">
          Maps, calendar and fonts
        </h2>
        <p className="mb-8">
          Our map, availability calendar and fonts are provided by Google, which
          receives standard technical information, such as your internet
          address, when they load.
        </p>

        <h2 className="text-2xl font-bold text-[#4a4a4a] mb-3">Questions</h2>
        <p>
          Email{' '}
          <a
            href="mailto:sunsetwillowevents@gmail.com"
            className="text-[#4a4a4a] underline hover:text-[#A2B29F]"
          >
            sunsetwillowevents@gmail.com
          </a>{' '}
          or call{' '}
          <a
            href="tel:304-619-6805"
            className="text-[#4a4a4a] underline hover:text-[#A2B29F]"
          >
            (304) 619-6805
          </a>
          .
        </p>
      </div>
    </main>

    <Footer />
  </div>
);

export default PrivacyPage;
