# Fitnes Aplikacija

## Opis

Skupinski projekt za fitnes aplikacijo.

## Struktura

Struktura še ni dokončna.

```
frontend/
backend/
```

## Osnovna navodila

### 1. Pred začetkom dela

Vedno posodobi lokalni repozitorij, da imaš najnovejše spremembe:

```bash
git pull
```

### 2. Dodaj in commitaj svoje spremembe

```bash
git add .
git commit -m "Kratek opis spremembe"
```

### 3. Na koncu dela pushaj

```bash
git push
```

## Branching strategija

Za lažje sodelovanje uporabljamo feature based branching strategijo. Vse spremembe delamo v `develop` branchu, po skupnem reviewju in zaključku iteracije pa mergamo v `main`. S tem je `main` vedno funkcionalen in deployable.

### Glavni branchi

- **`main`** – stabilna verzija aplikacije, vedno deployable.
- **`develop`** – integracijski branch, kjer združujemo nove funkcionalnosti pred mergom v `main`.

### Feature branchi

Za vsako novo funkcionalnost ali večjo spremembo ustvarimo feature branch iz `develop` brancha. Za funkcionalnosti uporabimo na primer `feature/ime-funkcionalnosti`, za popravljanje `bugfix/kaj-popravljamo` itd.

## Git Workflow

1. Ustvari feature branch iz `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/ime-funkcionalnosti
```

2. Razvij funkcionalnost in testiraj
3. Commitaj spremembe s kratkim jasnim opisom:
   Uporabi standard Conventional Commits:

- `feat:` - nova funkcionalnost
- `fix:` - popravek napake
- `docs:` - dokumentacija
- `chore:` - manjše spremembe brez vpliva na funkcionalnost
- `refactor:` - refaktoriranje kode

4. Pushaj feature branch na remote:

```bash
git push --set-upstream origin feature/ime-funkcionalnosti
```

5. Odpri pull request v `develop` (razen za hotfix ali release, ki gre v `main`)

## Pull Request Workflow

Za vsak pull request uporabi prednastavljeni template, ki se nahaja v
`.github/pull_request_template.md`.

1. Ustvari novo vejo iz `develop`
2. Izvedi potrebne spremembe
3. Odpri pull request v:
   - `develop` za običajne spremembe
   - `main` samo za release ali hotfix
4. Izpolni vse sekcije v pull request templateu:
   - **Opis** – kratek povzetek spremembe
   - **Zakaj** – razlog za spremembo
   - **Spremembe** – označi tip pull requesta (bug fix, nova funkcionalnost, refaktor)
   - **Checklist** – označi, če je koda formatirana, testirana in dokumentacija posodobljena
   - **Testiranje** – če je pomembno, opiši testiranje spremembe
   - **Target branch** – označi ciljno vejo
5. Po pregledu in odobritvi pull requesta mergeaj v ciljno vejo.

## Pull Request Review Process

Da zagotovimo kakovost kode in skladnost s smernicami, sledimo naslednjemu procesu:

1. **Dodelitev pregledovalcev:**

- Vsak pull request mora pregledati vsaj en drug član ekipe.
- Za kritične ali večje spremembe pregledamo vsi člani ekipe.

2. **Preverjanje vsebine pull requesta:**

- Commit sporočila sledijo pravilom.
- Koda ustreza standardom (formatiranje, naming conventions).
- Funkcionalnosti so testirane.
- Pull request ne povzroča konfliktov z `develop`.

3. **Podajanje komentarjev:**

- Pregledovalci predlagajo izbljšave, popravke ali dodatne funkcionalnosti.
- V primeru nesoglasij se izvede skupna razprava.

4. **Odobritev pull requesta:**

- Po odobritvi pregleda pull request mergeamo v `develop` (ali `main` za release in hotfix).
- Po mergeu pull requesta zapremo in po potrebi izbrišemo feature branch.

### Database & Migrations
Za vzpostavitev baze uporabi naslednje korake:
1. Ustvari `.env` datoteko v `backend/` mapi z `DATABASE_URL`.
2. Zaženi `npm install` za namestitev Sequelize.
3. Zaženi migracije z ukazom:
   ```bash
   npm run migrate

## Zagon aplikacije

1. **Backend**:
   - Pojdi v `/backend`
   - Zaženi `npm run dev` (teče na portu 3000)

2. **Frontend**:
   - Pojdi v `/frontend`
   - Zaženi `npm run dev` (teče na portu 5174 - *opomba: preveri port ob zagonu*)