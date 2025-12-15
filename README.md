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