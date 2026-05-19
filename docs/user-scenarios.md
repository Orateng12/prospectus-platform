# Prospectus Platform — 100 Real User Scenarios

Realistic use-case narratives across the full platform. Each scenario follows the pattern:
**Persona → Situation → What they do → What they get**

South African context: APS scoring, NSFAS eligibility (income ≤ R 350k), RIASEC career matching, Big Five personality traits, 26 SA universities, 9 provinces.

---

## Cluster 1: Onboarding & First-Time Use (1–10)

**1. Lerato, Soshanguve — First visit after school sign-up day**
Lerato heard about Prospectus at a school career day. She signs up via Google, lands on the onboarding wizard. Completes Step 1 (Gauteng province, 2026 matric), enters her subject marks on Step 2 — gets a live APS of 42. Steps 3–4 reveal she scores high on Investigative and Conscientiousness. Step 5: household income R 180k. Clicks "Build my profile" → Dashboard shows 147 eligible programmes, NSFAS eligible badge, Strategic Score 71.

**2. Sipho, Durban — Retakes onboarding after changing schools**
Sipho completed onboarding at his old school but transferred mid-year. He visits Profile → retakes via `/onboarding?retake=true`. Updates subject marks (dropped History, added Tourism) and re-enters household income. New APS: 38 (down from 41). Dashboard updates: 94 eligible programmes, 3 previously eligible programmes now show as "out of reach."

**3. Aisha, Johannesburg — Skips steps then goes back**
Aisha tries to rush onboarding, skips the personality questions. The "Next" button stays disabled until she rates at least 10 of 16 items. She goes back to Step 3, completes Big Five and RIASEC. Her high Artistic score (74) changes her career matches — UX Design and Architecture appear in her top 5 for the first time.

**4. Thabo, Mthatha — Low-literacy mobile user**
Thabo uses a data-light browser. The onboarding wizard loads, sliders work on touch. He struggles with "Conscientiousness" label; the sub-description "thoroughness, self-discipline" helps. Completes all 5 steps in 8 minutes. Dashboard shows he's NSFAS eligible (income R 95k), 34 eligible programmes, Strong match: Social Work and Education.

**5. Naledi, Pietermaritzburg — Unsure of household income**
Naledi doesn't know her household income. She sets the Step 5 slider to approximately R 200k based on her parents' combined salaries. The eligibility banner immediately shows "✅ Likely NSFAS eligible." She saves. Later updates income to R 320k in Profile — banner stays green (under R 350k threshold).

**6. Karabo, Polokwane — Wants to skip assessment, just find programmes**
Karabo dismisses personality and capability steps quickly, rating everything 3 (middle). Dashboard loads but Intelligence page shows "Assessment required — your scores are neutral, retake for personalisation." Career matches show equal flat scores. He eventually retakes properly after seeing friends' richer results.

**7. Sarah, Cape Town — High-APS student, already has offers**
Sarah (APS 52) completes onboarding. Dashboard shows 312 eligible programmes, Strategic Score 89, strong STEM career matches. She navigates straight to Intelligence → sees "Global mobility potential: 87 — your profile qualifies for international bursaries." She was unaware of this pathway.

**8. Lethabo, Johannesburg — Second-year matric repeat**
Lethabo is retaking matric after failing two subjects. He selects "2025 matric year" in Step 1. His subjects include improved marks. APS moved from 24 to 33. Funding page now shows Bursary eligibility (R 42k for APS ≥ 32 tier).

**9. Zanele, Durban — Uses platform on behalf of her sister**
Zanele sets up an account for her younger sister Nomsa who doesn't have a phone. Completes onboarding using Nomsa's marks and their household income. The dashboard becomes a planning tool they review together on Zanele's device.

**10. Mpho, Pretoria — Comparing platforms, sets income wrong**
Mpho enters R 600,001 (just above NSFAS threshold) in Step 5. Banner shows "⚡ Missing middle — you may qualify for merit-based bursaries." Later discovers his income was in ZAR thousands and was actually R 60k/month. Updates profile income to correct value; NSFAS eligibility restores.

---

## Cluster 2: APS & Simulator (11–18)

**11. Kefilwe, Mahikeng — "What if I improve my Maths?"**
Kefilwe has Maths at 52% (4 APS points). She opens the Simulator and drags the Maths slider to 60% (+1 APS point). The impact panel shows: 12 programmes newly opened, including BSc Computer Science (UCT). She adds this to her focus and plans extra Maths tutoring.

**12. Sibusiso, Soweto — Cheapest lever discovery**
Sibusiso's APS is 39. He sees the "Cheapest lever" panel showing: raising English Home Language from 67% to 70% costs only 3 percentage points for +1 APS. He tries this on the slider — APS jumps to 40. BSc Actuarial Science (Wits) unlocks. He screenshots this to show his English teacher.

