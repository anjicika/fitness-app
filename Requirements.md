# Zahteve projekta FitnesERI

## Uporabniške zgodbe (User Stories)

Kot nov uporabnik želim registracijo prek e-pošte in gesla, da si ustvarim račun in dostopam do aplikacije.

Kot uporabnik želim vnašati svoje dnevne obroke, da sledim vnosu kalorij.

Kot uporabnik želim iskati trenerje po specializaciji, da najdem ustreznega in rezerviram trening.

Kot uporabnik želim objaviti vprašanje na forumu, da prejmem nasvete skupnosti.

Kot uporabnik želim videti grafikon svoje teže skozi čas, da sledim napredku.

Kot uporabnik želim klepetati z AI trenerjem, da prejmem personaliziran načrt vadbe.

Kot trener želim upravljati svoj urnik terminov, da nadziram razpoložljivost za stranke.

Kot uporabnik želim ustvariti lasten načrt vadbe s serijami, ponovitvami in utežmi.

## Funkcionalne zahteve (Functional Requirements)

Sistem mora omogočiti uporabniku ustvarjanje računa z vnosom e-pošte, gesla in imena.

Sistem mora omogočiti uporabniku vnos obrokov in sledenje vnosu kalorij.

Sistem mora omogočiti uporabniku iskanje trenerjev na podlagi lokacije, specializacije in ocene.

Sistem mora omogočiti rezervacijo terminov za treninge.

Sistem mora omogočati objavljanje in odgovarjanje na vprašanja na forumu.

Sistem mora omogočiti administratorju brisanje neprimernih objav na forumu.

Sistem mora hraniti zgodovino uporabnikove teže in jo prikazati na linijskem grafikonu.

Sistem mora omogočiti uporabniku pošiljanje sporočila AI asistentu za prehrano in prejemanje personaliziranih predlogov obrokov.

Sistem mora omogočiti trenerju upravljanje z urnikom terminov.

Sistem mora omogočiti uporabniku dodajanje treningov z imeni vadb, serijami, ponovitvami in utežmi.

## Nefunkcionalne zahteve (Non-Functional Requirements)

### Zmogljivost (Performance)

- 90 % zahtev za prijavno stran se mora končati v manj kot 2 sekundah.
- Odziv API-ja na standardne zahteve mora biti pod 500 ms.
- Sistem mora podpreti sočasno 100 aktivnih uporabnikov, pri čemer ohranja prejšnjo zmogljivost.

### Varnost (Security)

- Vsa gesla morajo biti zgoščena (bcrypt) v podatkovni bazi.
- Komunikacija med odjemalcem in strežnikom mora biti šifrirana (HTTPS).
- Dostop do občutljivih uporabniških podatkov (teža, slike) mora biti omejen samo na lastnika računa.

### Uporabnost (Usability)

- Vmesnik mora biti intuitiven in se mora da uporabljati z minimalnimi navodili.
- Aplikacija mora biti popolnoma odzivna (responsive) in delovati na vseh velikostih zaslona (mobilni, tablica, namizni).

### Zanesljivost (Reliability)

- Sistem mora imeti razpoložljivost (uptime) najmanj 99 %.
- V primeru napake mora uporabnik prejeti razumljivo sporočilo in ne surovi sled napake (stack trace).
