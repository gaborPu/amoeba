/**
 * Amőba játék
 * 
 * Készült: a HMEI által meghirdetett álláspályázat
 * első fordulójaként.
 * 
 * @author Pusztafi Gábor
 * @web https://pusztafi.hu/amoeba/
 * 
 */


/**
 * Importáljuk a játék figuráinak url-jét tartalmazó tömböt
 * 
 * @notice Eredetileg a kezdetben az összes globális hatókörű változót ide akartam tenni.
 * @param {object} gameDatas{}
 * 
 */
import gameDatas from "./modules/gameDatas.js";

/**
 * Globális változók deklarálása
 */

// A játéktábla szülőeleme, ebben hozzuk létre dinamikusan a játékcellákat
const GRID_CONTAINER = document.querySelector('#grid-container');

// Az üzenetblokk tárolóeleme
const MESSAGE_BOX = document.querySelector('#message-span');

// A győztes animációhoz dinamikusan generált elemeinek szülőeleme
const KONFETTI_CONTAINER = document.querySelector('#konfetti-container');

// A játéktábla méretező gombjainak objektuma
const BOARD_SIZE_BUTTONS = document.querySelector('.board-size');

// A játékosok adatait tartalmazó tömb
let players = [
    { name : "", figureUrl : "" },
    { name : "", figureUrl : "" },
    { name : "", figureUrl : "" },
    { name : "", figureUrl : "" },
];

// A játéktábla sorainak számát tartalmazó változó, alapértelmezett értéke: 10
let rows = 10;

// A játéktábla oszlopainak számát tartalmazó változó, alapértelmezett értéke: 10
let cols = 10;

// A játéktábla celláinak szélessége pixelben
let gridWidth = 34;

// A játéktábla celláinak magassága pixelben
let gridHeight = 34;

// Az aktuális játékos sorszáma
let actualPlayer = 0;

// Az aktív játékosok sorszám tömbje
let activePlayers = [0, 1];

// A játékban megtett lépések nyilvántartása, ez a mátrix az alapja a lépések
// érvényessége és a győzelem elérése megállapításnak
let gameBoardMatrix = [];

// Az aktuális játékosok száma
let numberOfPlayers = 2;


/**
 * A játékot vezérlő objektum
 * 
 * @param {object} gameHandler{}
 * 
 */

