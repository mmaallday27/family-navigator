// New York state-specific navigation guidance — verified 2026-07-15 against
// official sources. This drives NY-aware milestones and insights.

export interface StateMilestone {
  id: string                   // 'ny-transition-planning-15'
  age: number                  // the age it becomes relevant
  title: string                // parent-facing
  detail: string               // what it is + why now, plain language
  action: string               // what the family should do
  source: { name: string; url: string }
  lastVerified: string
  verifyNote?: string          // 'confirm with your district' etc.
}

export interface StateGuidance {
  state: string                // 'NY'
  displayName: string          // 'New York'
  milestones: StateMilestone[]
  keyAgencies: { name: string; role: string; url: string }[]
  agingOutRule: string         // plain-language statement of when school services end in NY, with verify caveat
  notes: string[]              // other load-bearing NY facts with caveats
}

export const stateGuidanceNY: StateGuidance = {
  state: 'NY',
  displayName: 'New York',

  milestones: [
    {
      id: 'ny-opwdd-front-door-anytime',
      age: 4,
      title: 'Apply to OPWDD (the Front Door) — you can do this at any age',
      detail:
        'OPWDD eligibility can be established at any age, and the determination requires substantial documentation (psychological evaluation with IQ, adaptive behavior assessment, developmental history showing onset before age 22). Families who wait until 17 often face a scramble; families who apply young have adult services ready when they matter. Eligibility does not obligate you to use services.',
      action:
        'Call the OPWDD Infoline at 866-946-9733, ask for your regional Front Door office, and start assembling the eligibility packet from existing school and medical evaluations.',
      source: { name: 'OPWDD Front Door', url: 'https://opwdd.ny.gov/get-started/front-door' },
      lastVerified: '2026-07-15',
      verifyNote:
        'Shown at age 4 as a prompt, but this applies at ANY age — if you have not applied yet, the best time is now.',
    },
    {
      id: 'ny-vocational-assessment-12',
      age: 12,
      title: 'Level 1 vocational assessment (a NY-specific requirement)',
      detail:
        'New York regulations require an initial career/vocational assessment — a review of records plus parent and student interviews about vocational skills, aptitudes, and interests — for students with IEPs beginning at age 12. Most states do nothing like this until years later. It becomes the seed of the transition plan.',
      action:
        'At the annual review in the school year your child turns 12, ask whether the Level 1 vocational assessment has been done and ask for a copy of the results.',
      source: {
        name: 'NYSED — Transition from School to Post-School (8 NYCRR 200.4)',
        url: 'https://www.nysed.gov/special-education/transition-school-post-school-students-disabilities',
      },
      lastVerified: '2026-07-15',
      verifyNote: 'Districts implement this differently — confirm timing and format with your CSE.',
    },
    {
      id: 'ny-preets-14',
      age: 14,
      title: 'Pre-Employment Transition Services (Pre-ETS) become available',
      detail:
        'From age 14, students with disabilities can receive Pre-ETS through ACCES-VR while still in school — job exploration, work-based learning, workplace readiness, counseling on college/training options, and self-advocacy instruction — without needing a full VR application.',
      action:
        'Ask your school’s transition coordinator how students access Pre-ETS in your district, or contact your local ACCES-VR district office (1-800-222-5627).',
      source: {
        name: 'ACCES-VR — Student and Youth Transition Services',
        url: 'https://www.acces.nysed.gov/vr/student-and-youth-transition-services',
      },
      lastVerified: '2026-07-15',
    },
    {
      id: 'ny-transition-planning-15',
      age: 15,
      title: 'Transition planning must be in the IEP (NY requires it a year earlier than federal law)',
      detail:
        'New York requires measurable postsecondary goals and transition services in the first IEP in effect when your child turns 15 — earlier than the federal IDEA age of 16 — and updated every year after. This includes goals for training/education, employment, and, where appropriate, independent living.',
      action:
        'Before the annual review in the year your child turns 14, send a written request that the next IEP include postsecondary goals and transition services. Bring your child’s own interests and words into the meeting.',
      source: {
        name: 'NYSED — Transition from School to Post-School (8 NYCRR 200.4(d)(2))',
        url: 'https://www.nysed.gov/special-education/transition-school-post-school-students-disabilities',
      },
      lastVerified: '2026-07-15',
    },
    {
      id: 'ny-acces-vr-apply-16',
      age: 16,
      title: 'Apply to ACCES-VR — about two years before the planned school exit',
      detail:
        'ACCES-VR (New York’s vocational rehabilitation agency) recommends applying roughly two years before your student leaves school, so eligibility, plan development, and services are ready on day one of adult life. Students as young as 14 can apply if they need services beyond Pre-ETS.',
      action:
        'Complete the VR-04 application with the school’s help (attach the IEP and any SSI letters), submit it to your local district office, and ask the CSE to invite the ACCES-VR counselor to the next IEP meeting.',
      source: { name: 'ACCES-VR — Apply for Services', url: 'https://www.acces.nysed.gov/vr/apply-vocational-rehabilitation-services' },
      lastVerified: '2026-07-15',
      verifyNote: 'If your child is legally blind, the parallel agency is NYSCB (via OCFS), not ACCES-VR.',
    },
    {
      id: 'ny-decision-making-17',
      age: 17,
      title: 'Decide on decision-making supports before the 18th birthday',
      detail:
        'At 18 your child becomes a legal adult for medical, financial, and contractual purposes. New York now has a formal alternative to guardianship: Supported Decision-Making Agreements under Mental Hygiene Law Article 82 (signed 2022), which courts must consider before imposing guardianship and which doctors and banks must honor when properly facilitated. Article 17-A guardianship remains available but removes rights broadly and is hard to reverse.',
      action:
        'Start the conversation this year: explore SDM facilitation (sdmny.org — statewide facilitation via AIM Services), plus a health care proxy and, if needed, power of attorney. Treat guardianship as the last resort, not the default.',
      source: { name: 'Supported Decision-Making New York (SDMNY)', url: 'https://sdmny.org/' },
      lastVerified: '2026-07-15',
      verifyNote: 'Facilitated SDMAs take months — starting at 17 (or earlier) is realistic, at 17 years 11 months is not.',
    },
    {
      id: 'ny-able-account-17',
      age: 17,
      title: 'Open a NY ABLE account before benefits applications',
      detail:
        'An ABLE account lets your child hold savings (up to $100,000 disregarded for SSI) without losing benefits — the answer to SSI’s $2,000 asset limit. As of January 1, 2026, eligibility extends to people whose disability began before age 46. Opening it before the age-18 SSI application means gifts, savings, and future wages have a safe place from day one.',
      action:
        'Take the eligibility quiz at mynyable.org and open the account (a parent can manage it for a minor). Move any savings in the child’s name into it before applying for SSI.',
      source: { name: 'NY ABLE', url: 'https://www.mynyable.org/' },
      lastVerified: '2026-07-15',
    },
    {
      id: 'ny-ssi-18',
      age: 18,
      title: 'SSI at 18: apply (or face the age-18 redetermination)',
      detail:
        'At 18, SSI stops counting parents’ income — many young people qualify for the first time even in higher-earning households. If your child already gets SSI, Social Security will re-evaluate them under the adult disability standard (the "age-18 redetermination"), which looks at ability to work, not school criteria; some children lose benefits here, so respond to every notice.',
      action:
        'Within a month or two after the 18th birthday, file an adult SSI application — or if already receiving SSI, gather current medical and school documentation for the redetermination. SSA publication EN-05-11005 explains the process.',
      source: { name: 'Social Security Administration — SSI', url: 'https://www.ssa.gov/ssi/' },
      lastVerified: '2026-07-15',
      verifyNote: 'ssa.gov could not be robot-verified on 2026-07-15 (site blocks automated checks); rules and amounts change annually.',
    },
    {
      id: 'ny-medicaid-18',
      age: 18,
      title: 'Medicaid in their own name at 18',
      detail:
        'At 18, Medicaid eligibility is based on your young adult’s own income — not the household’s. Medicaid is the gateway to everything OPWDD funds (the HCBS waiver, care management, community supports), so establishing their own case is a load-bearing step, not paperwork trivia. If they get SSI, Medicaid generally follows automatically in NY.',
      action:
        'Apply for Medicaid at 18 (through SSI, the local department of social services, or NY State of Health); ask your CCO care manager for help — this is routine for them. Then confirm HCBS waiver enrollment.',
      source: { name: 'OPWDD — Paying for Services', url: 'https://opwdd.ny.gov/paying-services' },
      lastVerified: '2026-07-15',
    },
    {
      id: 'ny-education-rights-18',
      age: 18,
      title: 'Education rights do NOT transfer at 18 in New York',
      detail:
        'Unlike most states, New York did not adopt the IDEA transfer-of-rights at the age of majority: parents keep their special education decision-making rights until the student earns a diploma or ages out. Your signature still matters at CSE meetings after 18 — and no guardianship is needed for school decisions.',
      action:
        'If anyone tells you that you need guardianship "for school" at 18, push back — in NY, parents retain IEP rights. Keep attending and consenting at CSE meetings as before.',
      source: {
        name: 'NYSED — Procedural Safeguards Notice',
        url: 'https://www.nysed.gov/special-education/procedural-safeguards-notice-rights-parents-children-disabilities',
      },
      lastVerified: '2026-07-15',
      verifyNote: 'Other adult rights (medical, financial) DO transfer at 18 — this exception is for special education only.',
    },
    {
      id: 'ny-adult-services-lineup-20',
      age: 20,
      title: 'Line up the adult week: day, work, and transportation before school ends',
      detail:
        'The final two school years are when the adult plan gets real: OPWDD day or employment services (SEMP, Pathway to Employment, community habilitation), an ACCES-VR employment plan, paratransit or travel training, and the exit credential decision. Adult services do not start automatically — each one needs authorization through the Life Plan or a VR plan.',
      action:
        'Hold a planning meeting with your CCO care manager and the school: map what the week looks like after exit, name which agency funds each piece, and get authorizations moving a full year ahead.',
      source: { name: 'OPWDD — Employment Services', url: 'https://opwdd.ny.gov/types-services/employment-services' },
      lastVerified: '2026-07-15',
    },
    {
      id: 'ny-aging-out-21',
      age: 21,
      title: 'School services now run to age 22 in New York — know your exact end date',
      detail:
        'New York’s rule changed recently. Following a Second Circuit decision and NYSED’s formal guidance (upheld by a New York appellate court in July 2025), districts must provide a free appropriate public education until the student earns a regular diploma or until the day before their 22nd birthday — no longer just the school year they turn 21. NYSED encourages (but does not require) districts to let students finish the school year in which they turn 22.',
      action:
        'Get your child’s exact last day of eligibility in writing from the district, citing NYSED’s FAPE-to-22 guidance if the district still uses the old age-21 cutoff. Do not accept a diploma or sign an exit until the adult plan is in place — accepting a diploma ends eligibility immediately.',
      source: {
        name: 'NYSED — Free Appropriate Public Education (FAPE)',
        url: 'https://www.nysed.gov/special-education/free-appropriate-public-education-fape',
      },
      lastVerified: '2026-07-15',
      verifyNote:
        'This area has been litigated and guidance has evolved (2023-2025); statutory codification was still pending at verification. Confirm the current rule and your child’s exact end date with the district and, if disputed, with NYSED or a PTI advocate.',
    },
    {
      id: 'ny-exit-year-22',
      age: 22,
      title: 'The exit year: SEP handoff, final documents, and the first adult week',
      detail:
        'When school ends, the district must give your young adult a Summary of Academic Achievement and Functional Performance (the exit summary) with recommendations for postsecondary goals. This document, the final IEP, and current evaluations feed adult systems (ACCES-VR, OPWDD, SSI reviews) for years — get complete copies before the file becomes hard to reach.',
      action:
        'Request the full special education file and the exit summary in writing before the last day. Confirm the first month of the adult schedule (day/work services, transportation, care management contact) is authorized and on the calendar.',
      source: {
        name: 'NYSED — Transition from School to Post-School',
        url: 'https://www.nysed.gov/special-education/transition-school-post-school-students-disabilities',
      },
      lastVerified: '2026-07-15',
    },
  ],

  keyAgencies: [
    {
      name: 'OPWDD (Office for People With Developmental Disabilities)',
      role: 'Lifelong developmental disability services: eligibility (Front Door), HCBS waiver, care management via CCOs, housing, day and employment supports, self-direction.',
      url: 'https://opwdd.ny.gov/',
    },
    {
      name: 'ACCES-VR (NYS Education Department)',
      role: 'Vocational rehabilitation: career counseling, training, job placement, Pre-ETS for students 14-22. (NYSCB, under OCFS, serves people who are legally blind.)',
      url: 'https://www.acces.nysed.gov/vr',
    },
    {
      name: 'NYSED Office of Special Education',
      role: 'Sets and enforces special education and transition requirements for school districts; runs dispute resolution (mediation, complaints, due process).',
      url: 'https://www.nysed.gov/special-education',
    },
    {
      name: 'NYS Department of Health (Medicaid)',
      role: 'Runs NY Medicaid, which funds nearly all long-term disability services, plus the Medicaid Buy-In for Working People with Disabilities.',
      url: 'https://www.health.ny.gov/health_care/medicaid/',
    },
    {
      name: 'Social Security Administration',
      role: 'SSI and SSDI benefits; conducts the age-18 SSI redetermination under adult disability rules.',
      url: 'https://www.ssa.gov/ssi/',
    },
    {
      name: 'NY ABLE (Office of the State Comptroller)',
      role: 'Tax-advantaged ABLE savings accounts that protect SSI and Medicaid eligibility.',
      url: 'https://www.mynyable.org/',
    },
    {
      name: 'County Departments of Community Services / Mental Health (Local Governmental Units)',
      role: 'Each county plans and coordinates local disability, mental health, and crisis services; your county department is the local "who do I call" (in Rockland: the Department of Mental Health).',
      url: 'https://www.rocklandcountyny.gov/departments/mental-health',
    },
  ],

  agingOutRule:
    'In New York, a student with a disability who has not earned a regular high school diploma is entitled to a free appropriate public education until the day before their 22nd birthday — a change from the old "school year they turn 21" rule, established by NYSED guidance (2023) and upheld on appeal in 2025. NYSED encourages, but does not require, districts to let students finish the school year in which they turn 22. Because this rule was still being codified in statute at verification (July 2026) and districts vary in how they apply it, get your child’s exact end date in writing from your district and challenge an age-21 cutoff if you see one.',

  notes: [
    'NY starts transition earlier than federal law: a Level 1 vocational assessment at age 12 and transition planning in the IEP by age 15 (IDEA says 16). If these have not happened, they are owed — ask in writing.',
    'Education rights do not transfer to the student at 18 in NY (unlike most states): parents keep special education decision-making until diploma or aging out. Guardianship is never required for school decisions.',
    'OPWDD eligibility requires that the disability began before age 22 and is documentation-heavy; apply through the Front Door years before adult services are needed. Most OPWDD services also require Medicaid plus HCBS waiver enrollment, with a CCO care manager as your guide.',
    'New York has a formal Supported Decision-Making law (Mental Hygiene Law Article 82, 2022): courts must consider SDM before guardianship, and properly facilitated SDMA decisions must be honored by third parties. Article 17-A guardianship is plenary and widely criticized — treat it as a last resort.',
    'Diploma decisions are one-way doors: accepting a Regents or local diploma ends the right to school services immediately, while the CDOS credential or SACC alone does not. Decide the exit credential with the end date in mind.',
    'The Medicaid Buy-In for Working People with Disabilities lets a working young adult keep full Medicaid at incomes far above regular limits (no spend-down) — a paycheck does not have to mean losing services. Confirm current income limits before making work decisions.',
    'As of January 1, 2026, ABLE accounts are open to anyone whose disability began before age 46 (previously 26) — relevant for later-diagnosed family members too.',
    'County matters: OPWDD works through five regional office groupings (Rockland is Region 3/Hudson Valley; NYC is Region 4), and each county’s Local Governmental Unit plus its own paratransit system (Access-A-Ride in NYC) shape what is locally available. The federally funded parent centers split coverage too: the Region 1 collaborative (Advocates for Children, INCLUDEnyc, Sinergia, Long Island Advocacy Center) for NYC and Long Island, Starbridge for the rest of the state.',
  ],
}