**13. Bongiwe, East London — Scenario comparison (saved subjects)**
Bongiwe saves her current subjects as a baseline (APS 36), then uses the simulator to model "if I drop Geography and focus on Tourism." APS stays at 36 but the programme mix shifts: 8 tourism-related programmes appear, 4 science programmes disappear. She saves each scenario to compare outcomes.

**14. Dineo, Bloemfontein — Dragging simulator to understand APS system**
Dineo didn't understand why APS wasn't just an average. She opens the Simulator, sets all subjects to 100%, reads APS = 42 (max with 6 subjects, since LO is excluded). She then sets one subject to 0% and sees APS drop to 35. The APS explanation in the "cheapest lever" card clarifies the 7-subject, max-6-scored rule.

**15. Tshepo, Alexandra — Stress-testing for university minimums**
Tshepo's target is UCT Engineering (min APS 42). His current APS is 38. He opens the Simulator and drags sliders one by one to find the minimum combination that hits 42. He discovers he needs +4 points — achievable by improving Maths (+2 with 8% improvement) and Physical Science (+2 with 6% improvement).

**16. Rudo, Polokwane — Career impact cascade on Simulator**
Rudo is interested in Actuarial Science. She opens the Simulator and watches the "Career Impact" section at the bottom. As she raises her Maths score from 65% to 80%, her Actuary match score rises from 61 to 74, and the career moves from rank 4 to rank 1 in her fit list.

**17. Given, Durban — Comparing subject drop decisions**
Given needs to decide whether to drop History or Geography. He opens the Simulator twice in sequence: first sets History to 0 (simulating dropping it), notes APS and career impact; then resets, sets Geography to 0, compares. History drop loses 4 APS points but opens "Social Work" and "Education" clusters. Geography drop costs 3 points but keeps Science pathways. He decides to keep History.

**18. Mpendulo, Kimberley — Using simulator to prepare for parent conversation**
Mpendulo's parents want him to become a doctor (APS 44+ required). His current APS is 40. He uses the Simulator to show his parents exactly what it would take: Maths 75%+, English 70%+, Life Science 70%+ simultaneously. He screenshots the "4 improvements needed" view to show this is realistic but demanding.

---

## Cluster 3: Programme Discovery & Selection (19–26)

**19. Amahle, Durban — First programme browse**
Amahle opens Programmes for the first time. 147 programmes populate. She filters by "Direct pathway" and sees 89 results. She sorts by fit score and finds "BSc Psychology (UKZN)" ranked 2nd. She clicks it → sees her prerequisite gap: English at 58% (needs 60%). Notes to improve English.

**20. Thandeka, Pretoria — Saving shortlist for family review**
Thandeka saves 6 programmes across 3 universities using the star button. She navigates to home — the KPI card shows "6 saved programmes." She shares her screen with her parents and walks them through each saved programme's fees, duration, and career outcomes.

**21. Lwazi, Cape Town — Filtering by TVET pathway**
Lwazi is interested in a practical career and wants TVET routes. He filters by "TVET pathway" — 12 results appear (Electrical, Plumbing, Civil Engineering N4–N6). He hadn't realised these could lead to engineering careers. He clicks Electrician → sees career trajectory: N4 cert → journeyman → master electrician, with salary progression.

**22. Precious, Johannesburg — Extended programme for lower APS**
Precious has APS 26 and is worried she has no options. She filters by "Foundation / Extended" pathway — 31 results appear including Foundation BSc (Wits) and Extended BCom (UJ). She selects Foundation BSc → sees: "Complete 1 year of foundation studies to progress to BSc." Relief.

**23. Siyanda, Port Elizabeth — Comparing fees across similar programmes**
Siyanda is interested in Data Science at multiple institutions. He searches "Data Science" in the programme list — 4 results: UCT (R 48,800/yr), Wits (R 52,200/yr), NMU (R 28,400/yr), UKZN (R 31,600/yr). He notes NMU is the most affordable while still being APS-accessible.

**24. Ntombi, Limpopo — First-gen tertiary student, doesn't know what BCom means**
Ntombi clicks BCom General → reads the career clusters panel: "Finance, Management, Accounting, Marketing." She clicks each cluster → sees specific career names, salaries, and growth rates. She realises BCom → Marketing aligns with her interest in social media management (match score: 72). Saves programme.

