# R&B Site Registers

Building work ke site registers ka PWA: cement/steel patrak, slump, cube aur preventive vigilance (QC) ke baaki registers. Phone par app ki tarah install hota hai, offline chalta hai.

## MB (Computerised Measurement Book)
- **Tender Items** (MB ke bahar): It. No., tender qty, description, rate, unit. Excel (Schedule B) se paste kar sakte ho.
- **CMB Page 1–5**: cover, kaam ki vigat (TS, tender, agency, agreement, dates), Division office issue certificate, Sub-Division issue certificate, Engineer appointment certificate.
- **For Record**: har item ka naap (No × No × L × B × D), steel dia-wise (8–32 mm, unit wt 0.395/0.617/0.89/1.58/2.47/3.86/6.32). Page No. 6 se apne aap.
- **Abstract**: MB page-wise qty, up to date, previously paid, now to be paid, limited qty (tender qty se zyada hone par).

## Registers

| Group | Register | Source |
|---|---|---|
| Cement & Steel | Cement Patrak-1 (Aavak-Jaavak, revised) | Register book |
| Cement & Steel | Cement Patrak-4 (Roj vapras, revised) | Register book |
| Cement & Steel | Steel Patrak-1 (Aavak-Jaavak) | Register book |
| Cement & Steel | Steel Patrak-2 (Roj vapras) | Register book |
| Material Testing | Sampling Register | Vigilance B |
| Material Testing | Cement Testing Register | Vigilance D |
| Material Testing | Petrographic Analysis Register | Vigilance K |
| Material Testing | Cement Consistency Patrak-2 | Register book |
| Material Testing | Int (Brick) parikshan ahevaal | Register book |
| Material Testing | Cement Ladi (Tiles) Patrak-5 | Register book |
| Material Testing | Aggregate chakasani parinaam | Register book |
| Material Testing | Sieve Analysis (metal/kapchi/gravel) | Register book |
| Concrete | Mix Design Register | Vigilance L |
| Concrete | Calibration Register | Vigilance H |
| Concrete | Corrected Batch Register | Vigilance I |
| Concrete | Batch Mix Plant Register | Vigilance J |
| Concrete | Slump Test Register | Register book |
| Concrete | Cube Testing Patrak-3 (casting + testing) | Register book |
| Summary | Testing Statement (Proforma-3) | Vigilance |

Har register ka print: Title page, Certificate, Index of Specimen Signature, phir register (A4 landscape).

## Apne aap hone wala ganit
- Opening = pichhli line ka closing (cement, steel)
- Cement P-1 mein "Patrak-4 se bharo", Steel P-1 mein "Patrak-2 se bharo" button: pichhle RA bill ke baad se is bill date tak ka vapras jod deta hai
- Cube Patrak-3: IS 456 cl. 15.2.2 se zaroori cube, 7/28 din due date, kN/N/mm² → kg/cm², fck / fck−4 check, ±15% variation
- Sieve analysis: cumulative vajan, cumulative %, pasar thata %
- Slump avg vs required range, calibration variation %, Proforma-3 difference
- Dashboard: cement/steel stock, due cube tests, laal entries

## GitHub Pages par lagana
1. GitHub par naya repo banao, jaise `rnb-site-registers`.
2. Ye saari files upload karo (index.html, manifest.json, sw.js, icon.svg).
3. Settings → Pages → Branch: `main`, folder `/ (root)` → Save.
4. `https://singhakhilesh740-svg.github.io/rnb-site-registers/` khulega.

## Google login + Admin (Firebase)
1. console.firebase.google.com → **Add project** (naam: rnb-site-registers) → Google Analytics off → Create.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable** → support email chuno → Save.
3. **Authentication → Settings → Authorized domains → Add domain**: `singhakhilesh740-svg.github.io`
4. **Build → Firestore Database → Create database** → location `asia-south1 (Mumbai)` → production mode.
   **Rules** tab mein `firestore.rules` ka poora content paste karo → **Publish**.
5. **Project settings (⚙) → General → Your apps → Web (</>)** → app naam do → Register. Jo `firebaseConfig = {...}` dikhe, use `index.html` mein
   `const FIREBASE_CONFIG = null;` ki jagah daalo, jaise: `const FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", ... };`
6. Push karo. Ab app kholte hi Google login aayega. **112ce0489@gmail.com** se login karne par Admin page khulega.

Admin page: users ki list, kisko chatbot chalane dena hai (Allow), kisko block karna hai, Worker URL aur model.
Admin kisi user ka kaam/data nahi dekh sakta.

## Chatbot (Claude API + Cloudflare Worker)
API key kabhi bhi index.html mein mat daalna. Wo Worker mein secret rehti hai.
1. **API key:** console.anthropic.com → login → Billing mein thoda credit daalo → **API Keys → Create Key** → copy karke surakshit rakho.
2. **Worker:** dash.cloudflare.com (free account) → **Workers & Pages → Create → Create Worker** → naam `rnb-chat` → Deploy → **Edit code**.
   `worker/worker.js` ka poora code paste karo → **Deploy**.
3. Worker → **Settings → Variables and Secrets → Add**:
   - `ANTHROPIC_API_KEY` (type **Secret**): aapki API key
   - `FIREBASE_PROJECT_ID`: Firebase project ID (firebaseConfig ka projectId)
   - `ADMIN_EMAIL`: `112ce0489@gmail.com`
   - `ALLOWED_ORIGINS`: `https://singhakhilesh740-svg.github.io`
   → Deploy.
4. Worker ka URL (jaise `https://rnb-chat.xxxx.workers.dev`) copy karo → app mein **Admin → Chatbot setting → Worker URL** → Save.
5. Chatbot mein upload: TS letter, tender approval, work order (PDF/photo) → kaam ki vigat; BOQ/Schedule-B, estimate (PDF/xlsx) → items. Har baar pehle preview, phir "Save karo".

Worker har request par check karta hai: Google login sahi hai, aur user admin hai ya admin ne "Allow" kiya hai. Tabhi API ko call jati hai.

## Aage (Phase 2)
Estimate + BOQ upload → tender item mapping → MB aur RA bill.