let gameHandler = {

    // Lekérdezi és visszaadja a kliens eszköz kijelzőjének szélességét pixelben
    getDeviceSizes: function() {
        const response = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        return response;
    },

    // A játék inicializáló metódusa
    initGame: function() {

        // Kiürítjük a játék lépéseit tároló mátrix tartalmát
        gameBoardMatrix = [];

        // Eltávolítjuk a játéktábla generált cella elemeit - ha vannak
        document.querySelectorAll(".grid-element").forEach(el => el.remove());

        // Feltöltjük a lépéseket tároló multidimenzionális tömböt (mátrix) 
        // 'NULL' értékkel, ez az érték reprezentálja a játéktábla szabad helyeit.
        gameBoardMatrix = Array(rows).fill(null).map(() => Array(cols).fill(null));

        // Eltüntetjük az előző játékban esetlegesen még látható győzelmi animáció
        // tárolóelemét, amely egyben a tábla 'CLICK' eseményét is blokkolja
        KONFETTI_CONTAINER.style.display = 'none';

        // Feltöltjük alapértelmezett nevekkel és jelekkel a játékosokat nyilvántartó
        // objektum változót
        for (let i = 0; i < 2; i++) {
            if(players[i].name == "") players[i].name = `Anonymus-${i+1}`;
            if(players[i].figureUrl == "") players[i].figureUrl = `./images/figures/fig_${i+1}.png`;
        }

        // Inicializáljuk a segédváltozókat
        let sumPlayers = 0;
        activePlayers = [];
        let nameToBeWritten = "";
        let figureToBeWritten = "";

        // Beállítjuk az összes játékosnak a nevét és a jelét.
        // Különbséget teszünk a 2 alapértelmezett játékos - ők minimálisan kellenek
        // ahhoz, hogy egyáltalán elkezdődhessen a játék - és a választható játékosok között.
        // A játékoskártyákon a még meg nem adott nevek instruálják a felhasználót (Kattints ide!)
        // Viszont ha mégsem ír be a játékos egy nevet, akkor az 'Anonymus-x' névvel indulhat a játék.
        // Név vagy jel nélkül játékos nincs, ha a felhasználó nem ad meg ilyet, akkor mi 
        // generálunk neki.
        for(let i = 0; i < 4; i++) {
            if( players[i].name === "" ) {
                if(i<2) {
                    nameToBeWritten = "Anonymus-" + i;
                    figureToBeWritten = gameDatas.icons[i];

                } else {
                    nameToBeWritten = "Kattints ide!";
                    figureToBeWritten = gameDatas.icons[15];
                }
                
            } else {
                nameToBeWritten = players[i].name;
                figureToBeWritten = players[i].figureUrl;
            }
            document.querySelector("#player-game-name-" + i).innerHTML = nameToBeWritten;
            document.querySelector("#player-name-" + i).innerHTML =nameToBeWritten;
            document.querySelector("#player-figure-" + i).style.backgroundImage = `url(${figureToBeWritten})`;
            document.querySelector("#player-figure-" + i).style.backgroundSize = "contain";
            document.querySelector("#player-game-figure-" + i).style.backgroundImage = `url(${figureToBeWritten})`;
            document.querySelector("#player-game-figure-" + i).style.backgroundSize = "contain";
            
        }
        
        // Feltöltjük az 'activePlayers[]' tömböt az aktív játékosok ID-jével
        for (let i = 0; i < 4; i++) {
            if(players[i].name !== "") {
                sumPlayers + 1;
                activePlayers.push(i);
            }
        }
        numberOfPlayers = sumPlayers;

        // beállítjuk a játékot kezdő játékos sorszámát
        actualPlayer = 0;

        // Kiiratjuk az üzenet boxba a kezdő lépés üzenetét a kezdő játékosnak
        this.printMessageFromString(`Kedves ${players[actualPlayer].name}, tiéd az első lépés!`);
    },

    // Ez az összetett metódus végzi a játék összes (nem alapértelmezett) beállításának
    // vezérlését.
    // Ha lenne még időm, refaktorálnám egyszerűbbre, sajnos ez így egy kisit zavaros lett.
    // Viszont működik... :))
    setupGameProperties: function() {

        // Az eszköz képernyőméretét alapul véve eldöntjük, hogy milyen szélességű táblaméret
        // kiválasztását engedélyezzük.
        let initGameBoardSizes = this.getDeviceSizes();
        document.querySelector("#board-size-25").style.display =  initGameBoardSizes < 870 ? "none" : "block";
        document.querySelector("#board-size-20").style.display =  initGameBoardSizes < 700 ? "none" : "block";
        document.querySelector("#board-size-15").style.display =  initGameBoardSizes < 530 ? "none" : "block";
        console.log(initGameBoardSizes);

        //A játékoskártya kiválasztása
        let gamerButtons = document.querySelectorAll(".player");

        //Az adott játékos beállítási paneljeinek kiválasztása
        let gamerSetupLayers = document.querySelectorAll(".select-figure");

        gamerButtons.forEach(gButton => {
            gButton.addEventListener("click", (e) => {
                gamerSetupLayers.forEach(sLayer => {
                    sLayer.classList.add("hidden");
                });
                if(gButton.nextElementSibling.classList.contains("hidden")) {
                    gButton.nextElementSibling.classList.remove("hidden");
                } else {
                    gButton.nextElementSibling.classList.add("hidden");
                }
            })
        });

        // a játékos bábujának kiválasztása
        let figureSelectButtons = document.querySelectorAll(".select-element");

        //Ciklussal végigmegyünk az összes bábut tartalmazó elemen
        figureSelectButtons.forEach(fBtton => {

            //Mindegyik bábu-elemhez "click" eseménykezelőt állítunk be
            fBtton.addEventListener("click", () => {
                
                //Kijelöljük az adott bábu-elem szülő elemét
                let parentNodeOfThisButton = fBtton.parentNode;

                //Kiszedjük a szülő elem ID-jéből az utolsó, sorszámként viselkedő karakterét
                let parentNodeIdOfThisButton = parseInt(parentNodeOfThisButton.id.at( - 1));

                //A kijelölt szülőelemhez tartozó bábu-elem-eket kijelöljük
                let allSiblingElementsOfThisButton = parentNodeOfThisButton.querySelectorAll(".select-element");

                //Ciklussal végigmegyünk a 15 bábu-elemen és töröljük az "active-figure" class-t
                allSiblingElementsOfThisButton.forEach(sButtons => {
                    sButtons.classList.remove("active-figure");
                });

                //Az épp kattintott bábu-elemhez hozzáadjuk az "active-figure" classt (kiválasztottság jelzés)
                fBtton.classList.add("active-figure");

                //Beállítjuk az aktuális játékoshoz tartozó bábu-elem kép URL-jét a players globális változóban
                players[parseInt(parentNodeIdOfThisButton)].figureUrl = gameDatas.icons[parseInt(fBtton.dataset.number -1)];

                //Beírjuk a játékosok kártyáján levő bábu képfájlok URL-jét a megfelelő div elemhez
                let pNumberFigure = document.querySelector("#p" + parentNodeIdOfThisButton).querySelector(".player-figure");
                pNumberFigure.style.backgroundImage = `url(${players[parseInt(parentNodeIdOfThisButton)].figureUrl})`;
                pNumberFigure.style.backgroundSize = "contain";

                let pgNumberFigure = document.querySelector("#pg" + parentNodeIdOfThisButton).querySelector(".player-figure");
                pgNumberFigure.style.backgroundImage = `url(${players[parseInt(parentNodeIdOfThisButton)].figureUrl})`;
                pgNumberFigure.style.backgroundSize = "contain";
                
            })
        });

        // Ez a blokk a táblaméret kiválasztását vezérli
        let boardSizes = document.querySelectorAll(".board-size");
        boardSizes.forEach(bSize => {
            bSize.addEventListener("click", () => {
                sizeButtonsDeselect(boardSizes);
                rows = cols = parseInt(bSize.dataset.value);
                bSize.classList.add("active-size");
            })
        })
        function sizeButtonsDeselect(btnObject) {
            btnObject.forEach(btnElem => {
                btnElem.classList.remove("active-size");
            })

        }
        //Kiválasztjuk a beállítási paneleken levő MENTÉS gombokat
        let readyButtons = document.querySelectorAll(".readyButton");

        //Ciklussal végigmegyünk a gombokon és "click" eseményt rendelünk hozzá
        readyButtons.forEach(rButton => {
            rButton.addEventListener("click", () => {
                //A gomb "value" értékéből kinyerjük az aktuális játékos sorszámát
                let actPlayerSet = parseInt(rButton.value.substr(rButton.value.length - 1));
                //A DOM-ban megkeressük az aktuális játékos beállítási paneljének fő szülőelemét
                let actLayerOfGrandParent = document.querySelector("#player" + actPlayerSet);
                //Megkeressük az aktuális játékos beállítási paneljén a nevét tartalmazó INPUT mező tartalmát
                let actPlayerName = document.querySelector("#player-change-name-" + actPlayerSet).value;
                //Az INPUT mező értékét átvezetjük a megfelelő helyekre. Ha az érték üres, default neveket írunk be.
                document.querySelector("#player-name-" + actPlayerSet).innerHTML = actPlayerName.length > 0 ? actPlayerName : "Kattints ide!!";
                document.querySelector("#player-game-name-" + actPlayerSet).innerHTML = actPlayerName.length > 0 ? actPlayerName : "Anonymus-" + actPlayerSet;
                //Becsukjuk (eltüntetjük) a MENTÉS gombbal lezárt aktuális beállítási panelt.
                gamerSetupLayers.forEach(sLayer => {
                    sLayer.classList.add("hidden");
                });
                
                if(actPlayerName.length > 0) {
                    players[actPlayerSet].name = actPlayerName;
                    actLayerOfGrandParent.querySelector(".player").classList.add("active-player");
                } else if(actPlayerSet < 2) {
                    players[actPlayerSet].name = "Anonymus-" + actPlayerSet;
                } else {
                    players[actPlayerSet].name = "";
                }
            })
        });

        // Ez a kód végzi a beállítások felületen a játékos törlés funkciót. A törlés csak a
        // 3. és 4. játékos esetében áll rendelkezésre, mert a játék alapértelmezetten minimum
        // 2 játékossal indulhat.

        // Kiválasztjuk a DOM-ban a "Játékos törlése" gombokat
        let deletePlayer = document.querySelectorAll(".delete-player");

        // Ciklussal végigmegyünk a gombokon
        deletePlayer.forEach(dpButton => {

            // A gombokhoz hozzárendeljük a "click" eseménykezelőt
            dpButton.addEventListener("click", () => {
                // Megkeressük az aktuális játékos sorszámát
                let actDeletingPlayer = parseInt(dpButton.value.substr(dpButton.value.length - 1));

                // Megkeressük a DOM-ban az aktuális játékos beállítási paneljének szülő elemét
                let deletingLayerOfGrandParent = document.querySelector("#player" + actDeletingPlayer);

                // Megkeressük a játékoskártyák név és figura mezőit a DOM-ban és default értéket adunk neki
                document.querySelector(`#player-name-${actDeletingPlayer}`).innerHTML = "Kattints ide!!";
                document.querySelector(`#player-game-name-${actDeletingPlayer}`).innerHTML = "Anonymus-" + actDeletingPlayer;

                document.querySelector(`#player-figure-${actDeletingPlayer}`).style.backgroundImage = `url(${gameDatas.icons[15]})`;
                document.querySelector(`#player-figure-${actDeletingPlayer}`).style.backgroundSize = "contain";
                console.log(`url(${gameDatas.icons[15]});`);
                document.querySelector(`#player-game-figure-${actDeletingPlayer}`).style.backgroundImage = `url(${gameDatas.icons[15]})`;
                document.querySelector(`#player-game-figure-${actDeletingPlayer}`).style.backgroundSize = "contain";

                //Becsukjuk (eltüntetjük) a JÁTÉKOS TÖRLÉSE gombbal lezárt aktuális beállítási panelt.
                gamerSetupLayers.forEach(sLayer => {
                    sLayer.classList.add("hidden");
                });

                // Beállítjuk a globális "player" objektum aktuális játékost tartalmazó mezőit
                players[actDeletingPlayer].name = "";
                players[actDeletingPlayer].figureUrl = "./images/figures/fig_100.png";
                deletingLayerOfGrandParent.querySelector(".player").classList.remove("active-player");
            })
        });
    },

    // A játéktábla megrajzolása a beállított, vagy az alapértelmezett méretben
    drawGameBoard: function() {
        this.initGame();

        // A játéktábla cellaszámának ismeretében a tábla szülőelemének
        // tulajdonságait állítjuk be (szélesség, magasság, grid-template)
        // majd legeneráljuk az összes cellaelemet és azok tulajdonságait.
        GRID_CONTAINER.style.width = gridWidth * cols + 6 + 'px';
        GRID_CONTAINER.style.height = gridHeight * rows + 6 + 'px';
        GRID_CONTAINER.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        GRID_CONTAINER.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        for( let i = 0; i < rows; i++) {
            for( let j = 0; j < cols; j++) {
                let gridElement = document.createElement("div");
                gridElement.classList.add('grid-element');
                gridElement.setAttribute('data-row', i);
                gridElement.setAttribute('data-col', j);
                gridElement.style.width = gridWidth + "px";
                gridElement.style.height = gridHeight + "px";
                GRID_CONTAINER.appendChild(gridElement);
            };
        };

        // Kijelöljük a cellákat egy objektum változóval
        this._gridElements = document.querySelectorAll('.grid-element');

        this.setListenersOfGrids();
    },

    // Ez a metódus rendeli hozzá a "CLICK" eseménykezelőket a gombokhoz, a jelválasztó
    // gombokhoz, a játéktábla celláihoz és a játékosok névkártyáihoz.
    setListenersOfGrids: function() {
        
        // Az initGame metódus után beállítjuk az első játékos névkártyáját aktívként,
        //  elsőként kijelöljük az 1. játékos kártyáját
        let actualPlayerBox = document.querySelector('#player-game-0');

        // Eltüntetjük az összes játékoskártyát (display: none)
        clearBoxes();

        // az aktuális - tehát az első - játékos kártyáját megjelenítjük
        actualPlayerBox.style.display = 'block';

        // Az objektum hatókörű _gridElements változót (ami a táblát alkotó mezőket jelenti) elemeire bontjuk
        this._gridElements.forEach(element => {

            // Az egységnyi mezőkhöz hozzárendelünk egy-egy "click" eseménykezelőt
            element.addEventListener("click", (e) => {
                // Deklaráljuk az épp klikkelt mező koordinátáját tartalmazó változókat - ezeket
                // a koordinátákat mező DIV eleméből olvassa ki, amit korábban a drawGameBoard
                // metódus hozott létre és látta el a megfelelő property-vel.
                const actualRow = element.dataset.row;
                const actualCol = element.dataset.col;
                
                // Lekérdezzük a "checkValidityOfMove" metódussal, hogy az aktuális lépés érvényes-e,
                // azaz nem foglalt-e már az adott mező.
                if(this.checkValidatityOfMove(actualRow, actualCol)) {

                    // Ha érvényes a lépés, akkor a kattintott mező megkapja a játékos kiválasztott
                    // bábujának képét háttérképként.
                    //element.style.backgroundImage = `url(${players[actualPlayer].figureUrl})`;
                    element.style.backgroundImage = `url(${players[actualPlayer].figureUrl})`;
                    element.style.backgroundSize = "contain";
                    
                    // A "gameBoardMatrix" globális tömbben bejegyezzük a lépést, azaz
                    // a tömb koordinátát reprezentáló tömbelem megkapja az aktuális játékos kódját.
                    gameBoardMatrix[parseInt(actualRow)][parseInt(actualCol)] = actualPlayer;
                    
                    // Ellenőrizzük, hogy az aktuális lépéssel létrejön-e bármely irányban
                    // 5 darab egyforma jel.
                    if(this.checkMoveToGoal(actualRow, actualCol, actualPlayer)) {

                        // Ha van győztes 5-ös sorozat, akkor meghívjuk a győzelmet kezelő metódust
                        this.gameWinner(players[actualPlayer].name);
                    } else {
                        // Ha nincs győzelem, akkor léptetünk a következő játékosra
                        if ( (parseInt(activePlayers[parseInt(actualPlayer)]) === parseInt(actualPlayer) && activePlayers[parseInt(actualPlayer)+1] !== undefined )) {
                            actualPlayer = parseInt(activePlayers[parseInt(actualPlayer)+1]);
                        } else {
                            actualPlayer = 0;
                        }

                        // Megjelenítjük a következő játékos kártyáját és üzenetben is ösztönözzük
                        // lépésre.
                        actualPlayerBox = document.querySelector('#player-game-' + actualPlayer);
                        clearBoxes();
                        actualPlayerBox.style.display = 'block';
                        this.printMessageFromString(`Kedves ${players[actualPlayer].name}, most te lépsz!`);
                    };
                };
            });
        });

        // A metódus meghívása törli a játéktérben megjelenő összes játékoskártya láthatóságát
        function clearBoxes() {
            const playerGameBoxes = document.querySelectorAll(".player-game-box");
            playerGameBoxes.forEach(pgBox => {
                pgBox.style.display = 'none';
            });
        }
    },

    // Ez a metódus írja ki az üzenet blokkba a paraméterként kapott sztringet.
    // A kiírás egy számítógépes gépelést utánoz. :)
    printMessageFromString: function(mes) {
        const mess = mes;
        let pos = 1;
        let interval = setInterval(printing, 15);

        function printing() {
            MESSAGE_BOX.innerHTML = mess.substring(0, pos) + "<span>\u25ae</span>";
            pos < mess.length ? pos++ : clearInterval(interval);
        }
    },

    // Ez a függvény ellenőrzi, hogy az aktuális lépés érvényes-e,
    // azaz üres-e a kívánt cella. Paraméterként megkapja az aktuális
    // lépés koordinátáját
    checkValidatityOfMove: function(row, col) {
        let response = gameBoardMatrix[ parseInt( row )] [ parseInt( col ) ] === null ? true : false;
        return response;
    },

    // A metódus ellenőrzi, hogy az aktuális lépés létrehoz-e a négy irányban
    // (vízszintesen, függőlegesen és a 2 átlóban) megszakítás nélküli ötös jelsorozatot,
    // azaz azt, hogy az adott játékos megnyerte-e a játékot.
    checkMoveToGoal: function(row, col, player) {

        // A segédváltozók inicializálása
        let pointCounterRow = 0;
        let pointCounterCol = 0;
        let pointDiagonal = 0;
        let coord = '';

        // Meghívjuk az átlók koordinátáit visszaadó metódust
        const diagonaleCoordsArray = this.findDiagonals(row, col);

        // A ciklus vizsgálja az adott sort és oszlopot
        // Ha van győzelem, akkor 'TRUE' értékkel tér vissza
        for( let i = 0; i < cols; i++) {
            pointCounterRow = gameBoardMatrix[parseInt(row)][ i ] === parseInt(player) ? pointCounterRow+1 : 0;
            pointCounterCol = gameBoardMatrix[i][ parseInt(col) ] === parseInt(player) ? pointCounterCol+1 : 0;
            if( pointCounterRow === 5 || pointCounterCol === 5 ) return true;
        }

        pointDiagonal = 0;

        // Kiértékeljük az átlós koordinátákat tartalmazó sztring tömböt
        // Ha van győzelem, akkor 'TRUE' értékkel tér vissza
        for(let i = 0; i <= 1; i++) {
            for (const item of diagonaleCoordsArray[i]) {
                coord = item.split(':');
                pointDiagonal = gameBoardMatrix[parseInt(coord[0])][ coord[1] ] === parseInt(player) ? pointDiagonal+1 : 0;
                if( pointDiagonal === 5 ) return true;
            };
        }

        // Ha a metódus eddig nem lépett ki, akkor nincs győzelem
        return false;
    },

    // Az átlós vizsgálathoz szükséges, az aktuális lépés által meghatározott
    // átlók celláinak koordinátáit határozza meg és teszi értékelhető sorrendbe és
    // ezt a sztring tömböt adja vissza eredményül.
    findDiagonals: function(row, col) {
        let diagRow = row;
        let diagCol = col;
        let leftTopToRightBottom = [];
        let leftBottomToRightTop = [];

        leftTopToRightBottom.push(`${diagRow}:${diagCol}`);
        leftBottomToRightTop.push(`${diagRow}:${diagCol}`);

        while( diagRow > 0 && diagCol > 0 ) {
            diagRow--;
            diagCol--;
            leftTopToRightBottom.unshift(`${diagRow}:${diagCol}`);
        }

        diagRow = row;
        diagCol = col;
        while( diagRow < rows -1 && diagCol < cols -1 ) {
            diagRow++;
            diagCol++;
            leftTopToRightBottom.push(`${diagRow}:${diagCol}`);
        }

        diagRow = row;
        diagCol = col;
        while( diagRow < rows -1 && diagCol > 0 ) {
            diagRow++;
            diagCol--;
            leftBottomToRightTop.unshift(`${diagRow}:${diagCol}`);
        }

        diagRow = row;
        diagCol = col;
        while( diagRow > 0 && diagCol < cols -1 ) {
            diagRow--;
            diagCol++;
            leftBottomToRightTop.push(`${diagRow}:${diagCol}`);
        }

        return [leftTopToRightBottom, leftBottomToRightTop];
    },
    
    // A győzelmet meghirdető üzenet elküldése az üzenettáblába
    gameWinner: function(player) {
        MESSAGE_BOX.innerHTML = `Kedves ${player}, megnyerted a játékot! :)`;
        this.generateAndShowWinnerEffect();
    },

    // A győzelmi effektus (konfetti eső) generálása és megjelenítése
    generateAndShowWinnerEffect: function() {
        KONFETTI_CONTAINER.style.display = 'block';
        KONFETTI_CONTAINER.style.width = GRID_CONTAINER.style.width;
        KONFETTI_CONTAINER.style.height = GRID_CONTAINER.style.height;

        function rndNumber() {
            return Math.floor( Math.random() * 256);
        }

        // Konfetti generálása
        for (let i = 0; i < 200; i++) {
            let konfetti = document.createElement('div');
            konfetti.className = 'konfetti';
            konfetti.style.left = Math.floor(Math.random() * 100) + '%';
            konfetti.style.top = Math.floor( Math.random() * -10) + 'px';
            konfetti.style.backgroundColor = `rgb( ${rndNumber()}, ${rndNumber()}, ${rndNumber()})`;
            konfetti.style.transform = 'rotateZ(' + Math.random() * 360 + 'deg)';
            konfetti.style.animationDuration = Math.random() * 2 + 1 + 's';
            konfetti.style.animationDelay = Math.random() * 2 + 's';

            KONFETTI_CONTAINER.appendChild(konfetti);
        }
    },

    // Pici feature, véletlengenerátor által, a fejlécben elhelyezett logó
    // és a játék címe alatt megjelenő amőba animáció metódusa. :)
    runAmoebaEffect: function() {
        const shape = document.querySelector('#shape');
        const radii = { top: 50, right: 50, bottom: 50, left: 50 }
        const dx = {top: [],right: [],bottom: [],left: []}
        const formatBorderRadius = (top, right, bottom, left) => {
            return `${top}% ${100-top}% ${100-bottom}% ${bottom}% / ${left}% ${right}% ${100-right}% ${100-left}%`
        }
        const updateBorderRadius = (top, right, bottom, left) => {
            shape.style.borderRadius = formatBorderRadius(top, right, bottom, left);
        }
        const random = (x) => 2 * x * (0.5 - Math.random());
        const smoothChange = (x, dx) => {
            if (dx.length > 40) dx.shift();
            dx.push(random(5) + (50 - x)/20);
            x = x + dx.reduce((a,b) => a+b)/dx.length;
            return [x, dx];
        }
        setInterval(() => {
            [radii.top, dx.top] = smoothChange(radii.top, dx.top);
            [radii.right, dx.right] = smoothChange(radii.right, dx.right);
            [radii.bottom, dx.bottom] = smoothChange(radii.bottom, dx.bottom);
            [radii.left, dx.left] = smoothChange(radii.left, dx.left);

            updateBorderRadius( radii.top, radii.right, radii.bottom, radii.left )
        }, 20 )
    },

    // Ez a metódus egy egyszerű router, ami a különféle funkciók megjelenítéséért felel
    gameRouting: function(target = "to-home") {
        let routingFlag = target;
        const loginLayer = document.querySelector('#login')
        const setupLayer = document.querySelector('#setup')
        const gameLayer = document.querySelector('#game')
        const allButtons = document.querySelectorAll('.buttons');

        allButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                routingFlag = button.value;
                route();
            });
        });

        const route = function() {
            switch(routingFlag) {
                case 'to-setup':
                    loginLayer.classList.add('hidden');
                    setupLayer.classList.remove('hidden');
                    gameLayer.classList.add('hidden');
                    gameHandler.setupGameProperties();
                break;
                case 'to-game':
                    loginLayer.classList.add('hidden');
                    setupLayer.classList.add('hidden');
                    gameLayer.classList.remove('hidden');
                    //gameHandler.initGame();
                    gameHandler.drawGameBoard();
                break;
                case 'to-new-game':
                    loginLayer.classList.add('hidden');
                    setupLayer.classList.add('hidden');
                    gameLayer.classList.remove('hidden');
                    //gameHandler.initGame();
                    gameHandler.drawGameBoard();
                break;                
                case 'to-home':
                default:
                    loginLayer.classList.remove('hidden');
                    setupLayer.classList.add('hidden');
                    gameLayer.classList.add('hidden');
                    
            }        
        }
        
    },
}

// A kezdő metódus meghívása
gameHandler.gameRouting();

// ...és ha már van ilyen, hadd fusson az amőba háttér is. :))
gameHandler.runAmoebaEffect();