**25. Yusuf, Durban — Engineering pathway with subject gap**
Yusuf wants BEng Mechanical (UCT, min APS 44). His APS is 42. The programme detail shows a prerequisite gap: Physical Science needs to be 70%+ (his: 64%). He clicks "Simulate" which opens the APS Simulator pre-filled with the gap. He sees he needs +6% in Physical Science.

**26. Zintle, Eastern Cape — Found a programme via career, not programme list**
Zintle explores Career Explorer first, finds "Environmental Scientist" (match 78). She clicks it → Career Detail shows "Top 4 related programmes." She clicks "BSc Environmental Science (Stellenbosch)" → navigates to programme detail without ever opening the Programmes list.

---

## Cluster 4: Career Exploration & Matching (27–36)

**27. Bongani, Johannesburg — Surprised by top career match**
Bongani expected "Software Engineer" to be his top match (he's interested in coding). He opens Career Explorer — top match is "Data Scientist" (88%), with Software Engineer at #2 (84%). Curious, he reads the "Why" text: "Your Investigative score of 79 and Analytical capability of 82 favour research-oriented engineering roles." He explores both.

**28. Palesa, Pretoria — Using the Discover tab to find niche careers**
Palesa's RIASEC profile is Artistic-Social-Investigative (rare combination). Career Explorer Fit tab shows Creative Director and Architect in top 5. She switches to the Discover tab and sees "Hidden opportunity: UX Researcher — your combination of Artistic creativity and Investigative problem-solving fits this high-demand field." She hadn't heard of UX Research.

**29. Lethiwe, Durban — Salary-focused career browsing**
Lethiwe sorts careers by Salary. Top results: Surgeon (R 1.8M/yr), Actuary (R 890k/yr), Investment Banker (R 720k/yr), Data Scientist (R 580k/yr). She filters these by "High demand" to find financially rewarding AND stable careers. Actuary and Data Scientist remain. She clicks both and notes APS requirements.

**30. Nkosi, Venda — Searching by career tag**
Nkosi types "remote" in the careers search box. 7 careers tagged "Remote" appear: Software Engineer, Data Scientist, UX Designer, Financial Analyst, Content Strategist, Cybersecurity Analyst, Actuary. He hadn't considered that remote work was a differentiator in career planning. He adds all 7 to compare.

**31. Khanyisile, Nelspruit — Comparing 4 careers side by side**
Khanyisile is torn between: Teacher, Social Worker, Psychologist, Occupational Therapist — all Social careers. She adds all 4 to the Compare Drawer. Opens Career Compare page → sees salary, growth, demand, required capabilities and Big Five ranges for each. Psychologist ranks highest on salary; Teacher ranks highest on "social impact" (she decides the latter matters more).

**32. Sandile, Klerksdorp — Career Detail: personality fit out of range**
Sandile is pursuing "Investment Banker." He opens Career Detail → Personality fit section shows "Extraversion: ideal range 60–100, yours: 32 — below range." He reads: "Investment banking favours outgoing networkers." He didn't realise personality fit was a factor. He checks Analyst roles where Extraversion range is [25–80].

**33. Phumzile, Cape Town — Growth-focused student avoiding declining sectors**
Phumzile sorts careers by Growth. He filters "High growth only" → sees: Data Scientist (24%/yr), Cybersecurity Analyst (31%/yr), Renewable Energy Technician (28%/yr). He sorts by demand — all three are "High." He saves Data Scientist and Cybersecurity Analyst to compare.

**34. Nompumelelo, Durban — Finds career match changed after retaking assessment**
Nompu retook her cognitive assessment in onboarding. Her Perseverance score increased from 55 to 78. She opens Career Explorer and sees "Doctor" jumped from rank 8 to rank 3. The "Why" note reads: "Your high perseverance score aligns with medical training's multi-year demand." This validates her interest.

**35. Lethabo, Alexandra — Uses command palette to jump to career**
Lethabo hits Cmd+K, types "actuary." Command palette shows "Actuarial Scientist — Match 91 · High demand · R 890k/yr." He clicks it → navigates directly to Career Detail without going through the full list.

**36. Wandile, Pietermaritzburg — Shares career page with career counsellor**
Wandile screenshots the Career Detail page for "Civil Engineer" showing his match score (74%), required subject combinations, and top 3 linked programmes. He WhatsApps this to his school career counsellor who uses it as the basis for their planning session.

---

## Cluster 5: Funding & Financial Planning (37–46)

**37. Zinhle, Soweto — NSFAS eligibility realisation**
Zinhle opens the Funding Strategy page for the first time. Top of page: "NSFAS coverage: R 115,060" with a green badge. She didn't know NSFAS covered accommodation AND food allowance. She clicks through the breakdown: tuition R 38k + accommodation R 46k + living allowance R 31k. "This covers almost everything," she tells her mother.

**38. Abongile, Port Elizabeth — Missing middle frustration and bursary pivot**
Abongile's household income is R 420k (above NSFAS threshold). Funding page shows NSFAS: R 0. Bursary eligibility: R 95k (APS 38+). She refocuses: "R 95k bursary + R 35k scholarship = R 130k toward R 155k first year." She navigates to Scholarships to apply for the gap funding.

**39. Mohammed, Cape Town — Planning a 3-year funding projection**
Mohammed wants to know total tertiary costs. Funding page shows "3-year projection" at the bottom: Year 1 R 155k, Year 2 R 162k (+4.8% inflation), Year 3 R 170k. Total: R 487k. His bursary stacks to R 285k over 3 years. Gap: R 202k — he starts researching part-time work options.

**40. Thandeka, Durban — Realises APS directly affects bursary tier**
Thandeka's APS is 38 (qualifies for R 95k bursary). She goes to the Simulator, raises Maths by 8% → APS reaches 42 → returns to Funding page. Bursary tier upgrades to R 165k (APS 42+ tier). That's a R 70k difference in funding. "My Maths extra lessons just paid for themselves," she tells her tutor.

**41. Johannes, Limpopo — First-gen student discovers free programme fee waivers**
Johannes has APS 36, income R 98k. Funding page shows "NSFAS: R 115,060" covers his selected programme fees (R 28k at UNISA). Net coverage: positive R 87k living allowance. He navigates to the Scholarships page to find top-up bursaries and finds 2 more matches worth R 18k combined.

**42. Caitlin, Stellenbosch — High-income, merit-scholarship hunting**
Caitlin's income is R 950k (above all need-based aid). Funding page shows "Merit scholarships eligible — your APS 48 qualifies for 6 merit programmes." She clicks through to Scholarships → filters by merit → finds Sasol Foundation (R 120k, APS 45+) and Old Mutual Actuarial Bursary (R 180k, APS 48+). She applies for both.

**43. Simphiwe, Durban — Comparing costs at 3 target universities**
Simphiwe clicks "Switch programme" on the Funding page and toggles between UKZN BCom (R 31k/yr), UJ BCom (R 44k/yr), Wits BCom (R 52k/yr). Funding page updates cost projection for each. UKZN is the most financially efficient. He saves UKZN BCom as his primary programme.

**44. Nozipho, Kimberley — NSFAS calculator deep-dive before applying**
Nozipho opens the NSFAS Calculator, sets income to R 240k. Eligibility banner: "✅ Fully eligible." She reads the award breakdown by study type: University undergraduate R 115k; Technical/vocational R 67k. She plans to apply for NSFAS at the same time as her UCT application.

**45. Themba, Soweto — Calculates income incorrectly, corrects it**
Themba initially enters R 600k income on NSFAS Calculator (assuming it was per-person salary). Banner shows "⚡ Missing middle." His mother clarifies: combined household income is R 280k (both parents). He updates the slider → banner changes to "✅ Fully NSFAS eligible." He immediately navigates to start his NSFAS application.

**46. Funani, Limpopo — Uses funding page as parent presentation tool**
Funani prints/screenshots the Funding Strategy page to show his parents. The visual stack (NSFAS + Bursary + Scholarship = R 175k vs first-year cost R 155k) clearly shows they would be R 20k in surplus. His parents, previously reluctant to support university, agree to proceed.

---

## Cluster 6: Application Management (47–56)

**47. Nokwanda, Durban — First application submission**
Nokwanda opens Applications page for the first time. Empty state shows "No applications yet — start your university journey." She clicks "+ Add application," searches "BCom," selects "BCom Accounting — University of Johannesburg," sets deadline to 30 September. Application card appears with status "Draft" and a 4-stage progress bar at Stage 1.

**48. Siphamandla, Johannesburg — Tracking 4 simultaneous applications**
Siphamandla has applied to UCT, Wits, UJ, and NMU. Applications page shows all 4 in a pipeline view: UCT (Submitted, Stage 3), Wits (Pending, Stage 2), UJ (Draft, Stage 1), NMU (Accepted, Stage 4 ✓). He filters by "Submitted" to follow up on UCT and Wits. NMU is his backup — now his frontrunner.

**49. Rethabile, Pretoria — Updating application status after receiving letter**
Rethabile receives a physical letter from UCT. She opens her application, clicks edit → changes status from "Submitted" to "Accepted." The pipeline bar fills to Stage 4. Home dashboard KPI "Applications" updates to show "1 Accepted" with a green badge.

**50. Lesego, Bloemfontein — Deleting wrong application**
Lesego accidentally added "BSc Physics" twice. She opens Applications, clicks the second card → Application Detail page → clicks Delete → confirms. One entry removed. Application count badge in the sidebar updates from 5 to 4.

**51. Tumi, Johannesburg — Checking if deadline has passed**
Tumi forgot when UFS closes. He opens Applications → UFS card shows "Deadline: 31 August 2026 · 12 days remaining." He also checks the Deadlines page for full calendar view. Urgency badge: "Soon — 12 days."

**52. Nandi, Port Elizabeth — Adding a late application**
Nandi discovers that NMU has a late round closing in 3 weeks. She adds the application with that deadline date. The Deadlines page immediately shows this with an "Urgent" badge since it's under 21 days away. She also uploads her ID and matric results to Documents in preparation.

**53. Lehlohonolo, Durban — Comparing notes between two accepted universities**
Lehlohonolo got accepted at both UKZN and UJ. He opens each Application Detail page to compare notes fields he typed during each process. He also uses Career Compare to look at programme outcomes side by side. Decides on UKZN based on lower costs and home province proximity.

**54. Ayanda, Johannesburg — Status update triggers scholarship deadline re-evaluation**
Ayanda updates his Wits application to "Accepted." He returns to Scholarships and notices the Old Mutual bursary requires "Accepted at a Wits affiliated programme." His eligibility now shows as met. He applies for the scholarship.

**55. Thandi, Cape Town — Using applications page as study accountability**
Thandi creates a personal convention: she adds Applications for each stage of each university process as separate entries (e.g., "UCT — NBT Test registered," "UCT — Application submitted," "UCT — Awaiting decision") to track granular progress. The pipeline status helps her follow through methodically.

**56. Busisiwe, Soweto — Empty state as motivation**
Busisiwe hasn't applied anywhere. She visits Applications repeatedly to see the empty state. On her third visit, she finally clicks the "+ Add" button. Small friction removed. She adds her first application. The dashboard KPI updates from "0 applications" to "1 active."

---

## Cluster 7: Documents & Deadlines (57–63)

**57. Khethiwe, Durban — Uploading matric results for multiple university applications**
Khethiwe uploads her certified matric statement as PDF. Document type: "Matric certificate." File size: 2.3 MB. Upload success. She then uploads her ID copy (JPEG, 890 KB, type: "ID document"). Both appear in the Documents vault with correct type icons, upload dates, and download links.

**58. Ayabulela, Port Elizabeth — Document signed URL expiry**
Ayabulela tries to download a document uploaded 2 hours ago. The link has expired (1-hour expiry). He clicks the "Refresh link" button → server action generates a fresh signed URL → download starts immediately.

**59. Msizi, Johannesburg — Organising documents by type**
Msizi has 9 documents uploaded. He sees them grouped by type in the Documents page: "Matric certificate (2)," "ID document (1)," "Motivation letter (3)," "Transcript (1)," "Other (2)." He deletes an old draft Motivation letter. Vault now shows 8 documents.

**60. Lungelo, Pietermaritzburg — Deadlines page as daily planning tool**
Lungelo visits the Deadlines page every morning. Today it shows: "UKZN application: 4 days — URGENT," "NSFAS documents: 11 days — SOON," "NSFAS appeal: 28 days — OPEN," "Sasol Foundation essay: 3 days — URGENT." He prioritises UKZN and Sasol Foundation today.

**61. Nkosinathi, Durban — Missed deadline handling**
Nkosinathi opens Deadlines and sees "UJ application: 2 days overdue — OVERDUE." He's missed it. He calls UJ directly to ask about late submissions. Prospectus doesn't close the option for him — he manually updates the Application status to "Draft" (re-opens it) and adds a new deadline for a possible late round.

**62. Zodwa, Nelspruit — Using documents as a digital admin folder**
Zodwa uploads everything she might need for any university or bursary application: ID, matric results, proof of residence, parent payslip, recommendation letter, personal essay. 6 documents total. She bookmarks the Documents page on her phone to share specific documents quickly when required.

**63. Thandazile, Limpopo — Upload failure on slow connection**
Thandazile tries to upload a 9.8 MB scanned matric cert on a slow connection. Upload fails (10 MB limit). She uses CamScanner to reduce it to 4.2 MB and reuploads successfully. The platform's 10 MB limit with clear error messaging helped her understand the issue and self-resolve.

---

## Cluster 8: Cognitive Assessment & Skills Map (64–71)

**64. Mpho, Pretoria — Seeing Big Five results for the first time**
Mpho completes the cognitive assessment during onboarding. Dashboard loads. He navigates to Cognitive Assessment → sees: Openness 72 ("Inventive, curious"), Conscientiousness 84 ("Highly organized"), Extraversion 38 ("Reserved"), Agreeableness 68 ("Cooperative"), Neuroticism 29 ("Emotionally stable"). He screenshots this, texts his friend: "Apparently I'm an introverted scientist type."

**65. Ayasha, Johannesburg — RIASEC discovery changes career thinking**
Ayasha sees her RIASEC scores: Investigative 81, Realistic 72, Conventional 68, Artistic 54, Social 42, Enterprising 38. She clicks "What does this mean?" on the assessment page. Investigative cluster description: "You're a thinker, analyser, and problem-solver — drawn to research, data and science." This validates her interest in Medicine and Research.

**66. Khuliso, Venda — Skills Map radar for career gap analysis**
Khuliso opens Skills Map and selects "Cybersecurity Analyst" from the career dropdown. The radar shows his scores vs. career requirements: Technical Aptitude: his 65 vs. required 80 (gap of 15). The gap analysis text reads: "Coding practice and networking fundamentals could close this gap." He plans to do a free online course.

**67. Refilwe, Soweto — Skills Map comparing two career overlays**
Refilwe selects "Accountant" on the Skills Map. Good fit across most dimensions. She switches to "Management Consultant." The radar shifts — Leadership requirement jumps from 45 to 78; her score is 60. She sees she needs to build Leadership to pursue consulting. Notes this.

**68. Amara, Cape Town — Discovering perseverance as a strength**
Amara's Skills Map shows her Perseverance score at 87 (highest capability). She hadn't considered this a career differentiator. The capability deep-dive reads: "High perseverance correlates strongly with success in medicine, law, and research careers requiring long training." She re-evaluates her dismissal of Medicine as "too many years of study."

**69. Loyiso, Port Elizabeth — Using cognitive results to prepare for interviews**
Loyiso is applying for a bursary that requires an interview. He uses his Cognitive Assessment page to prepare self-descriptions: "I'm Investigative-Enterprising — I enjoy analysing problems and finding commercial solutions." He uses his capability scores to frame answers about strengths (Technical: 78) and growth areas (Communication: 55).

**70. Zanele, Durban — Retaking assessment after 6 months**
Zanele retook her assessment after 6 months of focused study. New scores: Academic Readiness up from 62 to 74; Analytical Thinking up from 70 to 81. Her Strategic Score updated from 68 to 74. Career Explorer reranks: Data Scientist moves from rank 3 to rank 1. "The platform actually grows with you," she notes.

**71. Bonga, Johannesburg — Using Skills Map presentation in school presentation**
Bonga's Life Orientation teacher assigns "Know yourself" presentations. Bonga uses his Skills Map radar as a visual, his Big Five scores as self-description, and his RIASEC profile as career reasoning. He gets the highest grade in class. He shows the rest how to sign up for Prospectus.

---

## Cluster 9: Intelligence Dashboard (72–77)

**72. Thandi, Cape Town — Strategic Score deep-dive**
Thandi's Strategic Score is 71. She opens Intelligence and reads the 6 sub-scores: Academic 78, Career Demand 74, Financial Feasibility 82, Personality Fit 68, Global Mobility 61, Skill Readiness 64. She identifies Skill Readiness as her weakest area. Navigates to Skills Map to understand which capabilities to build.

**73. Sibonelo, Durban — Score delta notification on return visit**
Sibonelo improved his subjects over 3 weeks and updated marks. He returns to Intelligence page and sees "↑ +6 from last visit" on the Strategic Score donut. The delta breakdown shows Academic Readiness jumped from 68 to 79 — driven by his Maths improvement. Positive feedback loop reinforces study habits.

**74. Nompumelelo, Pretoria — Global mobility potential discovery**
Nompu sees "Global Mobility Potential: 78" in her Intelligence dashboard. She clicks "What does this mean?" → reads: "Your Investigative-Conventional profile and high academic readiness score make you competitive for international postgraduate opportunities." She hadn't considered studying abroad. She adds "International Masters" to her 5-year plan.

**75. Kgotso, Rustenburg — Future-You 2031 scenario**
Kgotso reads "Future-You 2031: Software Engineer → Senior Developer · Projected salary R 680k/yr · Aligned with 3 growth sectors: FinTech, Cybersecurity, EdTech." He'd never seen career projections with salary timelines before. He shares this section with his parents as justification for choosing Computer Science over Accounting.

**76. Zoe, Johannesburg — Intelligence page before parent meeting**
Zoe prints the Intelligence dashboard to bring to a parent meeting. The page shows: Strategic Score 74, eligible programmes 218, funding matched R 95k, career probability distribution. It provides a structured conversation framework she couldn't have had without the platform.

**77. Nhlanhla, Durban — Profile completeness tracker**
Nhlanhla sees "Profile: 60% complete" in Intelligence. Missing: Cognitive assessment (0%), Capability assessment (0%). He completes both in 9 minutes. Profile jumps to 100%. Strategic Score computes for the first time. He feels a genuine sense of completion.

---

## Cluster 10: Discover (AI Insights) & Opportunity Map (78–85)

**78. Langa, Cape Town — AI-powered hidden opportunity**
Langa opens Discover and reads: "Based on your Artistic-Investigative profile and 78% capability in Creative Thinking, UX Research is a high-match career you haven't explored (87% fit)." He'd never heard of it. He clicks the insight → Career Detail for UX Researcher → discovers it's one of the fastest-growing fields in SA's tech sector.

**79. Tumi, Johannesburg — Discover surfaces niche scholarship**
Tumi opens Discover → AI insight reads: "Your Limpopo province + APS 44 makes you eligible for the Thuthuka Bursary Fund, specifically for black CA students from underrepresented provinces. 1 programme match." This was not in the general Scholarships list — the AI surfaced it via profile + programme + province combination.

**80. Ayanda, Durban — RIASEC cluster exploration**
Ayanda clicks the "Social" career cluster on Discover. 6 careers appear: Social Worker, Teacher, HR Manager, Nurse, Psychologist, Community Development Officer. He clicks each and reads the match score, salary, and growth. "Social work pays less but has the most impact," he notes — confirming his motivation: "Impact & purpose."

**81. Palesa, Bloemfontein — Discover as weekly check-in**
Palesa opens Discover every Sunday. The AI insight refreshes with new angles based on recent platform activity (she added a scholarship application). This week's insight: "You've saved 3 programmes in Environmental Science — here's a bursary for environmental engineers you haven't explored." She clicks through.

**82. Sifiso, Johannesburg — Opportunity Map: province comparison**
Sifiso is considering studying away from Gauteng. He opens the Opportunity Map and hovers over the Western Cape: "27 institutions · avg fees R 52,000 · 312 programmes." He compares with KwaZulu-Natal: "18 institutions · avg fees R 31,000 · 228 programmes." He decides to apply to UKZN to keep costs down.

**83. Zanele, Limpopo — Opportunity Map: finding programmes close to home**
Zanele doesn't want to study far from her family. She opens the Opportunity Map, clicks Limpopo province: "4 institutions · University of Limpopo, UNISA, Letaba TVET, Waterberg TVET." She clicks University of Limpopo → programme list filters to Limpopo-only. 24 eligible programmes within her home province.

**84. Nkosinathi, Pietermaritzburg — Map for parent logistics planning**
Nkosinathi's parents are calculating transport costs to visit him at university. He opens the Opportunity Map and hovers over Durban (UKZN): "City: Durban · avg distance from Pietermaritzburg: 80km." They estimate quarterly visits at R 400 return trip (minibus). Total: R 1,600/year — manageable.

**85. Olwethu, East London — Map reveals border province advantage**
Olwethu is in Eastern Cape. She opens Opportunity Map and notices Western Cape programmes are visible just outside her province border. She filters "Western Cape" — 27 institutions including CPUT and UWC. She adds both to her Universities comparison, noting fees are higher but bursary opportunities also increase.

---

## Cluster 11: Universities Explorer (86–89)

**86. Sipho, Johannesburg — Comparing Tier 1 vs Tier 2 acceptance rates**
Sipho opens Universities and filters by Tier 1. 6 universities appear: UCT (acceptance rate 24%), Wits (28%), Stellenbosch (31%), UP (33%), UJ (48%), UKZN (52%). He compares acceptance rates vs. his APS (41). UJ and UKZN are most realistic for him.

**87. Nomvula, Cape Town — Finding CPUT as a practical alternative**
Nomvula's parents prefer she stays in Cape Town. She filters University by province "Western Cape." 4 results: UCT, Stellenbosch, UWC, CPUT. UCT and SU have min APS above hers (42). She clicks CPUT → Tier 2, accepts APS 27+, offers her preferred Graphic Design programme. Strong match.

**88. Bongani, Durban — Research trip planning**
Bongani wants to visit 3 campuses before deciding. He opens Universities, selects UKZN, DUT, and NMU. He notes: UKZN Howard College (Durban), DUT (Durban), NMU (Gqeberha — requires travel). He removes NMU from his list and focuses on KZN institutions for practical visits.

**89. Yolanda, Johannesburg — Province-filtered search for local bursary alignment**
Yolanda has a bursary that requires she study in Gauteng. She filters Universities by Gauteng: 5 results — Wits, UJ, TUT, Unisa, Vaal UoT. Her bursary-eligible programmes at these institutions are her planning constraint. She saves Wits and UJ BCom programmes.

---

## Cluster 12: Profile & Account Management (90–93)

**90. Thembinkosi, Durban — Mid-year mark update**
Thembinkosi receives trial exam results in August. He opens Profile → Subjects section → edit. Updates all 7 subject marks. APS changes from 39 to 43. He immediately sees the Topbar APS chip update. He navigates to Programmes — 58 new eligible programmes appear. He filters by "newly eligible."

**91. Nokuthula, Johannesburg — Province change after family relocation**
Nokuthula's family moves from Limpopo to Gauteng. She updates Province in Profile. Funding page updates: Wits bursary (Gauteng residence required) becomes available. Opportunity Map highlights Gauteng as home province. NSFAS accommodation calculations update to Johannesburg cost of living.

**92. Rethabile, Pretoria — Empty mode demo for school career fair**
Rethabile is presenting Prospectus at her school career fair. She toggles "Empty mode" in Profile → all her personal data hides. She navigates through the platform showing peers a clean "demo state" with generic data without exposing her marks, income, or applications. Afterwards, she toggles empty mode off.

**93. Vuyani, Cape Town — Account security after sharing device**
Vuyani shared his phone with a cousin who browsed his Prospectus dashboard. He opens Profile menu → Signs out. His session is terminated. His cousin can no longer access his data. Next login requires Google re-authentication.

---

## Cluster 13: Admin Dashboard — Platform Operators (94–97)

**94. Tumi, Platform Admin — Morning operations check**
Tumi opens the admin dashboard at 8:00 AM. Platform Overview shows: 94 new signups overnight, TUT sync still stalled (3rd day), AI engine latency at 480ms (above 350ms target). She navigates to Alerts → opens 3 critical issues, assigns engineering on-call. Before standup, she has a full incident picture.

**95. System Admin — Moderating a duplicate programme submission**
A UCT administrator submitted "BSc Marine Biology" — it already exists. The Moderation Queue shows it flagged as "Duplicate entry." Admin reviews both entries, clicks "Reject" on the new submission, adds a comment "Existing programme ID: UCT-BSCMB-2024." The count updates from 7 to 6 in the nav badge.

**96. Platform Admin — Student flagging investigation**
A student "Thabo Mokoa" has 1 flag (reported for inappropriate review). Admin opens Students → filters "Flagged" tab → 12 students. Clicks Thabo's row → full profile view shows review text. Admin determines the flag was automated (keyword trigger), marks as reviewed, removes the flag.

**97. Content Admin — Checking AI engine spend**
End of month review. Admin opens AI Engine telemetry → sees cost at R 142k/month (R 11.40/1k students). Cache hit rate at 71.4% (target: 75%). The miss analysis shows per-student career scoring is the top cache miss cause. Admin notes this to engineering: "Tune the cache key to include APS bucket instead of exact APS."

---

## Cluster 14: Cross-Feature Journeys (98–100)

**98. Lerato's Full Journey — 6-week arc**
Week 1: Signs up, completes onboarding (APS 42, NSFAS eligible, Strategic Score 71). Week 2: Uses Simulator — raises Maths, APS hits 44, Doctor unlocks. Week 3: Explores Career Detail for Doctor, notes perseverance aligns. Week 4: Opens Funding — full NSFAS coverage confirmed. Week 5: Adds 4 university applications, uploads documents. Week 6: Updates first application to "Accepted." Platform tracked her entire journey in one continuous state.

**99. The Compare-and-Decide Journey**
Marcus is choosing between Computer Science and Data Science. He: (1) adds both to Compare Drawer → opens Career Compare; (2) checks programme fees in Programmes page for CS (UCT R 52k) vs DS (Wits R 48k); (3) runs Simulator to confirm APS 44 qualifies for both; (4) opens Funding to stack NSFAS + Wits merit bursary for DS; (5) opens Deadlines — Wits closes first. He applies to Wits DS first. One platform, five tools, one decision.

**100. The First-Gen Family Session**
Nomsa (Grade 12, Limpopo) and her mother sit together with one phone. They complete onboarding together — mother helps with household income (R 145k). Dashboard loads. Mother sees NSFAS badge — "R 115,000? The government pays?" Nomsa navigates to Funding to show the breakdown. They read the 3-year projection together: total R 487k, covered R 348k by NSFAS + bursary. Gap R 139k — filled by provincial bursary Nomsa finds in Scholarships. Mother says yes to university. First family member to go.

---

*100 scenarios · 14 clusters · 23 routes covered · South African context throughout*
