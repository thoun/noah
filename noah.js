function slideToObjectAndAttach(object, destinationId, posX, posY) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left + (posX !== null && posX !== void 0 ? posX : 0);
        var deltaY = destinationCR.top - objectCR.top + (posY !== null && posY !== void 0 ? posY : 0);
        //object.id == 'tile98' && console.log(object, destination, objectCR, destinationCR, destinationCR.left - objectCR.left, );
        object.style.transition = "transform 0.5s ease-in";
        object.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
        var transitionend = function () {
            object.style.top = posY !== undefined ? posY + "px" : 'unset';
            object.style.left = posX !== undefined ? posX + "px" : 'unset';
            object.style.position = (posX !== undefined || posY !== undefined) ? 'absolute' : 'relative';
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
            object.removeEventListener('transitionend', transitionend);
            resolve(true);
        };
        object.addEventListener('transitionend', transitionend);
    });
}
/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
var ANIMALS_TYPES = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
];
var BONUS_ANIMALS_TYPES = [
    20, 21
];
var ANIMALS_WITH_TRAITS = [
    1, 2, 3, 4, 5
];
var BONUS_ANIMALS_WITH_TRAITS = [
    20, 21
];
var ANIMAL_WIDTH = 132;
var ANIMAL_HEIGHT = 185;
var FERRY_WIDTH = ANIMAL_HEIGHT;
var FERRY_HEIGHT = ANIMAL_WIDTH;
function getUniqueId(animal) {
    return animal.type * 10 + (animal.gender || 1);
}
function setupAnimalCards(animalStock) {
    var cardsurl = g_gamethemeurl + "img/cards.jpg";
    ANIMALS_TYPES.forEach(function (animalType, index) { return [1, 2].forEach(function (gender) {
        animalStock.addItemType(animalType * 10 + gender, animalType, cardsurl, index * 2 + gender);
    }); });
    BONUS_ANIMALS_TYPES.forEach(function (animalType, index) { return [1, 2].forEach(function (gender) {
        animalStock.addItemType(animalType * 10 + gender, animalType, cardsurl, 24 + index * 2 + gender);
    }); });
}
function getAnimalTooltip(type) {
    switch (type) {
        case 1: return _("<strong>The Snail:</strong> its small mass makes it a highly sought-after animal. Moreover, since the snail is an hermaphrodite, <strong>you choose whether it’s a male or female</strong> when you play it on a ferry. On the example to the left, you can see a male snail, as the blue side is upwards.");
        case 2: return _("<strong>The Giraffe:</strong> thanks to its long neck, the giraffe is horribly indiscrete. When you play a giraffe, <strong>look at the cards of the opponent of your choice</strong> (generally you’ll choose the opponent to your left).");
        case 3: return _("<strong>The Mule:</strong> always hard-headed, it refuses to move! When you play a mule, <strong>you will not move Noah!</strong> The next player will have to play again on this ferry.");
        case 4: return _("<strong>The Lion:</strong> how can we refuse anything to the king of animals? When you play a lion, <strong>draw a card from the hand of the opponent of your choice.</strong> Then, give that opponent a card from your hand (you can return the card you have just taken, if you want).");
        case 5: return _("<strong>The Woodpecker:</strong> this bird has got to be the stupidest animal in all Creation. While its very life is being saved, that idiot cannot help but give in to its vice: drilling holes in the ferry’s wooden hull! On that ferry, <strong>the total maximum weight goes from 21 to 13!</strong> It’s thus not possible to load a woodpecker on a ferry whose weight is already over 13. When a woodpecker is present, reaching 13 makes the ferry leave and grants the same advantages as a regular departure.");
        case 20: return _("<strong>The Frog:</strong> if you choose to play the frogs, you must remove the snails from your game.") +
            "<br><br>" +
            _("<strong>Larger than the cow?</strong> When added to the ferry, a frog can take a value of 1 to 5 based on the player’s choice. The only condition is that this move allows for a ferry to leave. Otherwise, the value is 1.");
        case 21: return _("<strong>The crocodile:</strong> If you choose to play the crocodile , you must remove from your game the donkeys.") +
            "<br><br>" +
            _("<strong>Crocodile Tears:</strong> The player who plays a crocodile must move back two squares on the scoring track. It is not possible to have a negative score.") +
            "<br><br>" +
            _("<strong>The crocodile’s teeth:</strong> When the crocodile is added to the ferry, the crocodile frightens another animal. Thus, the first animal to be placed on the ferry flees... Choose an opponent who must add it to their hand. It is only then that the weight limit in the ark is verified.");
    }
    return null;
}
function setupAnimalCard(game, cardDiv, uniqueId) {
    var tooltip = getAnimalTooltip(Math.floor(uniqueId / 10));
    if (tooltip) {
        game.addTooltipHtml(cardDiv.id, tooltip);
    }
}
function formatTextIcons(rawText) {
    return rawText
        .replace(/\[tear\]/ig, '<span class="icon tear"></span>');
}
var FerrySpot = /** @class */ (function () {
    function FerrySpot(game, position, ferry) {
        var _this = this;
        this.game = game;
        this.position = position;
        this.animals = ferry.animals;
        var html = "\n        <div id=\"ferry-spot-" + position + "\" class=\"ferry-spot position" + position + "\">\n            <div id=\"ferry-spot-" + position + "-ferry-card\" class=\"stockitem ferry-card\"></div>            \n        ";
        this.animals.forEach(function (animal, index) { return html += "\n            <div id=\"ferry-spot-" + position + "-animal" + animal.id + "\" class=\"animal-card\" style=\"top : " + (100 + index * 30) + "px; background-position: " + _this.getBackgroundPosition(animal) + "\"></div>\n        "; });
        html += "</div>";
        dojo.place(html, 'center-board');
    }
    FerrySpot.prototype.getBackgroundPosition = function (animal) {
        var imagePosition = animal.type >= 20 ?
            24 + (animal.type - 20) * 2 + animal.gender :
            (animal.type - 1) * 2 + animal.gender;
        var image_items_per_row = 10;
        var row = Math.floor(imagePosition / image_items_per_row);
        var xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
        var yBackgroundPercent = row * 100;
        return "-" + xBackgroundPercent + "% -" + yBackgroundPercent + "%";
    };
    FerrySpot.prototype.addAnimal = function (animal) {
        var html = "<div id=\"ferry-spot-" + this.position + "-animal" + animal.id + "\" class=\"animal-card\" style=\"top : " + (100 + this.animals.length * 30) + "px; background-position: " + this.getBackgroundPosition(animal) + "\"></div>";
        this.animals.push(animal);
        dojo.place(html, "ferry-spot-" + this.position);
    };
    FerrySpot.prototype.removeAnimals = function () {
        var _this = this;
        this.animals.forEach(function (animal) { return dojo.destroy("ferry-spot-" + _this.position + "-animal" + animal.id); });
        this.animals = [];
    };
    FerrySpot.prototype.departure = function (newFerry) {
        var _this = this;
        // TODO animate
        this.animals.forEach(function (animal) { return dojo.destroy("ferry-spot-" + _this.position + "-animal" + animal.id); });
        this.animals = [];
        if (!newFerry) {
            dojo.addClass("ferry-spot-" + this.position + "-ferry-card", 'empty');
        }
    };
    return FerrySpot;
}());
var NOAH_RADIUS = 150;
var MAX_SCORE = 26;
var Table = /** @class */ (function () {
    function Table(game, players, ferries, noahPosition) {
        var _this = this;
        this.game = game;
        this.noahPosition = noahPosition;
        this.spots = [];
        this.noahLastPosition = 0;
        var html = '';
        // points
        players.forEach(function (player) {
            return html += "<div id=\"player-" + player.id + "-point-marker\" class=\"point-marker\" style=\"background-color: #" + player.color + ";\"></div>";
        });
        dojo.place(html, 'center-board');
        players.forEach(function (player) { return _this.setPoints(Number(player.id), Number(player.score), true); });
        var _loop_1 = function (i) {
            this_1.spots.push(new FerrySpot(game, i, ferries[i]));
            dojo.place("<div id=\"noah-spot-" + i + "\" class=\"noah-spot position" + i + "\"></div>", 'center-board');
            document.getElementById("noah-spot-" + i).addEventListener('click', function () { return _this.game.moveNoah(i); });
        };
        var this_1 = this;
        // ferries
        for (var i = 0; i < 5; i++) {
            _loop_1(i);
        }
        // noah
        this.noahLastPosition = noahPosition;
        dojo.place("<div id=\"noah\" class=\"noah-spot\" style=\"transform: " + this.getNoahStyle(noahPosition) + "\"></div>", 'center-board');
        this.updateMargins();
        // TODO TEMP
        document.getElementById('noah').addEventListener('click', function (e) { return _this.noahMoved((5 + _this.noahPosition + (e.offsetX > 60 ? -1 : 1)) % 5); });
    }
    Table.prototype.getNoahStyle = function (noahPosition) {
        var noahLastPositionMod = this.noahLastPosition % 5;
        if (Math.abs(noahLastPositionMod - noahPosition) > 2) {
            noahLastPositionMod -= 5;
        }
        var spotsToGoUp = (noahPosition - noahLastPositionMod) % 5;
        var newPosition = spotsToGoUp > 2 ?
            this.noahLastPosition + spotsToGoUp - 5 :
            this.noahLastPosition + spotsToGoUp;
        this.noahLastPosition = newPosition;
        return "rotate(" + 72 * newPosition + "deg) translateY(180px)";
    };
    Table.prototype.getPointsCoordinates = function (points) {
        var angle = (Math.max(1, Math.min(points, MAX_SCORE)) / MAX_SCORE) * Math.PI * 2; // in radians
        var left = NOAH_RADIUS * Math.sin(angle);
        var top = NOAH_RADIUS * Math.cos(angle);
        if (points === 0) {
            top += 50;
        }
        return [left, top];
    };
    Table.prototype.noahMoved = function (position) {
        console.log('noahMoved', position);
        this.noahPosition = position;
        document.getElementById('noah').style.transform = this.getNoahStyle(position);
    };
    Table.prototype.setPoints = function (playerId, points, firstPosition) {
        /*const equality = opponentScore === points;
        const playerShouldShift = equality && playerId > opponentId;*/
        if (firstPosition === void 0) { firstPosition = false; }
        var markerDiv = document.getElementById("player-" + playerId + "-point-marker");
        var coordinates = this.getPointsCoordinates(points);
        var left = coordinates[0];
        var top = coordinates[1];
        /*if (playerShouldShift) {
            top -= 5;
            left -= 5;
        }*/
        if (firstPosition) {
            markerDiv.style.top = top + "px";
            markerDiv.style.left = left + "px";
        }
        else {
            dojo.fx.slideTo({
                node: markerDiv,
                top: top,
                left: left,
                delay: 0,
                duration: ANIMATION_MS,
                easing: dojo.fx.easing.cubicInOut,
                unit: "px"
            }).play();
        }
    };
    Table.prototype.updateMargins = function () {
        var board = document.getElementById('center-board');
        var boardBR = board.getBoundingClientRect();
        var topMargin = 0;
        var bottomMargin = 0;
        var sideMargin = 0;
        this.spots.forEach(function (spot) {
            var spotDiv = document.getElementById("ferry-spot-" + spot.position);
            spotDiv.style.height = (spot.animals.length ? 100 + 185 + ((spot.animals.length - 1) * 30) : 132) + "px";
            var spotBR = spotDiv.getBoundingClientRect();
            if (spotBR.y < boardBR.y - topMargin) {
                topMargin = boardBR.y - spotBR.y;
            }
            if (spotBR.y + spotBR.height > boardBR.y + boardBR.height + bottomMargin) {
                bottomMargin = (spotBR.y + spotBR.height) - (boardBR.y + boardBR.height);
            }
            if (spotBR.x < boardBR.x - sideMargin) {
                sideMargin = boardBR.x - spotBR.x;
            }
            if (spotBR.x + spotBR.width > boardBR.x + boardBR.width + sideMargin) {
                sideMargin = (spotBR.x + spotBR.width) - (boardBR.x + boardBR.width);
            }
        });
        board.style.marginTop = topMargin + "px";
        board.style.marginBottom = bottomMargin + "px";
        board.style.marginLeft = sideMargin + "px";
        board.style.marginRight = sideMargin + "px";
    };
    Table.prototype.addAnimal = function (animal) {
        this.spots[this.noahPosition].addAnimal(animal);
    };
    Table.prototype.removeAnimals = function () {
        this.spots[this.noahPosition].removeAnimals();
    };
    Table.prototype.departure = function (newFerry, remainingFerries) {
        this.spots[this.noahPosition].departure(newFerry);
    };
    return Table;
}());
var ANIMATION_MS = 500;
var ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZOOM_LEVELS_MARGIN = [-300, -166, -100, -60, -33, -14, 0];
var LOCAL_STORAGE_ZOOM_KEY = 'Noah-zoom';
var isDebug = window.location.host == 'studio.boardgamearena.com';
var log = isDebug ? console.log.bind(window.console) : function () { };
var Noah = /** @class */ (function () {
    function Noah() {
        this.zoom = 1;
        var zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
        }
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Noah.prototype.setup = function (gamedatas) {
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        //this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handAnimals);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.ferries, gamedatas.noahPosition);
        this.ferriesCounter = new ebg.counter();
        this.ferriesCounter.create('remaining-ferry-counter');
        this.setRemainingFerries(gamedatas.remainingFerries);
        this.addHelp();
        this.setupNotifications();
        document.getElementById('zoom-out').addEventListener('click', function () { return _this.zoomOut(); });
        document.getElementById('zoom-in').addEventListener('click', function () { return _this.zoomIn(); });
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Noah.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'loadAnimal':
                var allDisabled = !args.args.selectableAnimals.length;
                this.setGamestateDescription(allDisabled ? 'impossible' : '');
                this.onEnteringStateLoadAnimal(args.args);
                break;
            case 'moveNoah':
                this.onEnteringStateMoveNoah(args.args);
                break;
        }
    };
    Noah.prototype.setGamestateDescription = function (property) {
        if (property === void 0) { property = ''; }
        var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = "" + originalState['description' + property];
        this.gamedatas.gamestate.descriptionmyturn = "" + originalState['descriptionmyturn' + property];
        this.updatePageTitle();
    };
    Noah.prototype.onEnteringStateLoadAnimal = function (args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            this.playerHand.items
                .filter(function (item) { return !args.selectableAnimals.some(function (animal) { return animal.id === Number(item.id); }); })
                .forEach(function (item) { return dojo.addClass(_this.playerHand.container_div.id + "_item_" + item.id, 'disabled'); });
            this.playerHand.setSelectionMode(1);
        }
    };
    Noah.prototype.onEnteringStateMoveNoah = function (args) {
        if (this.isCurrentPlayerActive()) {
            args.possiblePositions.forEach(function (position) { return dojo.addClass("noah-spot-" + position, 'selectable'); });
        }
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Noah.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'loadAnimal':
                this.onLeavingStateLoadAnimal();
                break;
            case 'moveNoah':
                this.onLeavingStateMoveNoah();
                break;
        }
    };
    Noah.prototype.onLeavingStateLoadAnimal = function () {
        this.playerHand.setSelectionMode(0);
        dojo.query('.stockitem').removeClass('disabled');
    };
    Noah.prototype.onLeavingStateMoveNoah = function () {
        dojo.query('.noah-spot').removeClass('selectable');
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Noah.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'loadAnimal':
                    var loadAnimalArgs = args;
                    if (!loadAnimalArgs.selectableAnimals.length) {
                        this.addActionButton('takeAllAnimals-button', _('Take all animals'), function () { return _this.takeAllAnimals(); }, null, null, 'red');
                    }
                    break;
                case 'chooseGender':
                    this.addActionButton('chooseGender-male-button', _('Male'), function () { return _this.setGender(1); });
                    this.addActionButton('chooseGender-female-button', _('Female'), function () { return _this.setGender(2); });
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Noah.prototype.setZoom = function (zoom) {
        if (zoom === void 0) { zoom = 1; }
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, '' + this.zoom);
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);
        var div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        }
        else {
            div.style.transform = "scale(" + zoom + ")";
            div.style.margin = "0 " + ZOOM_LEVELS_MARGIN[newIndex] + "% " + (1 - zoom) * -100 + "% 0";
        }
        this.playerHand.updateDisplay();
        document.getElementById('zoom-wrapper').style.height = div.getBoundingClientRect().height + "px";
    };
    Noah.prototype.zoomIn = function () {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    Noah.prototype.zoomOut = function () {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    Noah.prototype.setHand = function (animals) {
        var _this = this;
        this.playerHand = new ebg.stock();
        this.playerHand.create(this, $('my-animals'), ANIMAL_WIDTH, ANIMAL_HEIGHT);
        this.playerHand.setSelectionMode(1);
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.selectionClass = 'selected';
        this.playerHand.centerItems = true;
        this.playerHand.image_items_per_row = 10;
        this.playerHand.onItemCreate = function (cardDiv, type) { return setupAnimalCard(_this, cardDiv, type); };
        dojo.connect(this.playerHand, 'onChangeSelection', this, function () { return _this.onPlayerHandSelectionChanged(_this.playerHand.getSelectedItems()); });
        setupAnimalCards(this.playerHand);
        animals.forEach(function (animal) { return _this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id); });
    };
    Noah.prototype.onPlayerHandSelectionChanged = function (items) {
        if (items.length == 1) {
            var card = items[0];
            this.loadAnimal(card.id);
        }
    };
    Noah.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Noah.prototype.getOpponentId = function (playerId) {
        return Number(Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) != playerId; }).id);
    };
    Noah.prototype.getPlayerScore = function (playerId) {
        var _a, _b;
        return (_b = (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.getValue()) !== null && _b !== void 0 ? _b : Number(this.gamedatas.players[playerId].score);
    };
    Noah.prototype.loadAnimal = function (id) {
        if (!this.checkAction('loadAnimal')) {
            return;
        }
        this.takeAction('loadAnimal', {
            id: id
        });
    };
    Noah.prototype.takeAllAnimals = function () {
        if (!this.checkAction('takeAllAnimals')) {
            return;
        }
        this.takeAction('takeAllAnimals');
    };
    Noah.prototype.setGender = function (gender) {
        if (!this.checkAction('setGender')) {
            return;
        }
        this.takeAction('setGender', {
            gender: gender
        });
    };
    Noah.prototype.moveNoah = function (destination) {
        if (!this.checkAction('moveNoah')) {
            return;
        }
        this.takeAction('moveNoah', {
            destination: destination
        });
    };
    Noah.prototype.giveCards = function (id, giveCardsTo) {
        if (!this.checkAction('giveCards')) {
            return;
        }
        var base64 = btoa(JSON.stringify(giveCardsTo));
        this.takeAction('giveCards', {
            giveCardsTo: base64
        });
    };
    Noah.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/noah/noah/" + action + ".html", data, this, function () { });
    };
    Noah.prototype.setPoints = function (playerId, points) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(points);
        this.table.setPoints(playerId, points);
    };
    Noah.prototype.addHelp = function () {
        var _this = this;
        dojo.place("<button id=\"noah-help-button\">?</button>", 'left-side');
        dojo.connect($('noah-help-button'), 'onclick', this, function () { return _this.showHelp(); });
    };
    Noah.prototype.showHelp = function () {
        if (!this.helpDialog) {
            this.helpDialog = new ebg.popindialog();
            this.helpDialog.create('noahHelpDialog');
            this.helpDialog.setTitle(_("Cards help"));
            var html = "\n            <div id=\"help-popin\">\n                <h1>" + _("Animal traits") + "</h1>\n                <div class=\"help-section help-animals\">\n                    <table>";
            ANIMALS_WITH_TRAITS.forEach(function (number) { return html += "<tr><td><div id=\"animal" + number + "\" class=\"animal\"></div></td><td>" + getAnimalTooltip(number) + "</td></tr>"; });
            html += "</table>\n                </div>\n                <h1>" + _("Bonus animal traits") + "</h1>\n                <div class=\"help-section help-animals\">\n                    <table>";
            BONUS_ANIMALS_WITH_TRAITS.forEach(function (number) { return html += "<tr><td><div id=\"animal" + number + "\" class=\"animal\"></div></td><td>" + getAnimalTooltip(number) + "</td></tr>"; });
            html += "</table>\n                </div>\n            </div>";
            // Show the dialog
            this.helpDialog.setContent(html);
        }
        this.helpDialog.show();
    };
    Noah.prototype.setRemainingFerries = function (remainingFerries) {
        this.ferriesCounter.setValue(remainingFerries);
        var visibility = remainingFerries > 0 ? 'visible' : 'hidden';
        document.getElementById('ferry-deck').style.visibility = visibility;
        document.getElementById('remaining-ferry-counter').style.visibility = visibility;
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your noah.game.php file.

    */
    Noah.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['animalLoaded', ANIMATION_MS],
            ['ferryAnimalsTaken', ANIMATION_MS],
            ['noahMoved', ANIMATION_MS],
            ['departure', ANIMATION_MS],
            ['points', 1],
            ['newRound', ANIMATION_MS],
            ['newHand', 1],
            ['animalGiven', ANIMATION_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Noah.prototype.notif_points = function (notif) {
        this.setPoints(notif.args.playerId, notif.args.points);
        this.table.setPoints(notif.args.playerId, notif.args.points);
    };
    Noah.prototype.notif_animalLoaded = function (notif) {
        this.playerHand.removeFromStockById('' + notif.args.animal.id);
        this.table.addAnimal(notif.args.animal);
    };
    Noah.prototype.notif_ferryAnimalsTaken = function (notif) {
        var _this = this;
        if (this.getPlayerId() == notif.args.playerId) {
            notif.args.animals.forEach(function (animal) { return _this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id); });
        }
        this.table.removeAnimals();
    };
    Noah.prototype.notif_noahMoved = function (notif) {
        this.table.noahMoved(notif.args.position);
    };
    Noah.prototype.notif_newRound = function (notif) {
        // TODO
    };
    Noah.prototype.notif_newHand = function (notif) {
        // TODO
    };
    Noah.prototype.notif_animalGiven = function (notif) {
        // TODO
    };
    Noah.prototype.notif_departure = function (notif) {
        this.table.departure(notif.args.newFerry, notif.args.remainingFerries);
        this.setRemainingFerries(notif.args.remainingFerries);
    };
    Noah.prototype.getAnimalColor = function (gender) {
        switch (gender) {
            // blue
            case 1: return '#16bee6';
            case 2: return '#e97aa3';
            default: return 'black';
        }
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Noah.prototype.format_string_recursive = function (log, args) {
        var _a, _b;
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (typeof args.animalName == 'string' && args.animalName[0] != '<' /* && typeof args.animal == 'object'*/) {
                    args.animalName = "<strong style=\"color: " + this.getAnimalColor((_b = (_a = args.animal) === null || _a === void 0 ? void 0 : _a.gender) !== null && _b !== void 0 ? _b : 'black') + "\">" + args.animalName + "</strong>";
                }
            }
            if (log == '${player_name} loads animal ${animalName}') {
                console.log(log, args);
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return Noah;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.noah", ebg.core.gamegui, new Noah());
});
