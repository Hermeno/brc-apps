import type { Locale } from '@/lib/i18n';

export interface TermsSection {
  id: string;
  title: string;
  content: string[];
}

export interface TermsContent {
  pageTitle: string;
  lastUpdated: string;
  effectiveDate: string;
  intro: string;
  sections: TermsSection[];
}

const en: TermsContent = {
  pageTitle: 'Terms of Service',
  lastUpdated: 'Last updated: June 19, 2026',
  effectiveDate: 'Effective Date: June 19, 2026',
  intro: 'Please read these Terms of Service carefully before using the BrazilianClean platform. By accessing or using our services, you agree to be bound by these terms.',
  sections: [
    {
      id: 's1',
      title: '1. Acceptance of Terms',
      content: [
        'By creating an account, accessing, or using the BrazilianClean platform ("Platform"), website, or any related services (collectively, "Services"), you agree to be legally bound by these Terms of Service ("Terms"), our Privacy Policy, and all other policies and guidelines incorporated herein by reference.',
        'If you do not agree with any part of these Terms, you must not access or use the Services. These Terms apply to all users of the Platform, including clients (homeowners and property managers) and cleaning professionals ("Cleaners").',
        'Your continued use of the Platform following any updates to these Terms constitutes your acceptance of the revised Terms.',
      ],
    },
    {
      id: 's2',
      title: '2. Important Legal Notice',
      content: [
        'PLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN IMPORTANT INFORMATION ABOUT YOUR LEGAL RIGHTS, REMEDIES, AND OBLIGATIONS.',
        'These Terms include provisions regarding: (a) a binding arbitration agreement and class action waiver that affect your legal rights in the event of a dispute; (b) limitation of liability that limits BrazilianClean\'s legal responsibility to you; and (c) indemnification obligations that require you to protect BrazilianClean from certain legal claims.',
        'By using the Platform, you acknowledge that you have read, understood, and agree to be bound by all of these provisions. If you are a consumer in a jurisdiction that does not permit arbitration clauses, class action waivers, or limitation of liability, certain provisions may not apply to you to the extent prohibited by law.',
      ],
    },
    {
      id: 's3',
      title: '3. Nature of BrazilianClean',
      content: [
        'BrazilianClean is a technology marketplace platform that connects clients seeking cleaning services with independent cleaning professionals. BrazilianClean is NOT a cleaning company and does not itself perform any cleaning services.',
        'BrazilianClean provides the Platform as a neutral intermediary to facilitate connections, scheduling, payment processing, and communication between clients and Cleaners. BrazilianClean does not supervise, direct, control, or monitor the actual cleaning services performed by any Cleaner.',
        'Nothing in these Terms or on the Platform shall be construed to make BrazilianClean the employer, co-employer, staffing agency, or joint employer of any Cleaner. The relationship between BrazilianClean and Cleaners is one of marketplace operator and independent service provider.',
      ],
    },
    {
      id: 's4',
      title: '4. Independent Professionals',
      content: [
        'All Cleaners who provide services through the BrazilianClean Platform are independent contractors, not employees, agents, or representatives of BrazilianClean. Cleaners have the right to perform services for other clients and platforms simultaneously, and are free to set their own schedules, prices, and working conditions.',
        'Cleaners are solely responsible for determining the manner, means, and method of performing their services. BrazilianClean does not dictate how services are to be performed, what tools or supplies to use, or how Cleaners manage their time.',
        'BrazilianClean does not withhold taxes, provide benefits, workers\' compensation, unemployment insurance, or any other employment-related benefits to Cleaners. Each Cleaner is responsible for complying with all applicable federal, state, and local laws governing independent contractors.',
      ],
    },
    {
      id: 's5',
      title: '5. No Employment Relationship',
      content: [
        'No employment, agency, partnership, joint venture, franchise, or fiduciary relationship is created between BrazilianClean and any Cleaner, or between BrazilianClean and any Client, by virtue of these Terms or use of the Platform.',
        'Cleaners acknowledge and agree that they are not entitled to unemployment benefits, workers\' compensation, health insurance, retirement benefits, paid time off, or any other employment benefits from BrazilianClean.',
        'Any representations to the contrary by any person purporting to act on behalf of BrazilianClean are unauthorized and void. If any government authority or court determines that a Cleaner is an employee of BrazilianClean, such determination does not retroactively affect the rights and obligations set forth in these Terms.',
      ],
    },
    {
      id: 's6',
      title: '6. Customer Responsibility',
      content: [
        'Clients are solely responsible for evaluating, selecting, and hiring Cleaners through the Platform. BrazilianClean does not endorse, recommend, or guarantee any particular Cleaner. The decision to engage a specific Cleaner is entirely at the client\'s discretion and risk.',
        'Clients must provide a safe working environment for Cleaners, including: (a) accurate information about the property and scope of work; (b) appropriate access to the property at the scheduled time; (c) disclosure of any known hazards, dangerous conditions, or unusual circumstances that may affect the Cleaner\'s safety.',
        'Clients agree to treat all Cleaners with respect and dignity. Harassment, discrimination, threatening behavior, or any form of abuse toward Cleaners will result in immediate account suspension and may be reported to law enforcement authorities.',
      ],
    },
    {
      id: 's7',
      title: '7. Professional Responsibility',
      content: [
        'Cleaners are solely responsible for: (a) obtaining and maintaining all licenses, permits, certifications, and registrations required by applicable federal, state, and local laws to perform cleaning services; (b) obtaining and maintaining adequate liability insurance and any other insurance required by law or deemed prudent; (c) complying with all applicable occupational health and safety regulations.',
        'Cleaners are responsible for paying all applicable federal, state, and local income taxes, self-employment taxes, and any other taxes arising from income earned through the Platform. BrazilianClean will not withhold any taxes on behalf of Cleaners.',
        'Cleaners must represent their qualifications, experience, and capabilities accurately and completely. Providing false or misleading information in a Cleaner profile will result in immediate account termination.',
      ],
    },
    {
      id: 's8',
      title: '8. No Guarantee of Leads or Income',
      content: [
        'BrazilianClean makes no guarantee, representation, or warranty of any kind that: (a) Cleaners will receive any particular number of leads, job requests, or bookings; (b) Cleaners will earn any specific amount of income or revenue; (c) Clients will find Cleaners available in their area at their desired time; (d) the use of the Platform will result in business growth or increased revenue for Cleaners.',
        'The availability of leads and bookings depends on many factors outside BrazilianClean\'s control, including geographic demand, seasonal fluctuations, competition among Cleaners, and client behavior. Past performance on the Platform does not guarantee future results.',
        'Cleaners should not rely on the Platform as their sole or primary source of income without independently evaluating the business opportunity in their specific market.',
      ],
    },
    {
      id: 's9',
      title: '9. Lead Distribution',
      content: [
        'BrazilianClean uses proprietary algorithms and systems to distribute leads and match clients with Cleaners. Lead distribution may take into account factors including but not limited to: geographic proximity, Cleaner rating and reviews, subscription tier, response rate, booking completion rate, availability, and quality indicators.',
        'BrazilianClean reserves the right to modify its lead distribution algorithms at any time without prior notice. BrazilianClean does not guarantee equal or proportional distribution of leads among Cleaners.',
        'Automation and artificial intelligence may be used in the lead matching and distribution process. Such systems are intended to improve match quality but may not always produce optimal results for all parties.',
      ],
    },
    {
      id: 's10',
      title: '10. Payments',
      content: [
        'All payments for services booked through the Platform are processed by third-party payment processors, currently Stripe, Inc. By making or receiving payments through the Platform, you agree to be bound by the applicable terms and conditions of our payment processor(s).',
        'BrazilianClean collects payment from Clients at the time of booking confirmation. Funds are held securely and released to Cleaners following successful service completion, subject to any applicable fees and the dispute resolution period.',
        'You authorize BrazilianClean and its payment processors to charge your payment method on file for all amounts owed. If payment cannot be processed, your access to the Platform may be suspended until payment is resolved.',
      ],
    },
    {
      id: 's11',
      title: '11. Fees',
      content: [
        'BrazilianClean charges fees for use of the Platform, which may include subscription fees, lead fees, transaction fees, or other service charges. Current fee structures are available on the Platform and may vary by service type, geographic area, and subscription tier.',
        'BrazilianClean reserves the right to change its fees at any time. For Cleaners on paid subscriptions, fee changes will take effect at the next billing cycle with reasonable advance notice. For transaction-based fees, changes may take effect immediately upon posting to the Platform.',
        'All fees are non-refundable except as expressly stated in these Terms or our Refund Policy. By using the Platform, you accept responsibility for all applicable fees.',
      ],
    },
    {
      id: 's12',
      title: '12. Refunds',
      content: [
        'Refund eligibility is governed by our separate Refund Policy, which is incorporated into these Terms by reference. In general: (a) Client cancellations made more than 24 hours before the scheduled service may be eligible for a full refund; (b) cancellations made between 12 and 24 hours before service may receive a partial refund; (c) cancellations made less than 12 hours before service are generally non-refundable.',
        'Lead fees paid by Cleaners are generally non-refundable once a booking has been accepted, except in cases of verified platform error or Client no-show.',
        'Refund requests must be submitted through official support channels within 72 hours of the service date or cancellation event. BrazilianClean reserves the right to approve or deny refund requests at its sole discretion, based on investigation of the circumstances.',
      ],
    },
    {
      id: 's13',
      title: '13. Off-Platform Transactions',
      content: [
        'Any transactions, agreements, or financial arrangements made between Clients and Cleaners outside of the BrazilianClean Platform ("Off-Platform Transactions") are conducted entirely at the risk of the parties involved. BrazilianClean expressly prohibits soliciting off-platform transactions for services originally found through the Platform.',
        'BrazilianClean is not responsible for any loss, damage, fraud, non-payment, or other harm arising from Off-Platform Transactions. Such transactions are not covered by any BrazilianClean protection programs, dispute resolution services, or payment guarantees.',
        'Engaging in Off-Platform Transactions in violation of these Terms may result in account suspension or termination. If you become aware of another user attempting to arrange Off-Platform Transactions, please report this to BrazilianClean immediately.',
      ],
    },
    {
      id: 's14',
      title: '14. User Accounts',
      content: [
        'You must create an account to access most features of the Platform. You agree to: (a) provide accurate, current, and complete information during registration; (b) maintain and promptly update your account information to keep it accurate; (c) maintain the security of your account credentials and not share your password with any third party.',
        'You are responsible for all activity that occurs under your account, whether or not authorized by you. You must notify BrazilianClean immediately at support@brazilianclean.com if you suspect any unauthorized access to or use of your account.',
        'You must be at least 18 years of age to create an account and use the Services. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.',
      ],
    },
    {
      id: 's15',
      title: '15. Prohibited Conduct',
      content: [
        'You agree not to use the Platform for any of the following: (a) fraud, misrepresentation, or impersonation of any person or entity; (b) harassment, threatening, intimidating, or abusing other users; (c) unauthorized data collection, scraping, or harvesting of user information; (d) distributing malware, viruses, or any harmful code; (e) circumventing security measures or access controls.',
        'Additional prohibited conduct includes: (a) posting false, misleading, or defamatory content; (b) sending unsolicited commercial communications ("spam"); (c) manipulating ratings, reviews, or any feedback system; (d) creating multiple accounts to circumvent bans or restrictions; (e) using the Platform to facilitate illegal services.',
        'Violation of any prohibition in this section may result in immediate account termination, legal action, and referral to law enforcement authorities where appropriate.',
      ],
    },
    {
      id: 's16',
      title: '16. Reviews and Content',
      content: [
        'Users may submit reviews, ratings, photos, and other content ("User Content") to the Platform. By submitting User Content, you grant BrazilianClean a non-exclusive, royalty-free, worldwide, perpetual license to use, display, reproduce, modify, and distribute such content in connection with the operation and promotion of the Platform.',
        'BrazilianClean reserves the right, but has no obligation, to review, moderate, edit, or remove any User Content that violates these Terms or is otherwise objectionable, at BrazilianClean\'s sole discretion. Reviews must reflect genuine experiences and may not be incentivized, fabricated, or otherwise manipulated.',
        'BrazilianClean is not liable for any User Content posted on the Platform, and does not endorse any opinion expressed in User Content. You are solely responsible for ensuring that your User Content does not violate applicable law, infringe third-party rights, or constitute defamation.',
      ],
    },
    {
      id: 's17',
      title: '17. Background Checks',
      content: [
        'BrazilianClean may facilitate optional background check verification for Cleaners through third-party screening providers. Background checks are not mandatory and do not constitute a guarantee, warranty, or endorsement of any Cleaner by BrazilianClean.',
        'Background check results are subject to the limitations of available public records and the screening provider\'s methodology. A passed background check does not certify that a Cleaner has no criminal history, poses no risk, or is suitable for any particular client\'s needs.',
        'Clients should exercise their own independent judgment when selecting a Cleaner, regardless of verification status. BrazilianClean is not responsible for any acts or omissions of Cleaners, whether or not they have undergone background screening.',
      ],
    },
    {
      id: 's18',
      title: '18. Insurance Disclaimer',
      content: [
        'BrazilianClean does not provide liability insurance, property damage insurance, workers\' compensation insurance, or any other type of insurance coverage for Clients, Cleaners, or any property associated with services performed through the Platform.',
        'Cleaners are solely responsible for obtaining and maintaining any insurance coverage they deem necessary or that is required by applicable law, including general liability insurance. Clients are encouraged to verify that any Cleaner they engage carries appropriate insurance before services begin.',
        'BrazilianClean expressly disclaims any liability for property damage, personal injury, theft, or any other harm that may occur in connection with cleaning services booked through the Platform. Any insurance-related disputes are solely between the Cleaner, Client, and their respective insurers.',
      ],
    },
    {
      id: 's19',
      title: '19. Immigration Status Disclaimer',
      content: [
        'BrazilianClean does not verify, investigate, or make any representations regarding the immigration or work authorization status of any Cleaner or other user of the Platform.',
        'It is each user\'s sole responsibility to ensure compliance with all applicable immigration and labor laws. Clients who wish to verify a Cleaner\'s work authorization must do so independently through appropriate legal channels. BrazilianClean does not provide legal advice on immigration matters.',
        'BrazilianClean expressly disclaims any liability arising from the immigration status of any Cleaner. All users agree to hold BrazilianClean harmless from any claims, penalties, or liabilities arising from immigration law violations by any party.',
      ],
    },
    {
      id: 's20',
      title: '20. SMS and Communications Consent',
      content: [
        'By creating an account and providing your phone number, you expressly consent to receive text messages (SMS), push notifications, in-app messages, and automated calls from BrazilianClean and its authorized service providers at the phone number you provide. This includes transactional messages, booking confirmations, service reminders, and account alerts.',
        'Standard message and data rates from your mobile carrier may apply. You may opt out of marketing text messages at any time by replying STOP to any message. However, you acknowledge that opting out of transactional or service-related communications may affect the functionality of your account.',
        'By providing your phone number, you represent that you are the account holder or authorized user of the phone number and have the authority to consent to these communications.',
      ],
    },
    {
      id: 's21',
      title: '21. AI and Automation',
      content: [
        'The BrazilianClean Platform may incorporate artificial intelligence, machine learning, and automated decision-making systems to enhance features including but not limited to: lead matching, price suggestions, scheduling optimization, content moderation, and fraud detection.',
        'AI-generated content, recommendations, or outputs may contain errors, inaccuracies, or omissions. Users are responsible for independently verifying any information generated by AI systems before acting on it. BrazilianClean makes no warranty regarding the accuracy, completeness, or reliability of AI-generated content.',
        'BrazilianClean reserves the right to implement, modify, or remove automated systems at any time without prior notice. Users agree to the use of such systems as part of accepting these Terms.',
      ],
    },
    {
      id: 's22',
      title: '22. Beta and MVP Disclaimer',
      content: [
        'The BrazilianClean Platform is currently in a beta or minimum viable product ("MVP") phase of development. Features, functionality, pricing, and availability may change significantly and without notice during this phase.',
        'As a beta product, the Platform may contain bugs, errors, data loss risks, or other issues not present in fully released software. BrazilianClean provides the Platform on an "as-is" basis during the beta phase and makes no guarantees regarding the stability, reliability, or completeness of any feature.',
        'By using the Platform during the beta phase, you acknowledge these limitations and agree to report any issues or errors to BrazilianClean\'s support team. User feedback during this phase is valuable and may be used to improve the Platform.',
      ],
    },
    {
      id: 's23',
      title: '23. Platform Availability',
      content: [
        'BrazilianClean does not guarantee that the Platform will be available at all times or free from interruption. The Platform may be unavailable due to: (a) scheduled maintenance; (b) unscheduled technical issues or outages; (c) events beyond BrazilianClean\'s reasonable control; (d) actions by third-party service providers.',
        'BrazilianClean will make commercially reasonable efforts to maintain Platform availability and to provide advance notice of scheduled maintenance when practical. However, BrazilianClean shall not be liable for any damages, losses, or inconveniences caused by Platform unavailability.',
        'BrazilianClean reserves the right to discontinue, suspend, or modify any feature of the Platform at any time, with or without notice.',
      ],
    },
    {
      id: 's24',
      title: '24. Third-Party Services',
      content: [
        'The Platform integrates with and relies on third-party services and providers, which may currently or in the future include: Stripe (payment processing), Twilio (SMS and communications), Amazon Web Services (cloud infrastructure), Vercel (hosting), Google Maps (geolocation), and other service providers as necessary for Platform operation.',
        'BrazilianClean is not responsible for the acts, omissions, policies, or terms of any third-party service provider. Your use of third-party services is governed by their respective terms of service and privacy policies, which you are responsible for reviewing.',
        'BrazilianClean may change, add, or remove third-party service integrations at any time. Changes to third-party services may affect the functionality of the Platform, and BrazilianClean shall not be liable for such impacts.',
      ],
    },
    {
      id: 's25',
      title: '25. Privacy',
      content: [
        'Your privacy is important to BrazilianClean. The collection, use, storage, and disclosure of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference and available at brazilianclean.com/privacy.',
        'By using the Platform, you consent to the collection and use of your personal information as described in the Privacy Policy. If you do not agree with our privacy practices, you must discontinue use of the Platform.',
        'BrazilianClean implements commercially reasonable security measures to protect your personal information, but cannot guarantee absolute security. You acknowledge that data transmission over the internet carries inherent risks.',
      ],
    },
    {
      id: 's26',
      title: '26. Intellectual Property',
      content: [
        'All intellectual property rights in and to the BrazilianClean Platform, including without limitation: the BrazilianClean name, logo, trademarks, service marks, trade dress, website design, mobile application, source code, algorithms, databases, content, and all related documentation, are owned by BrazilianClean or its licensors.',
        'Nothing in these Terms grants you any right, title, or interest in BrazilianClean\'s intellectual property. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Platform solely for its intended purposes in accordance with these Terms.',
        'Any unauthorized use, reproduction, modification, or distribution of BrazilianClean\'s intellectual property is strictly prohibited and may result in civil and criminal liability. BrazilianClean actively monitors and enforces its intellectual property rights.',
      ],
    },
    {
      id: 's27',
      title: '27. Confidentiality',
      content: [
        'Users may have access to information about other users that is shared in confidence through the Platform, including personal contact information, property details, and service preferences. All such information must be used solely for the purpose of facilitating services arranged through the Platform.',
        'You agree not to: (a) share other users\' personal information with third parties without their explicit consent; (b) use other users\' information for marketing, solicitation, or any purpose unrelated to Platform services; (c) retain or use personal information obtained through the Platform after your relationship with that user has ended.',
        'This confidentiality obligation survives termination of your account and these Terms. Violations of this section may result in legal liability and account termination.',
      ],
    },
    {
      id: 's28',
      title: '28. Taxes',
      content: [
        'Each user is solely responsible for determining and fulfilling their own tax obligations arising from activities on the Platform. For Cleaners, this includes federal and state income tax, self-employment tax, and any applicable local business taxes.',
        'BrazilianClean may issue tax forms (such as IRS Form 1099-K or 1099-NEC) to Cleaners who meet applicable thresholds, as required by law. It is each Cleaner\'s responsibility to maintain accurate records of income earned and expenses incurred through the Platform.',
        'BrazilianClean recommends that all users consult with a qualified tax professional regarding their specific tax situation. BrazilianClean does not provide tax advice and is not responsible for any tax liability, penalties, or interest assessed against any user.',
      ],
    },
    {
      id: 's29',
      title: '29. Compliance With Laws',
      content: [
        'All users agree to comply with all applicable federal, state, and local laws, regulations, and ordinances in connection with their use of the Platform. This includes but is not limited to: consumer protection laws, employment laws, anti-discrimination laws, environmental laws, licensing and permit requirements, and tax laws.',
        'Cleaners specifically acknowledge that they are responsible for complying with all laws applicable to independent contractors and small businesses in their jurisdiction. BrazilianClean is not responsible for advising users on legal requirements in their specific locations.',
        'BrazilianClean cooperates with law enforcement and regulatory authorities and may disclose information about users when required by law or court order. BrazilianClean may also report suspected illegal activity to appropriate authorities.',
      ],
    },
    {
      id: 's30',
      title: '30. User Disputes',
      content: [
        'BrazilianClean is not a party to disputes between Clients and Cleaners regarding the quality, completeness, timing, or any other aspect of cleaning services. BrazilianClean is not obligated to mediate or resolve disputes between users.',
        'While BrazilianClean may, in its sole discretion, attempt to facilitate dispute resolution between users as a courtesy, any such assistance does not create any obligation, liability, or responsibility for BrazilianClean. The ultimate resolution of any dispute is the responsibility of the parties involved.',
        'Users agree to release BrazilianClean and its officers, directors, employees, and agents from any claims, demands, and damages of every kind arising out of or in any way connected with disputes between users.',
      ],
    },
    {
      id: 's31',
      title: '31. Disclaimer of Warranties',
      content: [
        'THE BRAZILIANCLEAN PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, BRAZILIANCLEAN EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO: IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
        'BRAZILIANCLEAN DOES NOT WARRANT THAT: (A) THE PLATFORM WILL MEET YOUR REQUIREMENTS; (B) THE PLATFORM WILL BE AVAILABLE, UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (C) ANY INFORMATION OBTAINED THROUGH THE PLATFORM WILL BE ACCURATE, RELIABLE, OR COMPLETE; (D) ANY DEFECTS IN THE PLATFORM WILL BE CORRECTED.',
        'SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES. IN SUCH JURISDICTIONS, THE ABOVE EXCLUSIONS APPLY TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.',
      ],
    },
    {
      id: 's32',
      title: '32. Limitation of Liability',
      content: [
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BRAZILIANCLEAN, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO: LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS, LOSS OF DATA, PROPERTY DAMAGE, OR PERSONAL INJURY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM.',
        'IN NO EVENT SHALL BRAZILIANCLEAN\'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT PAID BY YOU TO BRAZILIANCLEAN DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM; OR (B) ONE HUNDRED UNITED STATES DOLLARS (USD $100.00).',
        'SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. IN SUCH JURISDICTIONS, BRAZILIANCLEAN\'S LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.',
      ],
    },
    {
      id: 's33',
      title: '33. Indemnification',
      content: [
        'You agree to defend, indemnify, and hold harmless BrazilianClean and its officers, directors, employees, contractors, agents, licensors, and service providers from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, and fees (including reasonable attorneys\' fees) arising out of or relating to: (a) your violation of these Terms; (b) your use or misuse of the Platform; (c) your violation of any third-party rights, including without limitation privacy rights or intellectual property rights.',
        'Additional indemnification obligations apply to: (d) any cleaning services you perform or receive through the Platform; (e) your violation of any applicable law or regulation; (f) any content you submit to the Platform; (g) any dispute between you and another user.',
        'BrazilianClean reserves the right, at its own expense, to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate fully with BrazilianClean\'s defense.',
      ],
    },
    {
      id: 's34',
      title: '34. Arbitration Agreement',
      content: [
        'PLEASE READ THIS SECTION CAREFULLY. IT REQUIRES YOU TO ARBITRATE DISPUTES WITH BRAZILIANCLEAN AND LIMITS THE MANNER IN WHICH YOU CAN SEEK RELIEF.',
        'Except for disputes that qualify for small claims court and certain intellectual property disputes, you and BrazilianClean agree that any dispute, controversy, or claim arising out of or relating to these Terms or your use of the Platform shall be resolved by binding individual arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules.',
        'The arbitration shall be conducted in English, in the State of Connecticut, unless the parties agree otherwise. The arbitrator\'s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction. Each party shall bear its own costs and attorneys\' fees, except as otherwise required by the AAA Rules or applicable law.',
      ],
    },
    {
      id: 's35',
      title: '35. Class Action Waiver',
      content: [
        'YOU AND BRAZILIANCLEAN AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.',
        'Unless both you and BrazilianClean agree otherwise, the arbitrator may not consolidate more than one person\'s claims and may not otherwise preside over any form of a representative or class proceeding. The arbitrator may award relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by that party\'s individual claim.',
        'If a court determines that this class action waiver is unenforceable for a particular claim, then that particular claim must be severed from the arbitration and may proceed in court.',
      ],
    },
    {
      id: 's36',
      title: '36. Jury Trial Waiver',
      content: [
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AND BRAZILIANCLEAN EACH EXPRESSLY WAIVE ANY RIGHT TO A TRIAL BY JURY IN ANY ACTION, PROCEEDING, OR CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM.',
        'This waiver applies to all disputes, whether based in contract, tort, statute, or any other legal theory. By using the Platform, you acknowledge that you have had the opportunity to consult with legal counsel and make this waiver knowingly and voluntarily.',
        'This jury trial waiver does not apply in jurisdictions where such waivers are prohibited by law. In such jurisdictions, this provision shall be severed and the remainder of these Terms shall continue in full force and effect.',
      ],
    },
    {
      id: 's37',
      title: '37. Governing Law',
      content: [
        'These Terms and any dispute arising out of or relating to them or your use of the Platform shall be governed by and construed in accordance with the laws of the State of Connecticut, United States, without regard to its conflict of law principles.',
        'The parties acknowledge and agree that Connecticut has a substantial relationship to the parties and this transaction. The application of the laws of any other jurisdiction is expressly excluded.',
        'Nothing in this section shall be construed to limit BrazilianClean\'s ability to seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights or prevent irreparable harm.',
      ],
    },
    {
      id: 's38',
      title: '38. Venue',
      content: [
        'For any dispute that is not subject to arbitration, or for the enforcement of an arbitration award, each party consents to personal jurisdiction and exclusive venue in the state and federal courts located in the State of Connecticut, United States.',
        'Each party waives any objection to the laying of venue in such courts, and waives any claim that such courts are an inconvenient forum. Service of process in any such proceeding may be made in any manner permitted by law.',
        'Notwithstanding the foregoing, BrazilianClean may seek emergency injunctive relief in any court of competent jurisdiction to prevent irreparable harm pending resolution of a dispute.',
      ],
    },
    {
      id: 's39',
      title: '39. Force Majeure',
      content: [
        'BrazilianClean shall not be liable for any failure or delay in performing its obligations under these Terms if such failure or delay is caused by events beyond its reasonable control, including but not limited to: acts of God, natural disasters, epidemics or pandemics, war, terrorism, civil unrest, governmental actions, labor disputes, power failures, internet outages, or failures of third-party service providers.',
        'In the event of a force majeure event, BrazilianClean will use commercially reasonable efforts to resume normal operations as soon as practicable. BrazilianClean will provide notice of the force majeure event to the extent reasonably practicable.',
        'If a force majeure event continues for more than sixty (60) days and materially affects the ability of BrazilianClean to provide the Services, either party may terminate this agreement upon written notice, without liability to the other party.',
      ],
    },
    {
      id: 's40',
      title: '40. Account Suspension and Termination',
      content: [
        'BrazilianClean reserves the right to suspend, restrict, or permanently terminate any user\'s account and access to the Platform at any time, with or without notice, for any reason, including but not limited to: violation of these Terms, fraudulent activity, harm to other users, legal compliance requirements, or behavior that BrazilianClean determines to be detrimental to the Platform or its users.',
        'Upon termination of your account: (a) your license to use the Platform immediately ceases; (b) you must stop all use of the Platform; (c) BrazilianClean may delete your account data in accordance with our Privacy Policy; (d) any pending payments may be withheld pending investigation of the reason for termination.',
        'You may also terminate your own account at any time by contacting support@brazilianclean.com. Termination does not relieve you of obligations incurred prior to termination, including payment obligations, indemnification obligations, and compliance with the arbitration agreement.',
      ],
    },
    {
      id: 's41',
      title: '41. Changes to Terms',
      content: [
        'BrazilianClean reserves the right to modify, amend, or update these Terms at any time. When changes are made, BrazilianClean will update the "Last updated" date at the top of this document and, for material changes, will provide notice through the Platform, by email, or other reasonable means.',
        'It is your responsibility to review these Terms periodically for changes. Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Platform.',
        'For significant changes that materially affect your rights, BrazilianClean will endeavor to provide at least 30 days\' notice. However, changes required by law may take effect immediately.',
      ],
    },
    {
      id: 's42',
      title: '42. Severability',
      content: [
        'If any provision of these Terms is found by a court of competent jurisdiction or arbitrator to be invalid, illegal, unenforceable, or contrary to applicable law, that provision will be deemed modified to the minimum extent necessary to make it valid and enforceable, or if it cannot be so modified, it will be severed from these Terms.',
        'The invalidity or unenforceability of any provision will not affect the validity or enforceability of any other provision of these Terms, which shall remain in full force and effect.',
        'The parties intend that these Terms be enforced to the fullest extent permitted by applicable law, and the parties agree that any court may modify any unenforceable provision to the minimum extent necessary while still giving effect to the parties\' original intent.',
      ],
    },
    {
      id: 's43',
      title: '43. No Waiver',
      content: [
        'BrazilianClean\'s failure to enforce any right or provision of these Terms at any time shall not be construed as a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by an authorized representative of BrazilianClean.',
        'A waiver of any particular breach or default shall not operate as a waiver of any subsequent breach or default of the same or any other provision. The rights and remedies of BrazilianClean under these Terms are cumulative and not exclusive of any other rights or remedies that BrazilianClean may have at law or in equity.',
        'No action or inaction by BrazilianClean shall be interpreted as an agreement to modify or waive any right or obligation under these Terms.',
      ],
    },
    {
      id: 's44',
      title: '44. Assignment',
      content: [
        'You may not assign, transfer, delegate, or sublicense your rights or obligations under these Terms, in whole or in part, without the prior written consent of BrazilianClean. Any purported assignment in violation of this section is null and void.',
        'BrazilianClean may freely assign or transfer these Terms, or any rights or obligations hereunder, without restriction and without your prior consent, including in connection with a merger, acquisition, corporate reorganization, sale of all or substantially all of BrazilianClean\'s assets, or by operation of law.',
        'In the event of any permitted assignment by BrazilianClean, the assignee will assume all rights and obligations under these Terms. You will be notified of any material assignment that affects your rights.',
      ],
    },
    {
      id: 's45',
      title: '45. Entire Agreement',
      content: [
        'These Terms, together with the Privacy Policy, Refund Policy, and any other policies, guidelines, or supplemental terms incorporated herein by reference, constitute the entire agreement between you and BrazilianClean with respect to your use of the Platform, and supersede all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written, between the parties.',
        'No oral representations, statements, or inducements by either party shall modify or amend these Terms unless set forth in a written instrument signed by authorized representatives of both parties.',
        'In the event of any conflict between these Terms and any supplemental agreement or policy, these Terms shall govern unless the supplemental agreement or policy expressly states that it supersedes these Terms for a specific matter.',
      ],
    },
    {
      id: 's46',
      title: '46. Contact Information',
      content: [
        'If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:',
        'BrazilianClean — Customer Support\nEmail: support@brazilianclean.com\nWebsite: https://brazilianclean.com\nResponse time: We aim to respond to all inquiries within 2 business days.',
        'For legal notices, including notices related to arbitration, please send written correspondence to: support@brazilianclean.com with the subject line "Legal Notice."',
      ],
    },
  ],
};

