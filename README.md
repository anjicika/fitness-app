# Fitness Aplikacija

## Opis
Skupinski projekt za fitness aplikacijo.

## Struktura
frontend/
backend/


## Navodila in pomoč
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
Za lažje sodelovanje uporabimo feature based branching strategijo. Vse delamo v `develop` branchu in vsak konec tedna mergamo v `main`. S tem je `main` vedno funkcionalen in deployable.

### Glavni branchi
- **`main`** – stabilna verzija aplikacije, vedno deployable.  
- **`develop`** – integracijski branch, kjer združujemo nove funkcionalnosti pred mergom v `main`.

### Feature branchi
Za vsako novo funkcionalnost ustvarimo feature branch iz `develop` brancha. Za funkcionalnosti uporabimo na primer `feature/ime-funkcionalnosti`, za popravljanje `bugfix/kaj-popravljamo` itd.

### Navodila
1. Ustvari feature branch iz `develop`
2. Razvij funkcionalnost in testiraj
3. Naredi pull request v `develop`
4. Po skupinski odobritvi merge


## Pull Request Workflow

Za vsak PR uporabi prednastavljeni template, ki se nahaja v `.github/pull_request_template.md`.

1. Ustvari vejo iz `develop`.
2. Izvedi spremembe.
3. Odpri Pull Request v `develop` (ali v `main` samo za release / hotfix).
4. Izpolni vse sekcije v templateu:
   - **Opis**: Kaj PR spreminja
   - **Zakaj**: Razlog za spremembo
   - **Spremembe**: Tip PR (bugfix, feature, refaktor)
   - **Testiranje**: Je funkcionalnost testirana in kako
   - **Target branch**: Označi pravo vejo
5. Po pregledu in odobritvi PR mergeaj v ciljno vejo.
