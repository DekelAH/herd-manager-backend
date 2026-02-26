# 001 - Swagger Endpoint Test Plan

Manual test of all 14 API endpoints via Swagger UI at `http://localhost:3000/api-docs`.

## Prerequisites

1. MongoDB running locally (Compass)
2. Server running: `npm run dev`
3. Open `http://localhost:3000/api-docs` in browser
4. Keep a notepad open to store IDs and tokens as you go

---

## Phase 1: Auth Endpoints

### 1.1 POST /api/auth/signup -- Register new user

**Body:**
```json
{
  "username": "demo",
  "password": "demo123",
  "email": "demo@sheeply.com",
  "farmName": "Green Valley Farm"
}
```

**Expected:** 201 -- save the `accessToken` and `refreshToken` from the response.

**Authorize Swagger:** Click the "Authorize" button (top right), paste the `accessToken`, click "Authorize".

- [ ] Pass

### 1.2 POST /api/auth/signup -- Duplicate rejection

**Body:** Same as above.

**Expected:** 409 -- "Username already exists"

- [ ] Pass

### 1.3 POST /api/auth/login

**Body:**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Expected:** 200 -- returns user, accessToken, refreshToken. Save the new tokens.

- [ ] Pass

### 1.4 POST /api/auth/login -- Wrong password

**Body:**
```json
{
  "username": "demo",
  "password": "wrongpassword"
}
```

**Expected:** 401 -- "Invalid username or password"

- [ ] Pass

### 1.5 GET /api/auth/me

**Expected:** 200 -- returns current user profile (username, email, farmName). Requires Bearer token.

- [ ] Pass

### 1.6 POST /api/auth/refresh

**Body:** (use the refreshToken from step 1.1 or 1.3)
```json
{
  "refreshToken": "<paste-refresh-token>"
}
```

**Expected:** 200 -- returns new accessToken + refreshToken. Save the new pair, re-authorize Swagger with new accessToken.

- [ ] Pass

### 1.7 POST /api/auth/logout

**Body:** (use your current refreshToken)
```json
{
  "refreshToken": "<paste-refresh-token>"
}
```

**Expected:** 200 -- "Logged out successfully"

After this, log in again (step 1.3) and re-authorize Swagger with the fresh accessToken for the remaining tests.

- [ ] Pass

---

## Phase 2: User Endpoints

### 2.1 PUT /api/users/profile -- Update farm name

**Body:**
```json
{
  "farmName": "Green Valley Premium Farm"
}
```

**Expected:** 200 -- returns updated user with new farmName.

- [ ] Pass

### 2.2 PUT /api/users/profile -- Update email

**Body:**
```json
{
  "email": "updated@sheeply.com"
}
```

**Expected:** 200 -- returns updated user with new email.

- [ ] Pass

---

## Phase 3: Sheep CRUD -- Build the Herd

Create sheep in this specific order so parent references work. After each creation, note the returned `_id` -- you will need them for offspring and family tests.

### 3.1 POST /api/sheep -- Create founders (no parents)

Create these 6 sheep one by one. Save each `_id` returned.

**SH001 (Bella):**
```json
{
  "tagNumber": "SH001",
  "gender": "female",
  "birthDate": "2022-03-15",
  "weight": 65,
  "breed": "Assaf",
  "fertility": "BB",
  "isPregnant": false,
  "healthStatus": "healthy",
  "notes": "Strong and healthy, excellent genetics"
}
```

**SH002 (Max):**
```json
{
  "tagNumber": "SH002",
  "gender": "male",
  "birthDate": "2021-11-20",
  "weight": 85,
  "breed": "French Dorset",
  "fertility": "BB",
  "healthStatus": "healthy",
  "notes": "Main breeding ram"
}
```

**SH005 (Daisy):**
```json
{
  "tagNumber": "SH005",
  "gender": "female",
  "birthDate": "2022-05-08",
  "weight": 60,
  "breed": "English Dorset",
  "fertility": "B+",
  "isPregnant": false,
  "healthStatus": "healthy",
  "notes": "Got her from the market last spring"
}
```

**SH006 (Rocky):**
```json
{
  "tagNumber": "SH006",
  "gender": "male",
  "birthDate": "2021-08-12",
  "weight": 90,
  "breed": "Afek",
  "fertility": "BB",
  "healthStatus": "healthy",
  "notes": "Best ram I ever bought!"
}
```

**SH008 (needs attention):**
```json
{
  "tagNumber": "SH008",
  "gender": "female",
  "birthDate": "2022-09-14",
  "weight": 63,
  "breed": "French Slowfek",
  "fertility": "AA",
  "isPregnant": false,
  "healthStatus": "needs attention",
  "notes": "Limping on right front leg"
}
```