const pt: TermsContent = {
  pageTitle: 'Termos de Serviço',
  lastUpdated: 'Última atualização: 19 de junho de 2026',
  effectiveDate: 'Data de vigência: 19 de junho de 2026',
  intro: 'Por favor, leia estes Termos de Serviço atentamente antes de usar a plataforma BrazilianClean. Ao acessar ou usar nossos serviços, você concorda em estar vinculado a estes termos.',
  sections: [
    {
      id: 's1',
      title: '1. Aceitação dos Termos',
      content: [
        'Ao criar uma conta, acessar ou usar a plataforma BrazilianClean ("Plataforma"), site ou quaisquer serviços relacionados (coletivamente, "Serviços"), você concorda em estar legalmente vinculado a estes Termos de Serviço ("Termos"), à nossa Política de Privacidade e a todas as outras políticas e diretrizes incorporadas por referência.',
        'Se você não concordar com qualquer parte destes Termos, não deverá acessar ou usar os Serviços. Estes Termos aplicam-se a todos os usuários da Plataforma, incluindo clientes (proprietários de imóveis e administradores de propriedades) e profissionais de limpeza ("Faxineiras").',
        'O uso continuado da Plataforma após qualquer atualização destes Termos constitui sua aceitação dos Termos revisados.',
      ],
    },
    {
      id: 's2',
      title: '2. Aviso Legal Importante',
      content: [
        'LEIA ESTES TERMOS COM ATENÇÃO. ELES CONTÊM INFORMAÇÕES IMPORTANTES SOBRE SEUS DIREITOS LEGAIS, RECURSOS E OBRIGAÇÕES.',
        'Estes Termos incluem disposições relativas a: (a) um acordo de arbitragem vinculante e renúncia de ação coletiva que afetam seus direitos legais em caso de disputa; (b) limitação de responsabilidade que restringe a responsabilidade legal da BrazilianClean perante você; e (c) obrigações de indenização que exigem que você proteja a BrazilianClean de determinadas reivindicações legais.',
        'Ao usar a Plataforma, você reconhece que leu, compreendeu e concorda em estar vinculado a todas essas disposições. Se você for consumidor em uma jurisdição que não permite cláusulas de arbitragem, renúncias de ação coletiva ou limitações de responsabilidade, determinadas disposições podem não se aplicar a você na medida proibida por lei.',
      ],
    },
    {
      id: 's3',
      title: '3. Natureza da BrazilianClean',
      content: [
        'A BrazilianClean é uma plataforma tecnológica de marketplace que conecta clientes que buscam serviços de limpeza com profissionais independentes. A BrazilianClean NÃO é uma empresa de limpeza e não presta diretamente quaisquer serviços de limpeza.',
        'A BrazilianClean disponibiliza a Plataforma como intermediária neutra para facilitar conexões, agendamentos, processamento de pagamentos e comunicação entre clientes e Faxineiras. A BrazilianClean não supervisiona, direciona, controla nem monitora os serviços de limpeza efetivamente realizados por qualquer Faxineira.',
        'Nada nestes Termos ou na Plataforma deve ser interpretado como tornando a BrazilianClean empregadora, coempregadora, agência de trabalho temporário ou empregadora conjunta de qualquer Faxineira. A relação entre a BrazilianClean e as Faxineiras é de operadora de marketplace e prestadora de serviços independente.',
      ],
    },
    {
      id: 's4',
      title: '4. Profissionais Independentes',
      content: [
        'Todas as Faxineiras que prestam serviços por meio da Plataforma BrazilianClean são contratadas independentes, não empregadas, agentes ou representantes da BrazilianClean. As Faxineiras têm o direito de prestar serviços para outros clientes e plataformas simultaneamente, e são livres para definir seus próprios horários, preços e condições de trabalho.',
        'As Faxineiras são as únicas responsáveis por determinar a forma, os meios e o método de prestação de seus serviços. A BrazilianClean não dita como os serviços devem ser realizados, quais ferramentas ou materiais usar, nem como as Faxineiras gerenciam seu tempo.',
        'A BrazilianClean não retém impostos, não oferece benefícios, compensação por acidente de trabalho, seguro-desemprego nem quaisquer outros benefícios relacionados ao emprego para as Faxineiras. Cada Faxineira é responsável pelo cumprimento de todas as leis federais, estaduais e locais aplicáveis que regem os contratados independentes.',
      ],
    },
    {
      id: 's5',
      title: '5. Inexistência de Vínculo Empregatício',
      content: [
        'Nenhuma relação de emprego, agência, parceria, joint venture, franquia ou fidúcia é criada entre a BrazilianClean e qualquer Faxineira, ou entre a BrazilianClean e qualquer Cliente, em virtude destes Termos ou do uso da Plataforma.',
        'As Faxineiras reconhecem e concordam que não têm direito a benefícios de desemprego, compensação por acidente de trabalho, seguro de saúde, benefícios de aposentadoria, férias remuneradas nem quaisquer outros benefícios de emprego provenientes da BrazilianClean.',
        'Quaisquer representações em contrário por qualquer pessoa que afirme agir em nome da BrazilianClean são não autorizadas e nulas. Se qualquer autoridade governamental ou tribunal determinar que uma Faxineira é empregada da BrazilianClean, tal determinação não afetará retroativamente os direitos e obrigações estabelecidos nestes Termos.',
      ],
    },
    {
      id: 's6',
      title: '6. Responsabilidade do Cliente',
      content: [
        'Os Clientes são os únicos responsáveis por avaliar, selecionar e contratar Faxineiras por meio da Plataforma. A BrazilianClean não endossa, recomenda nem garante nenhuma Faxineira específica. A decisão de contratar uma Faxineira específica é inteiramente de responsabilidade e risco do Cliente.',
        'Os Clientes devem proporcionar um ambiente de trabalho seguro para as Faxineiras, incluindo: (a) informações precisas sobre a propriedade e o escopo do trabalho; (b) acesso apropriado à propriedade no horário agendado; (c) divulgação de quaisquer riscos conhecidos, condições perigosas ou circunstâncias incomuns que possam afetar a segurança da Faxineira.',
        'Os Clientes concordam em tratar todas as Faxineiras com respeito e dignidade. Assédio, discriminação, comportamento ameaçador ou qualquer forma de abuso em relação às Faxineiras resultará em suspensão imediata da conta e poderá ser reportado às autoridades policiais.',
      ],
    },
    {
      id: 's7',
      title: '7. Responsabilidade do Profissional',
      content: [
        'As Faxineiras são as únicas responsáveis por: (a) obter e manter todas as licenças, alvarás, certificações e registros exigidos pelas leis federais, estaduais e locais aplicáveis para a prestação de serviços de limpeza; (b) obter e manter seguro de responsabilidade civil adequado e qualquer outro seguro exigido por lei ou considerado prudente; (c) cumprir todas as normas aplicáveis de saúde e segurança ocupacional.',
        'As Faxineiras são responsáveis pelo pagamento de todos os impostos de renda federais, estaduais e locais, impostos sobre o trabalho autônomo e quaisquer outros impostos decorrentes da renda obtida por meio da Plataforma. A BrazilianClean não reterá quaisquer impostos em nome das Faxineiras.',
        'As Faxineiras devem representar suas qualificações, experiência e capacidades com precisão e integridade. O fornecimento de informações falsas ou enganosas no perfil de Faxineira resultará em encerramento imediato da conta.',
      ],
    },
    {
      id: 's8',
      title: '8. Sem Garantia de Leads ou Renda',
      content: [
        'A BrazilianClean não garante, representa nem assegura de qualquer forma que: (a) as Faxineiras receberão qualquer número específico de leads, solicitações de serviço ou reservas; (b) as Faxineiras ganharão qualquer valor específico de renda ou receita; (c) os Clientes encontrarão Faxineiras disponíveis em sua área no horário desejado; (d) o uso da Plataforma resultará em crescimento de negócios ou aumento de receita para as Faxineiras.',
        'A disponibilidade de leads e reservas depende de muitos fatores fora do controle da BrazilianClean, incluindo demanda geográfica, variações sazonais, concorrência entre Faxineiras e comportamento dos clientes. O desempenho passado na Plataforma não garante resultados futuros.',
        'As Faxineiras não devem depender da Plataforma como sua única ou principal fonte de renda sem avaliar independentemente a oportunidade de negócio em seu mercado específico.',
      ],
    },
    {
      id: 's9',
      title: '9. Distribuição de Leads',
      content: [
        'A BrazilianClean utiliza algoritmos e sistemas proprietários para distribuir leads e conectar clientes com Faxineiras. A distribuição de leads pode levar em conta fatores incluindo, mas não se limitando a: proximidade geográfica, avaliação e comentários da Faxineira, nível de assinatura, taxa de resposta, taxa de conclusão de reservas, disponibilidade e indicadores de qualidade.',
        'A BrazilianClean reserva-se o direito de modificar seus algoritmos de distribuição de leads a qualquer momento sem aviso prévio. A BrazilianClean não garante distribuição igual ou proporcional de leads entre as Faxineiras.',
        'Automação e inteligência artificial podem ser usadas no processo de correspondência e distribuição de leads. Tais sistemas têm como objetivo melhorar a qualidade das correspondências, mas podem nem sempre produzir resultados ótimos para todas as partes.',
      ],
    },
    {
      id: 's10',
      title: '10. Pagamentos',
      content: [
        'Todos os pagamentos por serviços reservados por meio da Plataforma são processados por processadores de pagamento de terceiros, atualmente a Stripe, Inc. Ao realizar ou receber pagamentos pela Plataforma, você concorda em estar vinculado pelos termos e condições aplicáveis do(s) nosso(s) processador(es) de pagamento.',
        'A BrazilianClean coleta o pagamento dos Clientes no momento da confirmação da reserva. Os fundos são mantidos com segurança e liberados para as Faxineiras após a conclusão bem-sucedida do serviço, sujeito a quaisquer taxas aplicáveis e ao período de resolução de disputas.',
        'Você autoriza a BrazilianClean e seus processadores de pagamento a cobrar o método de pagamento cadastrado por todos os valores devidos. Se o pagamento não puder ser processado, seu acesso à Plataforma poderá ser suspenso até que o pagamento seja resolvido.',
      ],
    },
    {
      id: 's11',
      title: '11. Taxas e Honorários',
      content: [
        'A BrazilianClean cobra taxas pelo uso da Plataforma, que podem incluir taxas de assinatura, taxas de lead, taxas de transação ou outras cobranças de serviço. As estruturas de taxas atuais estão disponíveis na Plataforma e podem variar por tipo de serviço, área geográfica e nível de assinatura.',
        'A BrazilianClean reserva-se o direito de alterar suas taxas a qualquer momento. Para Faxineiras com assinaturas pagas, as alterações de taxas entrarão em vigor no próximo ciclo de faturamento com aviso prévio razoável. Para taxas baseadas em transações, as alterações podem entrar em vigor imediatamente após publicação na Plataforma.',
        'Todas as taxas são não reembolsáveis, exceto conforme expressamente estabelecido nestes Termos ou em nossa Política de Reembolso. Ao usar a Plataforma, você aceita a responsabilidade por todas as taxas aplicáveis.',
      ],
    },
    {
      id: 's12',
      title: '12. Reembolsos',
      content: [
        'A elegibilidade para reembolso é regida pela nossa Política de Reembolso separada, incorporada a estes Termos por referência. Em geral: (a) cancelamentos de Clientes realizados com mais de 24 horas de antecedência do serviço agendado podem ser elegíveis para reembolso total; (b) cancelamentos realizados entre 12 e 24 horas antes do serviço podem receber reembolso parcial; (c) cancelamentos realizados com menos de 12 horas de antecedência geralmente não são reembolsáveis.',
        'As taxas de lead pagas pelas Faxineiras geralmente não são reembolsáveis após a aceitação de uma reserva, exceto em casos de erro verificado da plataforma ou ausência do Cliente.',
        'Solicitações de reembolso devem ser enviadas pelos canais de suporte oficiais dentro de 72 horas da data do serviço ou do evento de cancelamento. A BrazilianClean reserva-se o direito de aprovar ou negar solicitações de reembolso a seu exclusivo critério, com base na investigação das circunstâncias.',
      ],
    },
    {
      id: 's13',
      title: '13. Transações Fora da Plataforma',
      content: [
        'Quaisquer transações, acordos ou arranjos financeiros realizados entre Clientes e Faxineiras fora da Plataforma BrazilianClean ("Transações Fora da Plataforma") são conduzidos inteiramente por conta e risco das partes envolvidas. A BrazilianClean proíbe expressamente a solicitação de transações fora da plataforma para serviços originalmente encontrados na Plataforma.',
        'A BrazilianClean não é responsável por qualquer perda, dano, fraude, falta de pagamento ou outros prejuízos decorrentes de Transações Fora da Plataforma. Tais transações não são cobertas por quaisquer programas de proteção, serviços de resolução de disputas ou garantias de pagamento da BrazilianClean.',
        'Realizar Transações Fora da Plataforma em violação a estes Termos pode resultar em suspensão ou encerramento da conta. Se você souber de outro usuário tentando realizar Transações Fora da Plataforma, reporte isso imediatamente à BrazilianClean.',
      ],
    },
    {
      id: 's14',
      title: '14. Contas de Usuário',
      content: [
        'Você deve criar uma conta para acessar a maioria dos recursos da Plataforma. Você concorda em: (a) fornecer informações precisas, atuais e completas durante o registro; (b) manter e atualizar prontamente as informações da sua conta para mantê-las precisas; (c) manter a segurança das suas credenciais de conta e não compartilhar sua senha com terceiros.',
        'Você é responsável por todas as atividades que ocorrem em sua conta, autorizadas ou não. Você deve notificar imediatamente a BrazilianClean em support@brazilianclean.com se suspeitar de qualquer acesso ou uso não autorizado de sua conta.',
        'Você deve ter pelo menos 18 anos de idade para criar uma conta e usar os Serviços. Ao criar uma conta, você declara e garante que atende a esse requisito de idade e tem capacidade legal para celebrar estes Termos.',
      ],
    },
    {
      id: 's15',
      title: '15. Conduta Proibida',
      content: [
        'Você concorda em não usar a Plataforma para: (a) fraude, deturpação ou personificação de qualquer pessoa ou entidade; (b) assédio, ameaça, intimidação ou abuso de outros usuários; (c) coleta não autorizada de dados, raspagem ou colheita de informações de usuários; (d) distribuição de malware, vírus ou qualquer código prejudicial; (e) contornar medidas de segurança ou controles de acesso.',
        'A conduta proibida adicional inclui: (a) publicar conteúdo falso, enganoso ou difamatório; (b) enviar comunicações comerciais não solicitadas ("spam"); (c) manipular avaliações, comentários ou qualquer sistema de feedback; (d) criar múltiplas contas para contornar banimentos ou restrições; (e) usar a Plataforma para facilitar serviços ilegais.',
        'A violação de qualquer proibição nesta seção pode resultar em encerramento imediato da conta, ação legal e encaminhamento às autoridades policiais quando apropriado.',
      ],
    },
    {
      id: 's16',
      title: '16. Avaliações e Conteúdo',
      content: [
        'Os usuários podem enviar avaliações, classificações, fotos e outros conteúdos ("Conteúdo do Usuário") para a Plataforma. Ao enviar Conteúdo do Usuário, você concede à BrazilianClean uma licença não exclusiva, isenta de royalties, mundial e perpétua para usar, exibir, reproduzir, modificar e distribuir tal conteúdo em conexão com a operação e promoção da Plataforma.',
        'A BrazilianClean reserva-se o direito, mas não tem obrigação, de revisar, moderar, editar ou remover qualquer Conteúdo do Usuário que viole estes Termos ou seja de outra forma censurável, a exclusivo critério da BrazilianClean. As avaliações devem refletir experiências genuínas e não podem ser incentivadas, fabricadas ou manipuladas.',
        'A BrazilianClean não é responsável por qualquer Conteúdo do Usuário publicado na Plataforma e não endossa qualquer opinião expressa em Conteúdo do Usuário. Você é o único responsável por garantir que seu Conteúdo do Usuário não viole a lei aplicável, não infrinja direitos de terceiros nem constitua difamação.',
      ],
    },
    {
      id: 's17',
      title: '17. Verificação de Antecedentes',
      content: [
        'A BrazilianClean pode facilitar a verificação opcional de antecedentes para Faxineiras por meio de fornecedores de triagem de terceiros. As verificações de antecedentes não são obrigatórias e não constituem garantia, segurança ou endosso de qualquer Faxineira pela BrazilianClean.',
        'Os resultados das verificações de antecedentes estão sujeitos às limitações dos registros públicos disponíveis e da metodologia do provedor de triagem. Uma verificação de antecedentes aprovada não certifica que uma Faxineira não tem histórico criminal, não representa risco ou é adequada para as necessidades de qualquer cliente específico.',
        'Os Clientes devem exercer seu próprio julgamento independente ao selecionar uma Faxineira, independentemente do status de verificação. A BrazilianClean não é responsável por quaisquer atos ou omissões das Faxineiras, independentemente de terem sido submetidas à triagem de antecedentes.',
      ],
    },
    {
      id: 's18',
      title: '18. Isenção de Responsabilidade por Seguro',
      content: [
        'A BrazilianClean não fornece seguro de responsabilidade civil, seguro contra danos à propriedade, seguro de compensação para trabalhadores nem qualquer outro tipo de cobertura de seguro para Clientes, Faxineiras ou qualquer propriedade associada a serviços prestados por meio da Plataforma.',
        'As Faxineiras são as únicas responsáveis por obter e manter qualquer cobertura de seguro que considerem necessária ou que seja exigida pela lei aplicável, incluindo seguro de responsabilidade civil geral. Os Clientes são incentivados a verificar se a Faxineira que contratam possui seguro adequado antes do início dos serviços.',
        'A BrazilianClean isenta expressamente qualquer responsabilidade por danos à propriedade, lesões pessoais, furto ou qualquer outro dano que possa ocorrer em conexão com serviços de limpeza reservados pela Plataforma. Quaisquer disputas relacionadas a seguro são exclusivamente entre a Faxineira, o Cliente e suas respectivas seguradoras.',
      ],
    },
    {
      id: 's19',
      title: '19. Isenção de Responsabilidade sobre Status Migratório',
      content: [
        'A BrazilianClean não verifica, investiga nem faz quaisquer representações a respeito do status migratório ou de autorização de trabalho de qualquer Faxineira ou outro usuário da Plataforma.',
        'É responsabilidade exclusiva de cada usuário garantir o cumprimento de todas as leis de imigração e trabalho aplicáveis. Os Clientes que desejam verificar a autorização de trabalho de uma Faxineira devem fazê-lo de forma independente por meio dos canais legais adequados. A BrazilianClean não fornece aconselhamento jurídico sobre questões de imigração.',
        'A BrazilianClean isenta expressamente qualquer responsabilidade decorrente do status migratório de qualquer Faxineira. Todos os usuários concordam em isentar a BrazilianClean de quaisquer reclamações, penalidades ou responsabilidades decorrentes de violações da lei de imigração por qualquer parte.',
      ],
    },
    {
      id: 's20',
      title: '20. Consentimento para SMS e Comunicações',
      content: [
        'Ao criar uma conta e fornecer seu número de telefone, você consente expressamente em receber mensagens de texto (SMS), notificações push, mensagens no aplicativo e chamadas automatizadas da BrazilianClean e de seus prestadores de serviços autorizados no número de telefone fornecido. Isso inclui mensagens transacionais, confirmações de reserva, lembretes de serviço e alertas de conta.',
        'Taxas padrão de mensagem e dados da sua operadora de celular podem ser aplicadas. Você pode cancelar o recebimento de mensagens de texto de marketing a qualquer momento respondendo STOP a qualquer mensagem. No entanto, você reconhece que optar por não receber comunicações transacionais ou relacionadas ao serviço pode afetar a funcionalidade de sua conta.',
        'Ao fornecer seu número de telefone, você declara ser o titular da conta ou usuário autorizado do número de telefone e ter autoridade para consentir com essas comunicações.',
      ],
    },
    {
      id: 's21',
      title: '21. IA e Automação',
      content: [
        'A Plataforma BrazilianClean pode incorporar inteligência artificial, aprendizado de máquina e sistemas de tomada de decisão automatizados para aprimorar recursos incluindo, mas não se limitando a: correspondência de leads, sugestões de preços, otimização de agendamentos, moderação de conteúdo e detecção de fraudes.',
        'Conteúdo, recomendações ou resultados gerados por IA podem conter erros, imprecisões ou omissões. Os usuários são responsáveis por verificar de forma independente qualquer informação gerada por sistemas de IA antes de agir com base nela. A BrazilianClean não garante a precisão, integralidade ou confiabilidade do conteúdo gerado por IA.',
        'A BrazilianClean reserva-se o direito de implementar, modificar ou remover sistemas automatizados a qualquer momento sem aviso prévio. Os usuários concordam com o uso de tais sistemas como parte da aceitação destes Termos.',
      ],
    },
    {
      id: 's22',
      title: '22. Isenção de Responsabilidade — Beta e MVP',
      content: [
        'A Plataforma BrazilianClean está atualmente em fase beta ou de produto mínimo viável ("MVP") de desenvolvimento. Recursos, funcionalidades, preços e disponibilidade podem mudar significativamente e sem aviso prévio durante esta fase.',
        'Como produto beta, a Plataforma pode conter erros, falhas, riscos de perda de dados ou outros problemas não presentes em softwares totalmente lançados. A BrazilianClean disponibiliza a Plataforma "no estado em que se encontra" durante a fase beta e não oferece garantias quanto à estabilidade, confiabilidade ou integralidade de qualquer recurso.',
        'Ao usar a Plataforma durante a fase beta, você reconhece essas limitações e concorda em reportar quaisquer problemas ou erros à equipe de suporte da BrazilianClean. O feedback dos usuários durante esta fase é valioso e pode ser usado para melhorar a Plataforma.',
      ],
    },
    {
      id: 's23',
      title: '23. Disponibilidade da Plataforma',
      content: [
        'A BrazilianClean não garante que a Plataforma estará disponível em todos os momentos ou livre de interrupções. A Plataforma pode ficar indisponível devido a: (a) manutenção programada; (b) problemas técnicos ou interrupções não programadas; (c) eventos além do controle razoável da BrazilianClean; (d) ações de fornecedores de serviços terceirizados.',
        'A BrazilianClean envidará esforços comercialmente razoáveis para manter a disponibilidade da Plataforma e fornecer aviso prévio de manutenção programada quando praticável. No entanto, a BrazilianClean não será responsável por quaisquer danos, perdas ou inconvenientes causados pela indisponibilidade da Plataforma.',
        'A BrazilianClean reserva-se o direito de descontinuar, suspender ou modificar qualquer recurso da Plataforma a qualquer momento, com ou sem aviso.',
      ],
    },
    {
      id: 's24',
      title: '24. Serviços de Terceiros',
      content: [
        'A Plataforma integra-se e depende de serviços e provedores terceirizados, que atualmente ou futuramente podem incluir: Stripe (processamento de pagamentos), Twilio (SMS e comunicações), Amazon Web Services (infraestrutura em nuvem), Vercel (hospedagem), Google Maps (geolocalização) e outros provedores de serviços conforme necessário para a operação da Plataforma.',
        'A BrazilianClean não é responsável pelos atos, omissões, políticas ou termos de qualquer provedor de serviços terceirizado. O uso de serviços de terceiros é regido pelos respectivos termos de serviço e políticas de privacidade, que você é responsável por revisar.',
        'A BrazilianClean pode alterar, adicionar ou remover integrações de serviços de terceiros a qualquer momento. Alterações nos serviços de terceiros podem afetar a funcionalidade da Plataforma, e a BrazilianClean não será responsável por tais impactos.',
      ],
    },
    {
      id: 's25',
      title: '25. Privacidade',
      content: [
        'Sua privacidade é importante para a BrazilianClean. A coleta, uso, armazenamento e divulgação de suas informações pessoais é regida pela nossa Política de Privacidade, incorporada a estes Termos por referência e disponível em brazilianclean.com/privacy.',
        'Ao usar a Plataforma, você consente com a coleta e uso de suas informações pessoais conforme descrito na Política de Privacidade. Se você não concordar com nossas práticas de privacidade, deverá descontinuar o uso da Plataforma.',
        'A BrazilianClean implementa medidas de segurança comercialmente razoáveis para proteger suas informações pessoais, mas não pode garantir segurança absoluta. Você reconhece que a transmissão de dados pela internet carrega riscos inerentes.',
      ],
    },
    {
      id: 's26',
      title: '26. Propriedade Intelectual',
      content: [
        'Todos os direitos de propriedade intelectual da Plataforma BrazilianClean, incluindo, sem limitação: o nome BrazilianClean, logotipo, marcas registradas, marcas de serviço, apresentação comercial, design do site, aplicativo móvel, código-fonte, algoritmos, bancos de dados, conteúdo e toda a documentação relacionada, são de propriedade da BrazilianClean ou de seus licenciadores.',
        'Nada nestes Termos concede a você qualquer direito, título ou interesse na propriedade intelectual da BrazilianClean. Você recebe uma licença limitada, não exclusiva, intransferível e revogável para usar a Plataforma exclusivamente para seus fins pretendidos, de acordo com estes Termos.',
        'Qualquer uso não autorizado, reprodução, modificação ou distribuição da propriedade intelectual da BrazilianClean é estritamente proibido e pode resultar em responsabilidade civil e criminal. A BrazilianClean monitora e aplica ativamente seus direitos de propriedade intelectual.',
      ],
    },
    {
      id: 's27',
      title: '27. Confidencialidade',
      content: [
        'Os usuários podem ter acesso a informações sobre outros usuários compartilhadas em confiança por meio da Plataforma, incluindo informações pessoais de contato, detalhes da propriedade e preferências de serviço. Todas essas informações devem ser usadas exclusivamente para fins de facilitação de serviços organizados por meio da Plataforma.',
        'Você concorda em não: (a) compartilhar informações pessoais de outros usuários com terceiros sem seu consentimento explícito; (b) usar as informações de outros usuários para marketing, solicitação ou qualquer finalidade não relacionada aos serviços da Plataforma; (c) reter ou usar informações pessoais obtidas pela Plataforma após o término de seu relacionamento com esse usuário.',
        'Esta obrigação de confidencialidade sobrevive ao encerramento de sua conta e destes Termos. Violações desta seção podem resultar em responsabilidade legal e encerramento de conta.',
      ],
    },
    {
      id: 's28',
      title: '28. Impostos',
      content: [
        'Cada usuário é o único responsável por determinar e cumprir suas próprias obrigações fiscais decorrentes de atividades na Plataforma. Para as Faxineiras, isso inclui imposto de renda federal e estadual, imposto sobre trabalho autônomo e quaisquer impostos comerciais locais aplicáveis.',
        'A BrazilianClean pode emitir formulários fiscais (como o Formulário IRS 1099-K ou 1099-NEC) para Faxineiras que atendam aos limites aplicáveis, conforme exigido por lei. É responsabilidade de cada Faxineira manter registros precisos de renda obtida e despesas incorridas por meio da Plataforma.',
        'A BrazilianClean recomenda que todos os usuários consultem um profissional fiscal qualificado sobre sua situação fiscal específica. A BrazilianClean não fornece aconselhamento fiscal e não é responsável por qualquer obrigação fiscal, penalidades ou juros cobrados de qualquer usuário.',
      ],
    },
    {
      id: 's29',
      title: '29. Conformidade com as Leis',
      content: [
        'Todos os usuários concordam em cumprir todas as leis, regulamentos e portarias federais, estaduais e locais aplicáveis em conexão com o uso da Plataforma. Isso inclui, mas não se limita a: leis de proteção ao consumidor, leis trabalhistas, leis antidiscriminação, leis ambientais, requisitos de licenciamento e autorização, e leis fiscais.',
        'As Faxineiras reconhecem especificamente que são responsáveis pelo cumprimento de todas as leis aplicáveis a contratados independentes e pequenas empresas em sua jurisdição. A BrazilianClean não é responsável por orientar os usuários sobre os requisitos legais em suas localidades específicas.',
        'A BrazilianClean coopera com as autoridades policiais e regulatórias e pode divulgar informações sobre usuários quando exigido por lei ou ordem judicial. A BrazilianClean também pode reportar atividades ilegais suspeitas às autoridades competentes.',
      ],
    },
    {
      id: 's30',
      title: '30. Disputas entre Usuários',
      content: [
        'A BrazilianClean não é parte de disputas entre Clientes e Faxineiras a respeito da qualidade, integralidade, pontualidade ou qualquer outro aspecto dos serviços de limpeza. A BrazilianClean não é obrigada a mediar ou resolver disputas entre usuários.',
        'Embora a BrazilianClean possa, a seu exclusivo critério, tentar facilitar a resolução de disputas entre usuários como cortesia, tal assistência não cria qualquer obrigação, responsabilidade ou responsabilização para a BrazilianClean. A resolução final de qualquer disputa é de responsabilidade das partes envolvidas.',
        'Os usuários concordam em isentar a BrazilianClean e seus diretores, executivos, funcionários e agentes de quaisquer reclamações, demandas e danos de qualquer natureza decorrentes ou de qualquer forma relacionados a disputas entre usuários.',
      ],
    },
    {
      id: 's31',
      title: '31. Isenção de Garantias',
      content: [
        'A PLATAFORMA BRAZILIANCLEAN E TODOS OS SERVIÇOS SÃO FORNECIDOS "NO ESTADO EM QUE SE ENCONTRAM" E "CONFORME DISPONÍVEIS", SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS. NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL, A BRAZILIANCLEAN ISENTA EXPRESSAMENTE TODAS AS GARANTIAS, INCLUINDO, MAS NÃO SE LIMITANDO A: GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO, TÍTULO E NÃO VIOLAÇÃO.',
        'A BRAZILIANCLEAN NÃO GARANTE QUE: (A) A PLATAFORMA ATENDERÁ AOS SEUS REQUISITOS; (B) A PLATAFORMA ESTARÁ DISPONÍVEL, ININTERRUPTA, OPORTUNA, SEGURA OU LIVRE DE ERROS; (C) QUALQUER INFORMAÇÃO OBTIDA PELA PLATAFORMA SERÁ PRECISA, CONFIÁVEL OU COMPLETA; (D) QUAISQUER DEFEITOS NA PLATAFORMA SERÃO CORRIGIDOS.',
        'ALGUMAS JURISDIÇÕES NÃO PERMITEM A EXCLUSÃO DE CERTAS GARANTIAS. NESSAS JURISDIÇÕES, AS EXCLUSÕES ACIMA SE APLICAM NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL.',
      ],
    },
    {
      id: 's32',
      title: '32. Limitação de Responsabilidade',
      content: [
        'NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL, EM NENHUMA CIRCUNSTÂNCIA A BRAZILIANCLEAN, SEUS EXECUTIVOS, DIRETORES, FUNCIONÁRIOS, AGENTES, LICENCIADORES OU PROVEDORES DE SERVIÇOS SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS, PUNITIVOS OU EXEMPLARES, INCLUINDO, MAS NÃO SE LIMITANDO A: PERDA DE RECEITA, PERDA DE LUCROS, PERDA DE NEGÓCIOS, PERDA DE DADOS, DANOS À PROPRIEDADE OU LESÕES PESSOAIS, DECORRENTES DE OU EM CONEXÃO COM O SEU USO DA PLATAFORMA.',
        'EM NENHUMA CIRCUNSTÂNCIA A RESPONSABILIDADE TOTAL CUMULATIVA DA BRAZILIANCLEAN PARA COM VOCÊ POR QUAISQUER E TODAS AS RECLAMAÇÕES DECORRENTES DE OU RELACIONADAS A ESTES TERMOS OU AO SEU USO DA PLATAFORMA EXCEDERÁ O MAIOR DOS SEGUINTES VALORES: (A) O VALOR TOTAL PAGO POR VOCÊ À BRAZILIANCLEAN DURANTE OS DOZE (12) MESES IMEDIATAMENTE ANTERIORES À RECLAMAÇÃO; OU (B) CEM DÓLARES AMERICANOS (USD $100,00).',
        'ALGUMAS JURISDIÇÕES NÃO PERMITEM A LIMITAÇÃO OU EXCLUSÃO DE RESPONSABILIDADE POR DANOS INCIDENTAIS OU CONSEQUENCIAIS. NESSAS JURISDIÇÕES, A RESPONSABILIDADE DA BRAZILIANCLEAN ESTÁ LIMITADA À MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL.',
      ],
    },
    {
      id: 's33',
      title: '33. Indenização',
      content: [
        'Você concorda em defender, indenizar e isentar de responsabilidade a BrazilianClean e seus executivos, diretores, funcionários, contratados, agentes, licenciadores e provedores de serviços de e contra quaisquer e todas as reclamações, responsabilidades, danos, julgamentos, prêmios, perdas, custos, despesas e honorários (incluindo honorários advocatícios razoáveis) decorrentes de ou relacionados a: (a) sua violação destes Termos; (b) seu uso ou mau uso da Plataforma; (c) sua violação de quaisquer direitos de terceiros, incluindo, sem limitação, direitos de privacidade ou propriedade intelectual.',
        'Obrigações adicionais de indenização se aplicam a: (d) quaisquer serviços de limpeza que você preste ou receba pela Plataforma; (e) sua violação de qualquer lei ou regulamento aplicável; (f) qualquer conteúdo que você envie à Plataforma; (g) qualquer disputa entre você e outro usuário.',
        'A BrazilianClean reserva-se o direito, às suas próprias expensas, de assumir a defesa e controle exclusivos de qualquer questão sujeita a indenização por você, caso em que você concorda em cooperar plenamente com a defesa da BrazilianClean.',
      ],
    },
    {
      id: 's34',
      title: '34. Acordo de Arbitragem',
      content: [
        'LEIA ESTA SEÇÃO COM ATENÇÃO. ELA EXIGE QUE VOCÊ RESOLVA DISPUTAS COM A BRAZILIANCLEAN POR ARBITRAGEM E LIMITA A FORMA COMO VOCÊ PODE BUSCAR REPARAÇÃO.',
        'Exceto para disputas qualificadas para tribunais de pequenas causas e certas disputas de propriedade intelectual, você e a BrazilianClean concordam que qualquer disputa, controvérsia ou reclamação decorrente de ou relacionada a estes Termos ou ao seu uso da Plataforma será resolvida por arbitragem individual vinculante administrada pela American Arbitration Association ("AAA") sob suas Regras de Arbitragem ao Consumidor.',
        'A arbitragem será conduzida em inglês, no Estado de Connecticut, a menos que as partes concordem de outra forma. A decisão do árbitro será final e vinculante e poderá ser registrada como sentença em qualquer tribunal competente. Cada parte arcará com seus próprios custos e honorários advocatícios, exceto conforme exigido pelas Regras da AAA ou lei aplicável.',
      ],
    },
    {
      id: 's35',
      title: '35. Renúncia à Ação Coletiva',
      content: [
        'VOCÊ E A BRAZILIANCLEAN CONCORDAM QUE CADA UM PODE APRESENTAR RECLAMAÇÕES CONTRA O OUTRO APENAS EM CAPACIDADE INDIVIDUAL, E NÃO COMO AUTOR OU MEMBRO DE CLASSE EM QUALQUER AÇÃO COLETIVA, CONSOLIDADA OU REPRESENTATIVA PRESUMIDA.',
        'A menos que você e a BrazilianClean concordem de outra forma, o árbitro não pode consolidar as reclamações de mais de uma pessoa e não pode presidir qualquer forma de processo representativo ou coletivo. O árbitro pode conceder reparação apenas em favor da parte individual que busca reparação e apenas na medida necessária para fornecer a reparação garantida pela reclamação individual dessa parte.',
        'Se um tribunal determinar que esta renúncia à ação coletiva é inexequível para uma reclamação específica, então essa reclamação específica deve ser separada da arbitragem e pode prosseguir no tribunal.',
      ],
    },
    {
      id: 's36',
      title: '36. Renúncia ao Julgamento por Júri',
      content: [
        'NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL, VOCÊ E A BRAZILIANCLEAN RENUNCIAM EXPRESSAMENTE A QUALQUER DIREITO A JULGAMENTO POR JÚRI EM QUALQUER AÇÃO, PROCESSO OU RECLAMAÇÃO DECORRENTE DE OU RELACIONADA A ESTES TERMOS OU AO SEU USO DA PLATAFORMA.',
        'Esta renúncia se aplica a todas as disputas, independentemente de serem baseadas em contrato, delito, estatuto ou qualquer outra teoria legal. Ao usar a Plataforma, você reconhece ter tido a oportunidade de consultar assessoria jurídica e fazer esta renúncia de forma consciente e voluntária.',
        'Esta renúncia ao julgamento por júri não se aplica em jurisdições onde tais renúncias são proibidas por lei. Nessas jurisdições, esta disposição será separada e o restante destes Termos continuará em pleno vigor e efeito.',
      ],
    },
    {
      id: 's37',
      title: '37. Lei Aplicável',
      content: [
        'Estes Termos e qualquer disputa decorrente de ou relacionada a eles ou ao seu uso da Plataforma serão regidos e interpretados de acordo com as leis do Estado de Connecticut, Estados Unidos, sem considerar seus princípios de conflito de leis.',
        'As partes reconhecem e concordam que Connecticut tem relação substancial com as partes e com esta transação. A aplicação das leis de qualquer outra jurisdição é expressamente excluída.',
        'Nada nesta seção deve ser interpretado como limitando a capacidade da BrazilianClean de buscar medida cautelar ou outro remédio equitativo em qualquer tribunal competente para proteger seus direitos de propriedade intelectual ou prevenir dano irreparável.',
      ],
    },
    {
      id: 's38',
      title: '38. Foro',
      content: [
        'Para qualquer disputa que não esteja sujeita a arbitragem, ou para a execução de uma sentença arbitral, cada parte consente com a jurisdição pessoal e foro exclusivo nos tribunais estaduais e federais localizados no Estado de Connecticut, Estados Unidos.',
        'Cada parte renuncia a qualquer objeção à atribuição de competência a esses tribunais e renuncia a qualquer alegação de que tais tribunais sejam um foro inconveniente. A citação em qualquer processo pode ser feita de qualquer maneira permitida por lei.',
        'Não obstante o exposto, a BrazilianClean pode buscar medida cautelar de emergência em qualquer tribunal competente para prevenir dano irreparável pendente de resolução de uma disputa.',
      ],
    },
    {
      id: 's39',
      title: '39. Força Maior',
      content: [
        'A BrazilianClean não será responsável por qualquer falha ou atraso no cumprimento de suas obrigações nos termos deste acordo se tal falha ou atraso for causado por eventos além de seu controle razoável, incluindo, mas não se limitando a: atos de Deus, desastres naturais, epidemias ou pandemias, guerra, terrorismo, distúrbios civis, ações governamentais, disputas trabalhistas, falhas de energia, interrupções de internet ou falhas de prestadores de serviços terceirizados.',
        'No caso de um evento de força maior, a BrazilianClean empregará esforços comercialmente razoáveis para retomar as operações normais o mais rápido possível. A BrazilianClean fornecerá notificação do evento de força maior na medida razoavelmente praticável.',
        'Se um evento de força maior continuar por mais de sessenta (60) dias e afetar materialmente a capacidade da BrazilianClean de fornecer os Serviços, qualquer uma das partes poderá rescindir este acordo mediante notificação por escrito, sem responsabilidade para a outra parte.',
      ],
    },
    {
      id: 's40',
      title: '40. Suspensão e Encerramento de Conta',
      content: [
        'A BrazilianClean reserva-se o direito de suspender, restringir ou encerrar permanentemente a conta de qualquer usuário e o acesso à Plataforma a qualquer momento, com ou sem aviso, por qualquer motivo, incluindo, mas não se limitando a: violação destes Termos, atividade fraudulenta, dano a outros usuários, requisitos de conformidade legal ou comportamento que a BrazilianClean determine ser prejudicial à Plataforma ou a seus usuários.',
        'Após o encerramento de sua conta: (a) sua licença de uso da Plataforma cessa imediatamente; (b) você deve interromper todo uso da Plataforma; (c) a BrazilianClean pode excluir os dados da sua conta de acordo com nossa Política de Privacidade; (d) quaisquer pagamentos pendentes podem ser retidos enquanto se investiga o motivo do encerramento.',
        'Você também pode encerrar sua própria conta a qualquer momento entrando em contato com support@brazilianclean.com. O encerramento não o isenta de obrigações incorridas antes do encerramento, incluindo obrigações de pagamento, obrigações de indenização e conformidade com o acordo de arbitragem.',
      ],
    },
    {
      id: 's41',
      title: '41. Alterações nos Termos',
      content: [
        'A BrazilianClean reserva-se o direito de modificar, alterar ou atualizar estes Termos a qualquer momento. Quando houver alterações, a BrazilianClean atualizará a data de "Última atualização" no topo deste documento e, para alterações relevantes, fornecerá aviso pela Plataforma, por e-mail ou por outros meios razoáveis.',
        'É sua responsabilidade revisar periodicamente estes Termos para verificar alterações. O uso continuado da Plataforma após a data de vigência de quaisquer alterações constitui sua aceitação dos Termos atualizados. Se você não concordar com os Termos atualizados, deverá parar de usar a Plataforma.',
        'Para alterações significativas que afetem materialmente seus direitos, a BrazilianClean envidará esforços para fornecer pelo menos 30 dias de aviso prévio. No entanto, alterações exigidas por lei podem entrar em vigor imediatamente.',
      ],
    },
    {
      id: 's42',
      title: '42. Divisibilidade',
      content: [
        'Se qualquer disposição destes Termos for considerada inválida, ilegal, inexequível ou contrária à lei aplicável por um tribunal de jurisdição competente ou árbitro, essa disposição será considerada modificada na extensão mínima necessária para torná-la válida e exequível, ou, se não puder ser assim modificada, será separada destes Termos.',
        'A invalidade ou inexequibilidade de qualquer disposição não afetará a validade ou exequibilidade de qualquer outra disposição destes Termos, que permanecerão em pleno vigor e efeito.',
        'As partes pretendem que estes Termos sejam aplicados na máxima extensão permitida pela lei aplicável, e as partes concordam que qualquer tribunal pode modificar qualquer disposição inexequível na extensão mínima necessária, preservando a intenção original das partes.',
      ],
    },
    {
      id: 's43',
      title: '43. Não Renúncia',
      content: [
        'A falha da BrazilianClean em fazer cumprir qualquer direito ou disposição destes Termos a qualquer momento não deve ser interpretada como renúncia a tal direito ou disposição. Qualquer renúncia a qualquer disposição destes Termos só será eficaz se feita por escrito e assinada por um representante autorizado da BrazilianClean.',
        'A renúncia a qualquer violação ou inadimplência específica não opera como renúncia a qualquer violação ou inadimplência subsequente da mesma ou de qualquer outra disposição. Os direitos e recursos da BrazilianClean nos termos deste acordo são cumulativos e não excludentes de quaisquer outros direitos ou recursos que a BrazilianClean possa ter perante a lei ou em equidade.',
        'Nenhuma ação ou inação da BrazilianClean deve ser interpretada como acordo para modificar ou renunciar a qualquer direito ou obrigação nos termos deste acordo.',
      ],
    },
    {
      id: 's44',
      title: '44. Cessão',
      content: [
        'Você não pode ceder, transferir, delegar ou sublicenciar seus direitos ou obrigações nos termos deste acordo, total ou parcialmente, sem o consentimento prévio por escrito da BrazilianClean. Qualquer cessão presumida em violação a esta seção é nula e sem efeito.',
        'A BrazilianClean pode ceder ou transferir livremente estes Termos, ou quaisquer direitos ou obrigações aqui previstos, sem restrição e sem seu consentimento prévio, inclusive em conexão com uma fusão, aquisição, reorganização corporativa, venda de todos ou substancialmente todos os ativos da BrazilianClean, ou por operação de lei.',
        'No caso de qualquer cessão permitida pela BrazilianClean, o cessionário assumirá todos os direitos e obrigações nos termos deste acordo. Você será notificado de qualquer cessão relevante que afete seus direitos.',
      ],
    },
    {
      id: 's45',
      title: '45. Acordo Integral',
      content: [
        'Estes Termos, juntamente com a Política de Privacidade, Política de Reembolso e quaisquer outras políticas, diretrizes ou termos suplementares incorporados por referência, constituem o acordo integral entre você e a BrazilianClean com relação ao seu uso da Plataforma, e substituem todos os acordos, entendimentos, negociações e discussões anteriores e contemporâneos, orais ou escritos, entre as partes.',
        'Nenhuma representação oral, declaração ou indução por qualquer uma das partes modificará ou emendará estes Termos, a menos que constante de instrumento escrito assinado por representantes autorizados de ambas as partes.',
        'Em caso de conflito entre estes Termos e qualquer acordo ou política suplementar, estes Termos prevalecerão, a menos que o acordo ou política suplementar afirme expressamente que substitui estes Termos para uma questão específica.',
      ],
    },
    {
      id: 's46',
      title: '46. Informações de Contato',
      content: [
        'Se você tiver quaisquer dúvidas, preocupações ou solicitações relacionadas a estes Termos de Serviço, entre em contato conosco:',
        'BrazilianClean — Suporte ao Cliente\nE-mail: support@brazilianclean.com\nSite: https://brazilianclean.com\nTempo de resposta: Visamos responder a todas as consultas em até 2 dias úteis.',
        'Para notificações legais, incluindo notificações relacionadas a arbitragem, envie correspondência por escrito para: support@brazilianclean.com com o assunto "Aviso Legal".',
      ],
    },
  ],
};

export const termsContent: Record<Locale, TermsContent> = { en, pt };
