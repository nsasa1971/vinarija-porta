# Vinarija Porta — statički sajt

Čist HTML/CSS/JS sajt (bez WordPress-a, bez build alata) za Vinariju Porta, selo Rečka kod Negotina.

## Struktura

```
index.html                       Početna
vinoteka.html                    Katalog vina (cenovnik + "Dodaj u upit")
vinarija.html                    O vinariji / istorija
faq.html                         Najčešća pitanja
blog.html                        Blog — pregled članaka
blog-berba-2025.html             Blog članak: Berba 2025
blog-cuvee-odlezavanje.html      Blog članak: odležavanje Cuvée-a
blog-rose-porta.html             Blog članak: Rose Porta
kontakt.html                     Kontakt + forma za upit/narudžbinu
404.html                         Stranica za nepostojeće URL-ove

css/style.css         Kompletan dizajn (paleta #B2936D bež / #2C3136 tamna)
js/cart.js            Mini "korpa upita" (localStorage, bez plaćanja)
js/main.js            Navigacija, učitavanje vina, FAQ akordeon, brojčanici, slanje forme
data/products.json    Vina: naziv, cena, opis, slika — menja se bez diranja HTML-a
images/               Prave fotografije vinarije, vinograda i proizvoda (WebP/JPG)
netlify.toml          Podešavanja za Netlify deploy
robots.txt, sitemap.xml   Osnovni SEO fajlovi
```

## Kako radi korpa upita (bez online plaćanja)

- Na stranici **Vinoteka** svako vino ima količinu (u koracima od 6 boca) i dugme "Dodaj u upit".
- Izabrana vina se čuvaju u `localStorage` (mini korpa), sa tekućim zbirom cene.
- Ikonica "Upit" u headeru otvara panel sa pregledom, izmenom količina i uklanjanjem stavki.
- Na stranici **Kontakt** (`#narudzbina`) prikazuje se pregled izabranih vina, a forma traži podatke firme (naziv, PIB/matični broj, kontakt osoba, telefon, email, adresa isporuke, napomena).
- Slanjem forme, podaci + spisak vina odlaze na email preko **Netlify Forms**. Nema checkout-a niti plaćanja online — narudžbina se dalje obrađuje ručno (ponuda, faktura, dogovor oko isporuke).
- Ako Netlify Forms iz nekog razloga ne radi (npr. sajt hostovan negde drugde), dostupna su dva rezervna dugmeta: **Pošalji mejlom** (mailto:) i **Pošalji preko WhatsApp-a** (wa.me), koja generišu isti tekst upita.

## Izmena vina (bez diranja HTML-a)

Sve izmene cena, opisa i asortimana rade se u `data/products.json`:

```json
{
  "id": "cuvee",
  "naziv": "Cuvée",
  "tip": "Crveno vino",
  "cena": 1100,
  "valuta": "RSD",
  "jedinica": "po boci · pakovanje 6 kom",
  "pakovanje": 6,
  "sorta": "67% Cabernet Sauvignon, 33% Merlot",
  "opis": "...",
  "slika": "images/Cuvee-1000x1000-1-600x600.jpg"
}
```

Dodavanje novog vina = dodavanje novog objekta u niz. Stranice `index.html` i `vinoteka.html` automatski učitavaju listu preko JavaScript-a (`fetch("data/products.json")`).

**Napomena:** zbog `fetch()` poziva, `products.json` se neće učitati ako sajt otvorite direktno kao lokalni fajl (`file://...`) u nekim browserima. Za lokalni razvoj pokrenite jednostavan lokalni server, npr.:

```
npx serve .
```

ili u Python-u:

```
python -m http.server 8080
```

Na Netlify-ju ovo automatski radi ispravno.

## Slike

Sve slike na sajtu su prave fotografije vinarije, vinograda i proizvoda (konvertovane u `.webp` gde je to imalo smisla radi performansi). `images/hero-vinograd.svg` ostaje samo kao CSS fallback pozadina za `.page-hero` ako ikada nedostaje inline pozadinska slika za neku stranicu.

## SEO

Svaka stranica ima `<title>`, `meta description`, `og:title/description/image/url` i `canonical` link. `index.html` i `faq.html` dodatno imaju `schema.org` strukturirane podatke (Winery / FAQPage). `images/og-image.jpg` se koristi za prikaz linka na društvenim mrežama. Pre objave proverite da `https://vinarijaporta.rs/` u meta tagovima i `sitemap.xml`/`robots.txt` odgovara stvarnom domenu.

## Deploy: GitHub → Netlify

1. Napravite novi GitHub repozitorijum i push-ujte ceo sadržaj ovog foldera:
   ```
   git init
   git add .
   git commit -m "Inicijalna verzija sajta Vinarija Porta"
   git branch -M main
   git remote add origin https://github.com/<vas-nalog>/vinarija-porta.git
   git push -u origin main
   ```
2. Na [app.netlify.com](https://app.netlify.com) izaberite **Add new site → Import an existing project → GitHub** i povežite repozitorijum.
3. Build podešavanja: **Build command** ostaviti prazno, **Publish directory**: `.` (koren repozitorijuma) — ovo je već podešeno u `netlify.toml`.
4. Nakon prvog deploy-a, Netlify automatski prepoznaje formu `narudzbina-upit` (zbog `data-netlify="true"` atributa) i počinje da prosleđuje upite na email vlasnika naloga. Email primalac se podešava u **Site settings → Forms → Form notifications**.
5. Svaki naredni `git push` na `main` granu automatski pokreće novi deploy (Netlify auto-deploy).

## Kontakt podaci korišćeni na sajtu

- Adresa: Selo Rečka, Negotin
- Telefon: +381 65 326 87 22
- Email: stevica.inovacije@gmail.com

Po potrebi izmenite broj za WhatsApp rezervni kanal u `js/main.js` (promenljiva `WHATSAPP_NUMBER`).