**SH009 (Gentle):**
```json
{
  "tagNumber": "SH009",
  "gender": "male",
  "birthDate": "2022-04-18",
  "weight": 80,
  "breed": "English Slowfek",
  "fertility": "BB",
  "healthStatus": "healthy",
  "notes": "Calm temperament"
}
```

**SH012 (Pregnant):**
```json
{
  "tagNumber": "SH012",
  "gender": "female",
  "birthDate": "2022-12-10",
  "weight": 58,
  "breed": "Assaf",
  "fertility": "BB",
  "isPregnant": true,
  "pregnancyStartDate": "2025-09-01",
  "healthStatus": "healthy",
  "notes": "Pregnant! Should lamb soon"
}
```

**Expected:** 201 for each.

- [ ] All 7 founders created

### 3.2 POST /api/sheep -- Create offspring (with parent refs)

Use the `_id` values from step 3.1 as `mother`/`father`.

**SH003 (Luna -- child of SH001 + SH002):**
```json
{
  "tagNumber": "SH003",
  "gender": "female",
  "birthDate": "2023-01-10",
  "weight": 52,
  "breed": "Assaf",
  "fertility": "B+",
  "isPregnant": true,
  "pregnancyStartDate": "2025-10-15",
  "healthStatus": "healthy",
  "notes": "First baby from Bella and Max",
  "mother": "<SH001_id>",
  "father": "<SH002_id>"
}
```

