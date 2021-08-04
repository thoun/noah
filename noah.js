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
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10
];
var ANIMALS_WITH_TRAITS = [
    1, 2, 3, 4, 5
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
    ANIMALS_TYPES.forEach(function (cardId, index) { return [1, 2].forEach(function (gender) {
        return animalStock.addItemType(cardId * 10 + gender, cardId, cardsurl, index + gender);
    }); });
}
function getAnimalTooltip(type) {
    switch (type) {
        case 1: return _("Earn 1 wood for each machine on the Bric-a-brac with wood in its production zone, including this one.");
        case 2: return _("Earn 1 charcoalium for each machine on the Bric-a-brac with charcoalium in its production zone, including this one.");
        case 3: return _("Earn 1 copper for each machine on the Bric-a-brac with copper in its production zone, including this one.");
        case 4: return _("Earn 1 crystal for each machine on the Bric-a-brac with crystal in its production zone, including this one.");
        case 5: return formatTextIcons(_("Choose a type of resource ([resource1]|[resource2]|[resource3]). Earn 1 resource of this type for each machine on the Bric-a-brac with the [resource9] symbol in its production zone, including this one."));
    }
    return null;
}
function setupAnimalCard(game, cardDiv, type) {
    game.addTooltipHtml(cardDiv.id, getAnimalTooltip(type));
}
function formatTextIcons(rawText) {
    return rawText
        .replace(/\[tear\]/ig, '<span class="icon tear"></span>');
}
var FerrySpot = /** @class */ (function () {
    function FerrySpot(game, position, ferry) {
        this.game = game;
        this.position = position;
        this.animals = ferry.animals;
        var html = "\n        <div id=\"ferry-spot-" + position + "\" class=\"ferry-spot position" + position + "\">\n            <div class=\"stockitem ferry-card\"></div>\n            \n        ";
        this.animals.forEach(function (animal, index) { return html += "\n            <div id=\"ferry-spot-" + position + "-animal" + index + "\" class=\"animal-card\" style=\"top : " + (100 + index * 30) + "px; background-position: -100% 0%;\"></div>\n        "; });
        html += "</div>";
        dojo.place(html, 'center-board');
    }
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
        var html = '';
        // points
        players.forEach(function (player) {
            return html += "<div id=\"player-" + player.id + "-point-marker\" class=\"point-marker\" style=\"background-color: #" + player.color + ";\"></div>";
        });
        dojo.place(html, 'center-board');
        players.forEach(function (player) { return _this.setPoints(Number(player.id), Number(player.score), true); });
        // noah
        var noahCoordinates = this.getNoahCoordinates(noahPosition);
        html = "<div id=\"noah\" style=\"left: " + noahCoordinates[0] + "px; top: " + noahCoordinates[1] + "px;\"></div>";
        dojo.place(html, 'center-board');
        for (var i = 0; i < 5; i++) {
            this.spots.push(new FerrySpot(game, i, ferries[i]));
        }
        this.updateMargins();
        // TODO TEMP
        document.getElementById('noah').addEventListener('click', function () { return _this.noahMoved(_this.noahPosition + 1); });
    }
    Table.prototype.getPointsCoordinates = function (points) {
        var angle = (Math.max(1, Math.min(points, MAX_SCORE)) / MAX_SCORE) * Math.PI * 2; // in radians
        var left = NOAH_RADIUS * Math.sin(angle);
        var top = NOAH_RADIUS * Math.cos(angle);
        if (points === 0) {
            top += 50;
        }
        return [left, top];
    };
    Table.prototype.getNoahCoordinates = function (position) {
        var angle = (position / 5) * Math.PI * 2; // in radians
        var left = 233 + NOAH_RADIUS * Math.sin(angle);
        var top = 233 + NOAH_RADIUS * Math.cos(angle);
        return [left, top];
    };
    Table.prototype.noahMoved = function (position) {
        this.noahPosition = position;
        var noahCoordinates = this.getNoahCoordinates(position);
        dojo.fx.slideTo({
            node: document.getElementById("noah"),
            left: noahCoordinates[0],
            top: noahCoordinates[1],
            delay: 0,
            duration: ANIMATION_MS,
            easing: dojo.fx.easing.cubicInOut,
            unit: "px"
        }).play();
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
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Noah.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'loadAnimal':
                this.onLeavingLoadAnimal();
        }
    };
    Noah.prototype.onLeavingLoadAnimal = function () {
        this.playerHand.setSelectionMode(0);
        dojo.query('.stockitem').removeClass('disabled');
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Noah.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
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
    /*private createPlayerPanels(gamedatas: NoahGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);

            // charcoalium & resources counters
            dojo.place(`<div class="counters">
                <div id="charcoalium-counter-wrapper-${player.id}" class="charcoalium-counter">
                    <div class="icon charcoalium"></div>
                    <span id="charcoalium-counter-${player.id}"></span>
                </div>
            </div>
            <div class="counters">
                <div id="wood-counter-wrapper-${player.id}" class="wood-counter">
                    <div class="icon wood"></div>
                    <span id="wood-counter-${player.id}"></span>
                </div>
                <div id="copper-counter-wrapper-${player.id}" class="copper-counter">
                    <div class="icon copper"></div>
                    <span id="copper-counter-${player.id}"></span>
                </div>
                <div id="crystal-counter-wrapper-${player.id}" class="crystal-counter">
                    <div class="icon crystal"></div>
                    <span id="crystal-counter-${player.id}"></span>
                </div>
            </div>`, `player_board_${player.id}`);

            const charcoaliumCounter = new ebg.counter();
            charcoaliumCounter.create(`charcoalium-counter-${playerId}`);
            charcoaliumCounter.setValue(player.resources[0].length);
            this.charcoaliumCounters[playerId] = charcoaliumCounter;

            const woodCounter = new ebg.counter();
            woodCounter.create(`wood-counter-${playerId}`);
            woodCounter.setValue(player.resources[1].length);
            this.woodCounters[playerId] = woodCounter;

            const copperCounter = new ebg.counter();
            copperCounter.create(`copper-counter-${playerId}`);
            copperCounter.setValue(player.resources[2].length);
            this.copperCounters[playerId] = copperCounter;

            const crystalCounter = new ebg.counter();
            crystalCounter.create(`crystal-counter-${playerId}`);
            crystalCounter.setValue(player.resources[3].length);
            this.crystalCounters[playerId] = crystalCounter;

            if (player.playerNo == 1) {
                dojo.place(`<div id="player-icon-first-player" class="player-icon first-player"></div>`, `player_board_${player.id}`);
                (this as any).addTooltipHtml('player-icon-first-player', _("First player"));
            }
        });

        (this as any).addTooltipHtmlToClass('charcoalium-counter', _("Charcoalium"));
        (this as any).addTooltipHtmlToClass('wood-counter', _("Wood"));
        (this as any).addTooltipHtmlToClass('copper-counter', _("Copper"));
        (this as any).addTooltipHtmlToClass('crystal-counter', _("Crystal"));
    }*/
    Noah.prototype.loadAnimal = function (id) {
        if (!this.checkAction('loadAnimal')) {
            return;
        }
        this.takeAction('loadAnimal', {
            id: id
        });
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
            var html = "<div id=\"help-popin\">\n                <h1>" + _("Animal traits") + "</h1>\n                <div id=\"help-animals\" class=\"help-section\">\n                    <table>";
            ANIMALS_WITH_TRAITS.forEach(function (number, index) { return html += "<tr><td><div id=\"animal" + index + "\" class=\"animal\"></div></td><td>" + getAnimalTooltip(number) + "</td></tr>"; });
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
        // TODO
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
        // TODO
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
