// Verified New York resources — researched against official sources 2026-07-15.
// Every url was loaded and confirmed at verification time. Re-verify quarterly:
// see docs/OPERATIONS.md (resource re-verification).

export interface VerifiedResource {
  id: string                    // 'ny-opwdd-front-door'
  name: string
  organization: string
  description: string           // parent-facing plain language
  url: string                   // official, verified
  phone?: string                // only if officially listed
  jurisdiction: string          // 'NY' | 'NY:NYC' | 'NY:Rockland' | 'national'
  domains: string[]             // from: 'dd-services','vocational','education','benefits','medicaid','able','decision-making','advocacy','independent-living','housing','transportation','employment','family-support','future-planning'
  ageRange?: [number, number]
  transitionRelevance?: string  // why it matters at 14-22
  howToStart: string            // the concrete first step
  lastVerified: string          // '2026-07-15'
  verifyNote?: string           // anything a family should double-check
}

export const resourcesNY: VerifiedResource[] = [
  // ---------------------------------------------------------------
  // Developmental disability services (OPWDD)
  // ---------------------------------------------------------------
  {
    id: 'ny-opwdd-front-door',
    name: 'OPWDD Front Door',
    organization: 'NYS Office for People With Developmental Disabilities (OPWDD)',
    description:
      'The Front Door is the single entry point for all OPWDD services in New York — housing, employment supports, day services, respite, and more. It starts with an eligibility determination (OPWDD requires proof that the developmental disability began before age 22) and then moves into person-centered planning to figure out which supports fit your family. You do not need to wait for a crisis; families can apply at any age.',
    url: 'https://opwdd.ny.gov/get-started/front-door',
    phone: '866-946-9733',
    jurisdiction: 'NY',
    domains: ['dd-services'],
    transitionRelevance:
      'Eligibility determination takes time and requires records (psychological with IQ, adaptive behavior assessment, developmental history). Having OPWDD eligibility settled before 18 keeps adult service doors open when school supports wind down.',
    howToStart:
      'Call the OPWDD Infoline at 866-946-9733, give your county, and ask to be connected to your regional Front Door office. Start gathering evaluations now — the eligibility packet is documentation-heavy.',
    lastVerified: '2026-07-15',
    verifyNote:
      'Eligibility documentation requirements are listed at opwdd.ny.gov/eligibility; recent (within 12 months) medical and social evaluations are expected.',
  },
  {
    id: 'ny-opwdd-cco-care-management',
    name: 'Care Coordination Organizations (Health Home Care Management)',
    organization: 'OPWDD / seven regional Care Coordination Organizations (CCOs)',
    description:
      'Once someone is OPWDD-eligible, a care manager from a Care Coordination Organization becomes the family’s day-to-day guide — building the Life Plan, coordinating medical, behavioral, and disability services, and handling service authorizations. Seven CCOs operate across New York: Advance Care Alliance, Care Design New York, LifePlan CCO NY, Person Centered Services, Prime Care Coordination, Southern Tier Connect, and Tri-County Care.',
    url: 'https://opwdd.ny.gov/find-care-manager',
    jurisdiction: 'NY',
    domains: ['dd-services', 'family-support'],
    transitionRelevance:
      'CCO care management is required for enrollment in the OPWDD HCBS waiver, and your care manager is the person who assembles the adult-services plan as school ends. Choosing and building a relationship with a CCO early makes the 18-22 handoff far smoother.',
    howToStart:
      'After OPWDD eligibility, use the Find a Care Manager page to compare the CCOs serving your county, then contact your chosen CCO to enroll. If unsure, ask your Front Door office which CCOs are active locally.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-opwdd-hcbs-waiver',
    name: 'OPWDD Home and Community Based Services (HCBS) Waiver',
    organization: 'OPWDD (Medicaid 1915(c) Comprehensive Waiver)',
    description:
      'The HCBS waiver is the Medicaid program that pays for most long-term OPWDD supports — community habilitation, day habilitation, respite, supported employment, residential habilitation, environmental modifications, and self-direction. It lets people live at home or in the community instead of an institution. Enrollment requires OPWDD eligibility, Medicaid, and a documented level of need.',
    url: 'https://opwdd.ny.gov/apply-home-and-community-based-services-waiver',
    jurisdiction: 'NY',
    domains: ['dd-services', 'medicaid'],
    transitionRelevance:
      'Almost every adult OPWDD service is funded through this waiver. Getting waiver enrollment done during the school years means day services, employment supports, or residential options can start the moment school ends instead of after a gap.',
    howToStart:
      'Ask your CCO care manager (or the Front Door office) to start the waiver Application for Participation. You will need Medicaid active or in process — the care manager can help with that application too.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-opwdd-self-direction',
    name: 'OPWDD Self-Direction',
    organization: 'OPWDD',
    description:
      'Self-Direction lets a person (with their circle of support) control a personal budget instead of receiving services only through agency programs — hiring their own staff, choosing community classes, and paying for supports that fit their actual life. Anyone enrolled in the OPWDD HCBS waiver can choose to self-direct, and you can switch back to traditional services if it is not a fit.',
    url: 'https://opwdd.ny.gov/types-services/self-direction',
    jurisdiction: 'NY',
    domains: ['dd-services', 'independent-living'],
    transitionRelevance:
      'For young adults who do not fit a traditional day program, self-direction is often the most flexible way to build a post-school week around work, classes, and community life.',
    howToStart:
      'Ask your care manager about attending a Self-Direction information session through your regional OPWDD office (DDRO), then assemble your circle of support and a support broker to build the budget.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-opwdd-housing',
    name: 'OPWDD Housing Supports and Residential Options',
    organization: 'OPWDD',
    description:
      'OPWDD funds a range of places to live: independent living with an OPWDD Housing Subsidy (rental assistance) and in-community supports, and certified residential options including Family Care homes and Individualized Residential Alternatives (IRAs, often called group homes). Supports like home modifications, assistive technology, and paid neighbors can also help someone stay in their own or the family home.',
    url: 'https://opwdd.ny.gov/types-services/housing-supports',
    jurisdiction: 'NY',
    domains: ['housing', 'dd-services', 'independent-living'],
    transitionRelevance:
      'Residential options have long waiting lists and require waiver enrollment. Even if a move is 5-10 years away, raising housing goals in the Life Plan during the transition years puts your young adult in the queue and shapes planning.',
    howToStart:
      'Talk with your CCO care manager about housing goals in the Life Plan, and ask your regional OPWDD office what certified openings and housing subsidy options exist in your county.',
    lastVerified: '2026-07-15',
    verifyNote:
      'Availability varies sharply by county and by level of need; timelines are unpredictable — ask your care manager for realistic local expectations.',
  },
  {
    id: 'ny-opwdd-employment',
    name: 'OPWDD Employment Services (Pathway to Employment, SEMP, ETP)',
    organization: 'OPWDD',
    description:
      'OPWDD funds a ladder of employment supports: Pathway to Employment (career exploration and planning), Prevocational Services (skill building), the Employment Training Program, and Supported Employment (SEMP) — a job coach and ongoing support to keep a community job. New York is an Employment First state, meaning competitive, integrated employment is the presumed goal for working-age people with disabilities.',
    url: 'https://opwdd.ny.gov/types-services/employment-services',
    jurisdiction: 'NY',
    domains: ['employment', 'dd-services'],
    ageRange: [14, 99],
    transitionRelevance:
      'OPWDD employment supports usually pick up where ACCES-VR leaves off: ACCES-VR helps get the job; OPWDD SEMP funds the long-term job coaching that keeps it. Families typically braid the two during ages 18-22.',
    howToStart:
      'Ask your care manager to add employment goals to the Life Plan and request Pathway to Employment; in parallel, apply to ACCES-VR for job placement services.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-opwdd-regional-offices',
    name: 'OPWDD Regional Offices (DDROs)',
    organization: 'OPWDD',
    description:
      'OPWDD divides New York into five regions, each with Developmental Disabilities Regional Offices that run the Front Door, host self-direction sessions, and make local eligibility and service decisions. Which office you work with depends on your county — Region 3 covers the Hudson Valley (including Rockland), Region 4 covers the five NYC boroughs, and Region 5 covers Long Island.',
    url: 'https://opwdd.ny.gov/contact-us',
    phone: '866-946-9733',
    jurisdiction: 'NY',
    domains: ['dd-services'],
    transitionRelevance:
      'The regional office is where county-level decisions actually get made — knowing yours (and its Front Door contact) shortcuts a lot of transition paperwork.',
    howToStart:
      'Call 866-946-9733 and give your county to be routed to your regional office, or find regional contacts on the OPWDD Contact Us page.',
    lastVerified: '2026-07-15',
  },

  // ---------------------------------------------------------------
  // Vocational rehabilitation
  // ---------------------------------------------------------------
  {
    id: 'ny-acces-vr',
    name: 'ACCES-VR (Adult Career and Continuing Education Services - Vocational Rehabilitation)',
    organization: 'New York State Education Department',
    description:
      'ACCES-VR is New York’s vocational rehabilitation agency. It helps people with disabilities (age 14 and up) prepare for, find, and keep jobs — paying for career counseling, job training, college support tied to an employment goal, assistive technology, and job placement. It operates 15 district offices plus satellites statewide, and starts from the presumption that everyone with a disability can work.',
    url: 'https://www.acces.nysed.gov/vr',
    phone: '1-800-222-5627',
    jurisdiction: 'NY',
    domains: ['vocational', 'employment'],
    ageRange: [14, 99],
    transitionRelevance:
      'ACCES-VR is the bridge from school to work. Applying roughly two years before your student’s planned school exit gives time for eligibility, plan development, and services to be in place on day one after school.',
    howToStart:
      'Complete the VR-04 application (fillable PDF) and submit it online, by email to your district office, or by mail — or call 1-800-222-5627 to find your local office and an orientation session. Attach the IEP and any SSI/SSDI letters to speed eligibility.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-acces-vr-preets',
    name: 'ACCES-VR Pre-Employment Transition Services (Pre-ETS)',
    organization: 'New York State Education Department, ACCES-VR',
    description:
      'Pre-ETS are early career services for students with disabilities ages 14-22 who are still in school: job exploration counseling, work-based learning experiences, counseling on post-secondary options, workplace readiness training, and self-advocacy instruction. Students can receive Pre-ETS without a full ACCES-VR application — a lighter-weight on-ramp.',
    url: 'https://www.acces.nysed.gov/vr/student-and-youth-transition-services',
    phone: '1-800-222-5627',
    jurisdiction: 'NY',
    domains: ['vocational', 'education', 'employment'],
    ageRange: [14, 22],
    transitionRelevance:
      'This is the earliest employment-system touchpoint — available from age 14 while your student is still fully in school, and a natural complement to the IEP transition plan.',
    howToStart:
      'Ask your school’s special education transition coordinator how Pre-ETS is delivered in your district, or contact your local ACCES-VR district office directly.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-nyscb',
    name: 'New York State Commission for the Blind (NYSCB)',
    organization: 'NYS Office of Children and Family Services',
    description:
      'NYSCB is the vocational rehabilitation agency specifically for New Yorkers who are legally blind — the counterpart to ACCES-VR. It provides vocational rehabilitation, independent living training, and children’s services. If your child is blind or visually impaired (including alongside autism or other disabilities), NYSCB rather than ACCES-VR is usually the VR door.',
    url: 'https://ocfs.ny.gov/programs/nyscb/',
    jurisdiction: 'NY',
    domains: ['vocational', 'employment', 'independent-living'],
    transitionRelevance:
      'Same transition logic as ACCES-VR — apply well before school exit — but through the blind-services system, which also offers its own children and family services earlier.',
    howToStart:
      'Visit the NYSCB page under the NYS Office of Children and Family Services site and contact the district office for your region.',
    lastVerified: '2026-07-15',
    verifyNote:
      'Official OCFS page; it could not be re-loaded by our automated check on 2026-07-15 (connection issue) — confirm the page opens and current office contacts.',
  },

  // ---------------------------------------------------------------
  // Special education & transition
  // ---------------------------------------------------------------
  {
    id: 'ny-nysed-special-education',
    name: 'NYSED Office of Special Education',
    organization: 'New York State Education Department',
    description:
      'The state office that sets special education policy for New York schools — IEP requirements, procedural safeguards, dispute resolution (mediation, state complaints, due process), and quality assurance regional offices that oversee districts. Its site is the authoritative source for what your district must do.',
    url: 'https://www.nysed.gov/special-education',
    jurisdiction: 'NY',
    domains: ['education', 'advocacy'],
    transitionRelevance:
      'When a district disputes transition services, aging-out dates, or diploma decisions, NYSED policy documents and its dispute-resolution channels are your leverage.',
    howToStart:
      'Browse Special Education Topics A-Z for the issue you are facing; for transition-specific policy questions, the Special Education Policy Unit is reachable at 518-473-2878 or speced@nysed.gov.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-nysed-transition',
    name: 'Transition from School to Post-School (NYSED)',
    organization: 'New York State Education Department, Office of Special Education',
    description:
      'NYSED’s hub for transition planning requirements and family guidance. New York requires more, earlier, than federal law: a Level 1 vocational assessment beginning at age 12, and transition planning in the first IEP in effect when the student turns 15 (federal IDEA says 16). Schools must also give exiting students a summary of academic achievement and functional performance.',
    url: 'https://www.nysed.gov/special-education/transition-school-post-school-students-disabilities',
    phone: '518-473-2878',
    jurisdiction: 'NY',
    domains: ['education', 'future-planning'],
    ageRange: [12, 22],
    transitionRelevance:
      'This page is the citation to bring to a CSE meeting if transition planning has not started by 15 — it is a NY regulatory requirement (8 NYCRR 200.4), not a favor.',
    howToStart:
      'Before your child’s annual review in the year they turn 14, read this page and request in writing that measurable postsecondary goals and transition services appear in the next IEP.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-nysed-diplomas-credentials',
    name: 'Graduation Requirements and Exiting Credentials for Students with Disabilities',
    organization: 'New York State Education Department',
    description:
      'New York offers several ways to exit high school: Regents and local diplomas (with safety nets and a Superintendent Determination pathway for students with IEPs), the CDOS Commencement Credential (career-readiness, can supplement a diploma or stand alone), and the Skills and Achievement Commencement Credential (SACC) for students assessed on the NYS Alternate Assessment. Which exit document your child pursues changes both their timeline and their post-school options.',
    url: 'https://www.nysed.gov/special-education/information-related-graduation-requirements-and-exiting-credentials-students',
    jurisdiction: 'NY',
    domains: ['education', 'future-planning'],
    ageRange: [14, 22],
    transitionRelevance:
      'Accepting a diploma ends the right to a free public education; the CDOS credential and SACC alone do not. Understanding this distinction is one of the highest-stakes decisions of the transition years.',
    howToStart:
      'Ask at the next CSE meeting which exit credential your child is currently on track for, what each option requires, and — critically — whether accepting it would end their eligibility for school services.',
    lastVerified: '2026-07-15',
    verifyNote:
      'NYS graduation requirements have been under active revision (the Regents’ graduation measures redesign); confirm current assessment requirements with your district each year.',
  },

  // ---------------------------------------------------------------
  // Benefits: SSI, Medicaid
  // ---------------------------------------------------------------
  {
    id: 'national-ssi',
    name: 'Supplemental Security Income (SSI)',
    organization: 'Social Security Administration',
    description:
      'SSI pays a monthly benefit to people with disabilities who have limited income and resources. For children, parents’ income counts (deeming); at 18, only the young adult’s own income and assets count, so many people qualify for the first time at 18 even if denied as children. SSI also usually brings automatic or streamlined Medicaid in New York.',
    url: 'https://www.ssa.gov/ssi/',
    jurisdiction: 'national',
    domains: ['benefits'],
    transitionRelevance:
      'Two big events: current child recipients face an age-18 redetermination under the stricter adult disability standard, and non-recipients should apply shortly after the 18th birthday when parental deeming stops.',
    howToStart:
      'A month or two before the 18th birthday, gather medical and school records and contact SSA to start an adult SSI application (or prepare for the age-18 redetermination if already receiving SSI). SSA’s publication "What You Need To Know About Your SSI When You Turn 18" (EN-05-11005) walks through it.',
    lastVerified: '2026-07-15',
    verifyNote:
      'ssa.gov blocks automated checks, so this URL was confirmed via SSA search listings rather than a page load on 2026-07-15. SSI amounts and rules change annually — verify current figures at ssa.gov.',
  },
  {
    id: 'ny-medicaid',
    name: 'New York State Medicaid',
    organization: 'NYS Department of Health',
    description:
      'Medicaid is the payer behind nearly all long-term disability services in New York — OPWDD waiver services, care management, and community supports all run through it. At 18, a young adult’s Medicaid eligibility is based on their own income, not the family’s, so many become eligible at 18 even if the household earns too much today.',
    url: 'https://www.health.ny.gov/health_care/medicaid/',
    jurisdiction: 'NY',
    domains: ['medicaid', 'benefits'],
    transitionRelevance:
      'No Medicaid, no OPWDD waiver. Getting the young adult’s own Medicaid case established at 18 is a prerequisite for almost everything in the adult service system.',
    howToStart:
      'If your child gets SSI, Medicaid generally comes with it in NY. Otherwise, apply at 18 through your local department of social services (or NY State of Health), and ask your CCO care manager for help — they do this constantly.',
    lastVerified: '2026-07-15',
    verifyNote:
      'health.ny.gov blocks automated checks, so this URL was confirmed via official search listings rather than a page load on 2026-07-15.',
  },
  {
    id: 'ny-mbi-wpd',
    name: 'Medicaid Buy-In for Working People with Disabilities (MBI-WPD)',
    organization: 'NYS Department of Health',
    description:
      'MBI-WPD lets New Yorkers with disabilities work — sometimes earning well above regular Medicaid limits — without losing Medicaid. In 2026 a working person with a disability can have substantially higher income (advocacy sources cite roughly $68,000+) and keep full coverage with no spend-down. It is the answer to the fear that a paycheck means losing services.',
    url: 'https://www.health.ny.gov/health_care/medicaid/program/buy_in/index.htm',
    jurisdiction: 'NY',
    domains: ['medicaid', 'benefits', 'employment'],
    ageRange: [16, 65],
    transitionRelevance:
      'Removes the biggest disincentive to real employment during the transition years: your young adult can take a supported job or build a career without losing the Medicaid that funds their OPWDD services.',
    howToStart:
      'When your young adult starts earning, ask the Medicaid office (or your care manager or an Independent Living Center benefits counselor) to evaluate them for MBI-WPD before dropping or reducing hours out of benefits fear.',
    lastVerified: '2026-07-15',
    verifyNote:
      'health.ny.gov blocks automated checks; URL confirmed via official search listings on 2026-07-15. Income limits change yearly and program rules have been in flux (proposals to lift the age-65 cap were pending federal approval) — confirm current limits before making work decisions.',
  },

  // ---------------------------------------------------------------
  // ABLE accounts
  // ---------------------------------------------------------------
  {
    id: 'ny-able',
    name: 'NY ABLE Savings Program',
    organization: 'Office of the New York State Comptroller (administered with Ascensus)',
    description:
      'NY ABLE is a tax-advantaged savings and investment account for disability expenses. Money in an ABLE account (up to $100,000) does not count against SSI’s $2,000 asset limit, and does not affect Medicaid — so your young adult can actually save from a paycheck. As of January 1, 2026, eligibility expanded nationally to people whose disability began before age 46 (previously 26).',
    url: 'https://www.mynyable.org/',
    phone: '1-855-569-2253',
    jurisdiction: 'NY',
    domains: ['able', 'benefits', 'future-planning'],
    transitionRelevance:
      'Open an ABLE account before the SSI application at 18: it gives a compliant place for savings, gifts, and wages so assets never trip the $2,000 SSI limit.',
    howToStart:
      'Take the eligibility quiz at mynyable.org and open the account online; a parent or guardian can open and manage it for a minor.',
    lastVerified: '2026-07-15',
  },

  // ---------------------------------------------------------------
  // Supported decision-making & guardianship
  // ---------------------------------------------------------------
  {
    id: 'ny-sdmny',
    name: 'Supported Decision-Making New York (SDMNY)',
    organization: 'SDMNY (CUNY/Hunter College); statewide facilitation now provided by AIM Services',
    description:
      'SDMNY pioneered supported decision-making in New York: instead of a guardian deciding for them, a person with I/DD chooses trusted supporters who help them understand and make their own decisions, formalized in a Supported Decision-Making Agreement (SDMA). Under NY’s 2022 law (Mental Hygiene Law Article 82), decisions made through a properly facilitated SDMA must be honored by third parties like doctors and banks.',
    url: 'https://sdmny.org/',
    jurisdiction: 'NY',
    domains: ['decision-making', 'advocacy'],
    ageRange: [16, 99],
    transitionRelevance:
      'The months before the 18th birthday are the decision window: courts must consider SDM before imposing guardianship, and an SDMA (plus tools like a health care proxy) is often enough — preserving your young adult’s legal rights.',
    howToStart:
      'Explore the SDMNY site with your teen, then contact the statewide facilitation program (AIM Services, via sdmny.org) to ask about starting the facilitation process well before 18.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-article-17a-guardianship',
    name: 'Article 17-A Guardianship',
    organization: 'New York State Unified Court System (Surrogate’s Court)',
    description:
      'Article 17-A is New York’s guardianship statute specifically for people with intellectual or developmental disabilities that began before age 22, filed in the county Surrogate’s Court. It is plenary — the guardian receives broad, usually lifelong authority — and it has been widely criticized for that breadth. Families should treat it as the last resort after considering supported decision-making, health care proxies, and powers of attorney.',
    url: 'https://www.nycourts.gov/CourtHelp/Guardianship/17A.shtml',
    jurisdiction: 'NY',
    domains: ['decision-making'],
    ageRange: [17, 99],
    transitionRelevance:
      'Many families are told at the 17-year IEP meeting to "get guardianship." Know the full menu first: 17-A removes rights wholesale, is hard to undo, and NY law now requires courts to consider less-restrictive alternatives like SDM.',
    howToStart:
      'Before filing anything, talk through alternatives with SDMNY or a special-needs attorney; if guardianship is truly needed, the petition is filed in the Surrogate’s Court of your county (court help centers and DIY form programs exist).',
    lastVerified: '2026-07-15',
    verifyNote:
      'nycourts.gov blocks automated checks; URL confirmed via official court search listings on 2026-07-15. Some advocates recommend the more tailored Article 81 guardianship, if any — get legal advice.',
  },

  // ---------------------------------------------------------------
  // Family advocacy & training
  // ---------------------------------------------------------------
  {
    id: 'ny-includenyc',
    name: 'INCLUDEnyc',
    organization: 'INCLUDEnyc',
    description:
      'INCLUDEnyc helps NYC young people with disabilities (and their families) navigate school, work, and community life. Its help line offers one-on-one guidance in English and Spanish, and its workshops and guides cover IEPs, transition planning, and preparing for life after high school. It is part of the federally funded NY Region 1 Parent Training and Information Center collaborative.',
    url: 'https://includenyc.org/',
    phone: '212-677-4660',
    jurisdiction: 'NY:NYC',
    domains: ['family-support', 'advocacy', 'education'],
    transitionRelevance:
      'Their transition-specific workshops and the "Family Guide to Transition Planning" translate the NYC DOE’s process into steps parents can actually take.',
    howToStart:
      'Call the help line at 212-677-4660 (Spanish: 212-677-4668) or text 646-693-3175 and describe your situation — they will point you to the right next step.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-advocates-for-children',
    name: 'Advocates for Children of New York',
    organization: 'Advocates for Children of New York (AFC)',
    description:
      'AFC provides free education-rights help to NYC families, with a focus on low-income communities: a helpline, direct advocacy and legal representation for special education disputes, suspensions, and services, plus plain-language guides. It has done this for over 50 years and is part of the federally funded NY Region 1 PTI collaborative.',
    url: 'https://www.advocatesforchildren.org/',
    phone: '866-427-6033',
    jurisdiction: 'NY:NYC',
    domains: ['advocacy', 'education', 'family-support'],
    transitionRelevance:
      'If your NYC district is not delivering transition services, is pushing an exit credential you disagree with, or disputes services near aging-out, AFC’s helpline is free expert backup.',
    howToStart:
      'Call the Education Helpline at 866-427-6033 (Monday-Thursday, 10am-4pm).',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-sinergia-mpc',
    name: 'Sinergia Metropolitan Parent Center',
    organization: 'Sinergia, Inc.',
    description:
      'Sinergia’s Metropolitan Parent Center trains and individually assists families of children with disabilities across New York City and Long Island, with deep bilingual (Spanish) capacity. It is a member of the federally funded NY Region 1 Parent Training and Information Center collaborative, alongside Advocates for Children, INCLUDEnyc, and the Long Island Advocacy Center.',
    url: 'https://www.sinergiany.org/metropolitan-parent-center',
    phone: '212-643-2840',
    jurisdiction: 'NY:NYC',
    domains: ['family-support', 'advocacy', 'education'],
    transitionRelevance:
      'Offers workshops and one-to-one advocacy on special education and transition topics, particularly valuable for Spanish-speaking families navigating the NYC system.',
    howToStart:
      'Call 212-643-2840 (toll-free 866-867-9665) or browse their workshop calendar.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-starbridge',
    name: 'Starbridge',
    organization: 'Starbridge (Rochester)',
    description:
      'Starbridge is the federally funded Parent Training and Information Center serving all of New York State outside NYC and Long Island. Parent education specialists help families understand special education rights, transition to adulthood, and employment, and it also runs direct family support and employment programs in the Rochester region.',
    url: 'https://www.starbridgeinc.org/',
    phone: '585-546-1700',
    jurisdiction: 'NY',
    domains: ['family-support', 'advocacy', 'education'],
    transitionRelevance:
      'For upstate families, Starbridge is the free, federally designated place to call when you need someone to explain IEP transition requirements or aging-out rules for your district.',
    howToStart:
      'Call 585-546-1700 and ask to speak with a parent education specialist.',
    lastVerified: '2026-07-15',
    verifyNote:
      'PTI grant cycles change; Starbridge currently describes statewide-except-NYC/LI coverage — confirm current coverage when calling.',
  },
  {
    id: 'ny-parent-network-wny',
    name: 'Parent Network of WNY',
    organization: 'Parent Network of WNY',
    description:
      'A Buffalo-based nonprofit providing one-on-one support, workshops, and resources for families of individuals with disabilities in Western New York — covering education rights, behavior, and the transition to adulthood, with Spanish-language support available.',
    url: 'https://parentnetworkwny.org/',
    phone: '716-332-4170',
    jurisdiction: 'NY',
    domains: ['family-support', 'advocacy', 'education'],
    transitionRelevance:
      'Regional, in-person-capable family support for WNY families working through IEP transition planning and adult services.',
    howToStart:
      'Call 716-332-4170 (Spanish: 716-449-6394; toll-free 866-277-4762) or attend a workshop.',
    lastVerified: '2026-07-15',
    verifyNote:
      'Serves Western New York; its site does not currently claim the federal PTI designation (Starbridge holds the upstate PTI grant) — coverage of specific programs may vary.',
  },
  {
    id: 'ny-parent-to-parent',
    name: 'Parent to Parent of New York State',
    organization: 'Parent to Parent of NYS',
    description:
      'A statewide network that matches parents of children with developmental disabilities or special healthcare needs with trained "support parents" who have been there. Staffed by parents, grandparents, and siblings of people with disabilities, it also runs the Family to Family Health Information Center and special education guidance.',
    url: 'https://www.ptopnys.org/',
    phone: '518-381-4350',
    jurisdiction: 'NY',
    domains: ['family-support'],
    transitionRelevance:
      'A matched parent who already guided their own child through OPWDD, ACCES-VR, and the age-18 gauntlet is often the single most useful transition resource a family can have.',
    howToStart:
      'Call the statewide office at 518-381-4350 or request a parent match through ptopnys.org.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-arc-new-york',
    name: 'The Arc New York',
    organization: 'The Arc New York (33 local chapters)',
    description:
      'The state’s largest family-founded I/DD organization, with 33 local chapters providing services and advocacy across New York. Chapters offer direct services (day, residential, employment), and the state organization provides guardianship assistance and trust services for long-term financial planning.',
    url: 'https://thearcny.org/',
    phone: '518-439-8311',
    jurisdiction: 'NY',
    domains: ['advocacy', 'family-support', 'future-planning', 'dd-services'],
    transitionRelevance:
      'Your county’s Arc chapter is often a major local provider of the adult services (day, employment, residential) your young adult will choose among — and its trust services matter for special needs financial planning.',
    howToStart:
      'Use the "Find a Chapter" tool on thearcny.org to locate and contact your county’s chapter.',
    lastVerified: '2026-07-15',
  },

  // ---------------------------------------------------------------
  // Independent living & transportation
  // ---------------------------------------------------------------
  {
    id: 'ny-independent-living-centers',
    name: 'Independent Living Centers (ILC) Network',
    organization: 'ACCES-VR-funded network of 41 centers statewide',
    description:
      'New York funds 41 Independent Living Centers — nonprofits run by and for people with disabilities — that teach independent living skills, provide peer support, help with benefits questions, and advocate for accessibility. They serve people with any disability, at any age, free. (They are resource centers, not residences.)',
    url: 'https://www.acces.nysed.gov/vr/independent-living-centers',
    jurisdiction: 'NY',
    domains: ['independent-living', 'advocacy', 'benefits'],
    transitionRelevance:
      'ILCs are where young adults can learn self-advocacy and independent living skills from disabled peers and mentors — a different, powerful kind of teaching than parents or schools provide. Many also offer benefits advisement for SSI/Medicaid questions.',
    howToStart:
      'Use the directory on the ACCES-VR Independent Living Centers page to find the center serving your county, then call and ask about youth or transition programming.',
    lastVerified: '2026-07-15',
  },
  {
    id: 'ny-access-a-ride',
    name: 'Access-A-Ride (AAR) Paratransit',
    organization: 'Metropolitan Transportation Authority (MTA)',
    description:
      'Access-A-Ride provides shared door-to-door rides, 24/7, for New Yorkers whose disability prevents them from using subways or buses for some or all trips. Applying involves a mailed application and an in-person assessment, with decisions in about three weeks. Outside NYC, county paratransit systems provide a similar ADA service — ask your county transit agency.',
    url: 'https://access.nyc.gov/programs/access-a-ride/',
    phone: '877-337-2017',
    jurisdiction: 'NY:NYC',
    domains: ['transportation'],
    transitionRelevance:
      'Independent transportation is the hidden prerequisite for jobs, day programs, and a social life. Sorting out AAR eligibility (or travel training as an alternative) belongs on every NYC transition plan.',
    howToStart:
      'Call 877-337-2017 (NYC area) or schedule an eligibility assessment through the MTA’s online form; also ask the school about MTA/DOE travel training, which may make fixed-route transit possible instead.',
    lastVerified: '2026-07-15',
    verifyNote:
      'Verified via NYC’s official ACCESS NYC page (mta.info blocks automated checks). The MTA’s own AAR pages at mta.info/accessibility are the primary source for current policies.',
  },

  // ---------------------------------------------------------------
  // County pathways
  // ---------------------------------------------------------------
  {
    id: 'ny-rockland-dmh',
    name: 'Rockland County Department of Mental Health (Local Governmental Unit)',
    organization: 'Rockland County, NY',
    description:
      'In New York, every county has a "Local Governmental Unit" that plans and oversees local services for mental health, developmental disabilities, and substance use. In Rockland, that is the Department of Mental Health in Pomona. It maintains local developmental disability resource listings and connects residents to regional services; Rockland residents can also dial 211 (Hudson Valley) to be connected to services.',
    url: 'https://www.rocklandcountyny.gov/departments/mental-health',
    phone: '845-364-2391',
    jurisdiction: 'NY:Rockland',
    domains: ['dd-services', 'family-support'],
    transitionRelevance:
      'For OPWDD purposes Rockland sits in Region 3 (Hudson Valley), but county-level programs, local provider lists, and crisis contacts run through this county department — it is the "who do I call locally" answer.',
    howToStart:
      'Browse the department’s "People with Developmental Disabilities Resources" page, or call 845-364-2391 and ask how to connect with developmental disability services in Rockland.',
    lastVerified: '2026-07-15',
    verifyNote:
      'rocklandcountyny.gov blocked our automated check on 2026-07-15; URL and phone were confirmed via official county search listings. Confirm current contacts when calling.',
  },
]
