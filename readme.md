# AMŐBA
Egy egyszerű játék, amit egy álláspályázatra készítettem. :)

## De milyen technológiával és miért azzal?
Részben azért, mert úgy hiszem, hogy leginkább a saját kézzel írott kód mutat belőlem a legtöbbet, és persze a feladat leírásában is lényegében ezek szerepeltek. Nevezetesen a **HTML5**, a **CSS3** (egy kis preprocesszorral) és a **VanillaJS** - természetesen **ES5-6** elemekkel.

A **Fontavesome** és a **Google Fonts** kivételével nem használtam fel semmilyen külső erőforrást, és Library-t vagy Framework-öt sem.

> [!MEGJEGYZÉS]
> Persze választhattam volna a React JS-t is, de még tanulom ezt a technikát szorgalmasan. Talán 1-2 hónap és belevágok... :->

## A játék indítása

A legegyszerűbb a következő linken elérni: [Amőba játék](https://pusztafi.hu/amoeba/)
<br>Repó:  https://github.com/gaborPu/amoeba.git

<hr>

### `Megoldott részfeladatok`
- A játék egy `LOGIN` ablakkal indul, ám a form bármit elfogad, akár az üresen hagyott mezőket is. Lehetett volna kicsit tovább fejleszteni, de valahogy az volt az érzésem, hogy nem volt szükség rá.
- A LOGIN után egy `BEÁLLÍTÁS` képernyő következik, ahol választhatunk, hogy `2, 3 vagy 4 játékos` játsszon, megadhatjuk a `játékosok nevét` és a játékosok által használni kívánt `jelet (bábu, figura)` is. Ugyanezen az oldalon be lehet állítani, hogy `milyen méretű legyen a tábla`, a választék persze attól függ, hogy milyen széles képernyőn futtatjuk a játékot.
Ha semmit sem állítunk be, akkor alapértelmezetten 2 játékos játszik egy 10x10-es pályán alapértelmezett (klasszikus) jelekkel.
- A játék vezérli a játszma teljes folyamatát, mutatja, hogy `melyik játékos következik` - és ezt írásban is jelzi, folyamatosan figyeli, hogy `érvényes legyen a lépés`, és figyeli a `megnyerést is`, amit egy kis animációval is kiemel.
- A játék során bármikor kezdhetünk `új játékot` a korábbi beállításokkal, vagy visszaugorhatunk a `BEÁLLÍTÁS panelre`, ahol minden paramétert módosíthatunk.
- A játék `PWA kompatibilis`, mobilra, tabletre, Windows és Mac gépekre is telepíthető.

<hr>


```javascript
let decision = ifYouLikeThisGame(amoeba) ? 'round two is coming' : '...the game is really over';
```