**SH004 (Luna's twin -- child of SH001 + SH002):**
```json
{
  "tagNumber": "SH004",
  "gender": "male",
  "birthDate": "2023-01-10",
  "weight": 58,
  "breed": "Romano",
  "fertility": "B+",
  "healthStatus": "healthy",
  "notes": "Luna's twin brother",
  "mother": "<SH001_id>",
  "father": "<SH002_id>"
}
```

**SH007 (child of SH005 + SH006):**
```json
{
  "tagNumber": "SH007",
  "gender": "female",
  "birthDate": "2023-03-22",
  "weight": 48,
  "breed": "Dropper",
  "fertility": "B+",
  "isPregnant": false,
  "healthStatus": "healthy",
  "notes": "Young and energetic",
  "mother": "<SH005_id>",
  "father": "<SH006_id>"
}
```

**SH010 (child of SH008 + SH009):**
```json
{
  "tagNumber": "SH010",
  "gender": "female",
  "birthDate": "2023-06-05",
  "weight": 42,
  "breed": "Sherolle",
  "fertility": "AA",
  "isPregnant": false,
  "healthStatus": "healthy",
  "notes": "Small but healthy",
  "mother": "<SH008_id>",
  "father": "<SH009_id>"
}
```

**SH011 (child of SH005 + SH002):**
```json
{
  "tagNumber": "SH011",
  "gender": "male",
  "birthDate": "2023-02-28",
  "weight": 55,
  "breed": "Romano",
  "fertility": "BB",
  "healthStatus": "healthy",
  "notes": "Dark wool",
  "mother": "<SH005_id>",
  "father": "<SH002_id>"
}
```

**SH013 (lamb -- child of SH001 + SH006):**
```json
{
  "tagNumber": "SH013",
  "gender": "female",
  "birthDate": "2025-12-20",
  "weight": 15,
  "breed": "Assaf",
  "fertility": "AA",
  "isPregnant": false,
  "healthStatus": "healthy",
  "notes": "Just born! Bottle feeding twice daily",
  "mother": "<SH001_id>",
  "father": "<SH006_id>"
}
```

**SH014 (lamb -- twin of SH013, child of SH001 + SH006):**
```json
{
  "tagNumber": "SH014",
  "gender": "male",
  "birthDate": "2025-12-20",
  "weight": 18,
  "breed": "Assaf",
  "fertility": "AA",
  "healthStatus": "healthy",
  "notes": "Tiny's twin brother. Always jumping around!",
  "mother": "<SH001_id>",
  "father": "<SH006_id>"
}
```

**SH015 (child of SH005 + SH009):**
```json
{
  "tagNumber": "SH015",
  "gender": "female",
  "birthDate": "2024-04-10",
  "weight": 45,
  "breed": "English Dorset",
  "fertility": "B+",
  "isPregnant": false,
  "healthStatus": "needs attention",
  "notes": "Not eating well last 2 days",
  "mother": "<SH005_id>",
  "father": "<SH009_id>"
}
```

**Expected:** 201 for each.

- [ ] All 8 offspring created (15 sheep total)

### 3.3 POST /api/sheep -- Duplicate tag rejection

**Body:** Try creating SH001 again.
```json
{
  "tagNumber": "SH001",
  "gender": "male",
  "birthDate": "2024-01-01",
  "weight": 50,
  "breed": "Assaf",
  "fertility": "AA",
  "healthStatus": "healthy"
}
```

**Expected:** 409 -- "A sheep with this tag number already exists"

- [ ] Pass

---

## Phase 4: Sheep Read & Filter

### 4.1 GET /api/sheep -- List all

**Expected:** 200 -- results: 15, returns all 15 sheep.

- [ ] Pass

### 4.2 GET /api/sheep?gender=female

**Expected:** 200 -- only female sheep returned (should be 9: SH001, SH003, SH005, SH007, SH008, SH010, SH012, SH013, SH015).

- [ ] Pass

### 4.3 GET /api/sheep?gender=male

**Expected:** 200 -- only male sheep returned (should be 6: SH002, SH004, SH006, SH009, SH011, SH014).

- [ ] Pass

### 4.4 GET /api/sheep?healthStatus=needs attention

**Expected:** 200 -- SH008 and SH015 only.

- [ ] Pass

### 4.5 GET /api/sheep?search=SH01

**Expected:** 200 -- returns SH010-SH015 (all tags containing "SH01").

- [ ] Pass

### 4.6 GET /api/sheep?breed=Assaf

**Expected:** 200 -- SH001, SH003, SH012, SH013, SH014.

- [ ] Pass

### 4.7 GET /api/sheep/{id} -- Get single sheep

Use the `_id` of SH003.

**Expected:** 200 -- returns Luna's full data.

- [ ] Pass

### 4.8 GET /api/sheep/{id} -- Not found

Use a fake ID like `000000000000000000000000`.

**Expected:** 404 -- "Sheep not found"

- [ ] Pass

---

## Phase 5: Sheep Update & Delete

### 5.1 PUT /api/sheep/{id} -- Update weight

Use SH001's `_id`.

**Body:**
```json
{
  "weight": 68,
  "notes": "Gained 3kg this month - eating well"
}
```

**Expected:** 200 -- returns updated sheep with weight 68.

- [ ] Pass

### 5.2 PUT /api/sheep/{id} -- Mark pregnancy

Use SH005's `_id`.

**Body:**
```json
{
  "isPregnant": true,
  "pregnancyStartDate": "2026-02-01"
}
```

**Expected:** 200 -- Daisy is now pregnant.

- [ ] Pass

### 5.3 DELETE /api/sheep/{id} -- Block deletion of parent

Try deleting SH001 (Bella -- has offspring SH003, SH004, SH013, SH014).

**Expected:** 400 -- "Cannot delete a sheep that has offspring"

- [ ] Pass

### 5.4 DELETE /api/sheep/{id} -- Successful delete

Create a temporary sheep first, then delete it:

**Create:**
```json
{
  "tagNumber": "TEMP001",
  "gender": "male",
  "birthDate": "2024-06-01",
  "weight": 40,
  "breed": "Assaf",
  "fertility": "AA",
  "healthStatus": "healthy"
}
```

Then DELETE using the returned `_id`.

**Expected:** 200 -- "Sheep deleted successfully". Verify with GET /api/sheep that it's gone.

- [ ] Pass

---

## Phase 6: Family Tree

### 6.1 GET /api/sheep/{id}/family -- Child with parents

Use SH003 (Luna)'s `_id`.

**Expected:** 200 -- mother = SH001, father = SH002, siblings include SH004 (same parents), offspring = [] (Luna has no kids).

- [ ] Pass

### 6.2 GET /api/sheep/{id}/family -- Parent with offspring

Use SH001 (Bella)'s `_id`.

**Expected:** 200 -- mother = null, father = null, siblings = [], offspring includes SH003, SH004, SH013, SH014.

- [ ] Pass

### 6.3 GET /api/sheep/{id}/family -- Sheep with half-siblings

Use SH011's `_id` (mother=SH005, father=SH002).

**Expected:** 200 -- siblings include SH007 (same mother SH005), SH003/SH004 (same father SH002), SH015 (same mother SH005).

- [ ] Pass

---

## Phase 7: Matching & Breeding

### 7.1 GET /api/matching/{sheepId} -- Matches for a male

Use SH002 (Max)'s `_id`.

**Expected:** 200 -- list of female matches. Should see:
- SH003 (Luna) = **blocked** (parent-child)
- SH001 (Bella) = **compatible** (unrelated, both BB)
- SH012 = **blocked** (pregnant)
- SH013 = **blocked** (too young -- born Dec 2025, under 16.8 months)

- [ ] Pass

### 7.2 GET /api/matching/{sheepId} -- Matches for a female

Use SH005 (Daisy)'s `_id`. (Note: if you marked her pregnant in step 5.2, she'll be excluded from matching. Either undo that or use SH007 instead.)

**Expected:** 200 -- list of male matches. SH002 should be compatible, SH004 (brother via SH002) should be blocked.

- [ ] Pass

### 7.3 GET /api/matching/stats -- Breeding statistics

**Expected:** 200 -- returns stats including:
- totalMales: 6
- totalFemales: 9
- breedingAgeMales: count of males >= 19.2 months old and healthy
- breedingAgeFemales: count of females >= 16.8 months old, healthy, not pregnant
- growthPotential: sum of litter sizes for breeding-age females

- [ ] Pass

---

## Phase 8: Multi-Tenancy Isolation

### 8.1 Create a second user

**POST /api/auth/signup:**
```json
{
  "username": "farmer2",
  "password": "password123",
  "email": "farmer2@test.com",
  "farmName": "Hilltop Ranch"
}
```

Save the new accessToken. Re-authorize Swagger with it.

- [ ] Pass

### 8.2 GET /api/sheep -- Empty for new user

**Expected:** 200 -- results: 0. The new user has no sheep.

- [ ] Pass

### 8.3 POST /api/sheep -- Same tag number allowed

```json
{
  "tagNumber": "SH001",
  "gender": "female",
  "birthDate": "2023-01-01",
  "weight": 55,
  "breed": "Romano",
  "fertility": "B+",
  "healthStatus": "healthy"
}
```

**Expected:** 201 -- farmer2 can have their own SH001 (different farm).

- [ ] Pass

### 8.4 GET /api/sheep/{id} -- Cross-user access blocked

Use a sheep `_id` from farmer1's herd (any ID from Phase 3).

**Expected:** 404 -- farmer2 cannot see farmer1's sheep.

- [ ] Pass

---

## Summary Checklist

| # | Endpoint | Test | Pass |
|---|----------|------|------|
| 1.1 | POST /api/auth/signup | Register new user | [ ] |
| 1.2 | POST /api/auth/signup | Duplicate rejection | [ ] |
| 1.3 | POST /api/auth/login | Valid login | [ ] |
| 1.4 | POST /api/auth/login | Wrong password | [ ] |
| 1.5 | GET /api/auth/me | Get profile | [ ] |
| 1.6 | POST /api/auth/refresh | Token rotation | [ ] |
| 1.7 | POST /api/auth/logout | Logout | [ ] |
| 2.1 | PUT /api/users/profile | Update farmName | [ ] |
| 2.2 | PUT /api/users/profile | Update email | [ ] |
| 3.1 | POST /api/sheep | Create 7 founders | [ ] |
| 3.2 | POST /api/sheep | Create 8 offspring | [ ] |
| 3.3 | POST /api/sheep | Duplicate tag rejection | [ ] |
| 4.1 | GET /api/sheep | List all (15) | [ ] |
| 4.2 | GET /api/sheep?gender=female | Filter females | [ ] |
| 4.3 | GET /api/sheep?gender=male | Filter males | [ ] |
| 4.4 | GET /api/sheep?healthStatus | Filter health | [ ] |
| 4.5 | GET /api/sheep?search | Search by tag | [ ] |
| 4.6 | GET /api/sheep?breed | Filter by breed | [ ] |
| 4.7 | GET /api/sheep/{id} | Get single sheep | [ ] |
| 4.8 | GET /api/sheep/{id} | Not found | [ ] |
| 5.1 | PUT /api/sheep/{id} | Update weight | [ ] |
| 5.2 | PUT /api/sheep/{id} | Mark pregnant | [ ] |
| 5.3 | DELETE /api/sheep/{id} | Block parent delete | [ ] |
| 5.4 | DELETE /api/sheep/{id} | Delete temp sheep | [ ] |
| 6.1 | GET /api/sheep/{id}/family | Child family tree | [ ] |
| 6.2 | GET /api/sheep/{id}/family | Parent offspring | [ ] |
| 6.3 | GET /api/sheep/{id}/family | Half-siblings | [ ] |
| 7.1 | GET /api/matching/{id} | Male matches | [ ] |
| 7.2 | GET /api/matching/{id} | Female matches | [ ] |
| 7.3 | GET /api/matching/stats | Breeding stats | [ ] |
| 8.1 | POST /api/auth/signup | Second user | [ ] |
| 8.2 | GET /api/sheep | Empty for new user | [ ] |
| 8.3 | POST /api/sheep | Same tag allowed | [ ] |
| 8.4 | GET /api/sheep/{id} | Cross-user blocked | [ ] |
