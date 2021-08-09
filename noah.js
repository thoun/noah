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
var CARD_OVERLAP = 30;
var FIRST_ANIMAL_SHIFT = 100;
var FerrySpot = /** @class */ (function () {
    function FerrySpot(game, position, ferry) {
        var _this = this;
        this.game = game;
        this.position = position;
        this.animals = [];
        this.empty = false;
        var html = "\n        <div id=\"ferry-spot-" + position + "\" class=\"ferry-spot position" + position + "\">\n            <div id=\"ferry-spot-" + position + "-ferry-card\" class=\"stockitem ferry-card\"></div>\n            <div id=\"ferry-spot-" + position + "-weight-indicator\" class=\"weight-indicator remaining-counter\"></div>         \n        ";
        html += "</div>";
        dojo.place(html, 'center-board');
        if (ferry) {
            ferry.animals.forEach(function (animal) { return _this.addAnimal(animal); });
        }
        else {
            this.empty = true;
        }
        this.updateCounter();
    }
    FerrySpot.prototype.setActive = function (active) {
        dojo.toggleClass("ferry-spot-" + this.position, 'active', active);
    };
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
        var html = "<div id=\"ferry-spot-" + this.position + "-animal" + animal.id + "\" class=\"animal-card\" style=\"top: " + (FIRST_ANIMAL_SHIFT + this.animals.length * CARD_OVERLAP) + "px; background-position: " + this.getBackgroundPosition(animal) + "\"></div>";
        this.animals.push(animal);
        dojo.place(html, "ferry-spot-" + this.position);
        this.updateCounter();
    };
    FerrySpot.prototype.removeAnimals = function () {
        var _this = this;
        this.animals.forEach(function (animal) { return dojo.destroy("ferry-spot-" + _this.position + "-animal" + animal.id); });
        this.animals = [];
        this.updateCounter();
    };
    FerrySpot.prototype.removeFirstAnimalFromFerry = function () {
        var _this = this;
        if (this.animals.length) {
            dojo.destroy("ferry-spot-" + this.position + "-animal" + this.animals.shift().id);
            this.animals.forEach(function (animal, index) { return document.getElementById("ferry-spot-" + _this.position + "-animal" + animal.id).style.top = FIRST_ANIMAL_SHIFT + index * CARD_OVERLAP + "px"; });
        }
    };
    FerrySpot.prototype.departure = function (newFerry) {
        var _this = this;
        // TODO animate
        this.animals.forEach(function (animal) { return dojo.destroy("ferry-spot-" + _this.position + "-animal" + animal.id); });
        this.animals = [];
        if (!newFerry) {
            this.empty = true;
            dojo.addClass("ferry-spot-" + this.position + "-ferry-card", 'empty');
        }
        this.updateCounter();
    };
    FerrySpot.prototype.updateCounter = function () {
        var text = '';
        if (!this.empty) {
            text = this.animals.reduce(function (sum, animal) { return sum + animal.weight; }, 0) + " / " + (this.animals.some(function (animal) { return animal.power == 5; }) ? 13 : 21);
        }
        document.getElementById("ferry-spot-" + this.position + "-weight-indicator").innerHTML = text;
    };
    FerrySpot.prototype.newRound = function (ferry) {
        var _this = this;
        this.empty = false;
        dojo.removeClass("ferry-spot-" + this.position + "-ferry-card", 'empty');
        this.removeAnimals();
        ferry.animals.forEach(function (animal) { return _this.addAnimal(animal); });
        this.updateCounter();
    };
    return FerrySpot;
}());
var NOAH_RADIUS = 191;
var MAX_SCORE = 26;
var Table = /** @class */ (function () {
    function Table(game, players, ferries, noahPosition, remainingFerries) {
        var _this = this;
        this.game = game;
        this.noahPosition = noahPosition;
        this.spots = [];
        this.noahLastPosition = 0;
        var html = '';
        // points
        if (!game.gamedatas.solo) {
            players.forEach(function (player) {
                return html += "<div id=\"player-" + player.id + "-point-marker\" class=\"point-marker\" style=\"background-color: #" + player.color + ";\"></div>";
            });
            dojo.place(html, 'center-board');
            players.forEach(function (player) { return _this.setPoints(Number(player.id), Number(player.score), true); });
        }
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
        this.ferriesCounter = new ebg.counter();
        this.ferriesCounter.create('remaining-ferry-counter');
        this.setRemainingFerries(remainingFerries);
        // noah
        this.noahLastPosition = noahPosition;
        dojo.place("<div id=\"noah\" class=\"noah-spot\" style=\"transform: " + this.getNoahStyle(noahPosition) + "\"></div>", 'center-board');
        this.spots[noahPosition].setActive(true);
        this.updateMargins();
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
        return "rotate(" + (72 * newPosition + 90) + "deg) translateY(50px)";
    };
    Table.prototype.getPointsCoordinates = function (points) {
        var angle = (Math.min((points - 1), MAX_SCORE) / MAX_SCORE) * Math.PI * 2; // in radians
        var left = NOAH_RADIUS * Math.sin(angle);
        var top = -NOAH_RADIUS * Math.cos(angle);
        return [211 + left, 213 + top];
    };
    Table.prototype.noahMoved = function (position) {
        this.noahPosition = position;
        document.getElementById('noah').style.transform = this.getNoahStyle(position);
        this.spots.forEach(function (spot, index) { return spot.setActive(index == position); });
    };
    Table.prototype.setPoints = function (playerId, points, firstPosition) {
        if (firstPosition === void 0) { firstPosition = false; }
        if (this.game.gamedatas.solo) {
            return;
        }
        /*const equality = opponentScore === points;
        const playerShouldShift = equality && playerId > opponentId;*/
        var markerDiv = document.getElementById("player-" + playerId + "-point-marker");
        var left = 210;
        var top = 60;
        if (points > 0) {
            var coordinates = this.getPointsCoordinates(points);
            left = coordinates[0];
            top = coordinates[1];
        }
        /*if (playerShouldShift) {
            top -= 5;
            left -= 5;
        }*/
        markerDiv.style.transform = "translateX(" + left + "px) translateY(" + top + "px)";
    };
    Table.prototype.updateMargins = function () {
        var board = document.getElementById('center-board');
        var boardBR = board.getBoundingClientRect();
        var topMargin = 0;
        var bottomMargin = 0;
        var leftMargin = 0;
        var rightMargin = 0;
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
            if (spotBR.x < boardBR.x - leftMargin) {
                leftMargin = boardBR.x - spotBR.x;
            }
            if (spotBR.x + spotBR.width > boardBR.x + boardBR.width + rightMargin) {
                rightMargin = (spotBR.x + spotBR.width) - (boardBR.x + boardBR.width);
            }
        });
        board.style.marginTop = topMargin + "px";
        board.style.marginBottom = bottomMargin + "px";
        board.style.marginLeft = leftMargin + "px";
        board.style.marginRight = rightMargin + "px";
    };
    Table.prototype.addAnimal = function (animal) {
        this.spots[this.noahPosition].addAnimal(animal);
        this.updateMargins();
    };
    Table.prototype.removeAnimals = function () {
        this.spots[this.noahPosition].removeAnimals();
        this.updateMargins();
    };
    Table.prototype.removeFirstAnimalFromFerry = function () {
        this.spots[this.noahPosition].removeFirstAnimalFromFerry();
        this.updateMargins();
    };
    Table.prototype.setRemainingFerries = function (remainingFerries) {
        this.ferriesCounter.setValue(remainingFerries);
        var visibility = remainingFerries > 0 ? 'visible' : 'hidden';
        document.getElementById('ferry-deck').style.visibility = visibility;
        document.getElementById('remaining-ferry-counter').style.visibility = visibility;
    };
    Table.prototype.departure = function (newFerry, remainingFerries) {
        this.setRemainingFerries(remainingFerries);
        this.spots[this.noahPosition].departure(newFerry);
        this.updateMargins();
    };
    Table.prototype.newRound = function (ferries) {
        this.setRemainingFerries(3);
        for (var i = 0; i < 5; i++) {
            this.spots[i].newRound(ferries[i]);
        }
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
        this.clickAction = 'load';
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
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.ferries, gamedatas.noahPosition, gamedatas.remainingFerries);
        this.roundCounter = new ebg.counter();
        this.roundCounter.create('round-counter');
        this.roundCounter.setValue(gamedatas.roundNumber);
        if (gamedatas.variant || gamedatas.solo) {
        }
        if (gamedatas.solo) {
            this.soloCounter = new ebg.counter();
            this.soloCounter.create('solo-counter');
            this.soloCounter.setValue(gamedatas.remainingAnimals);
            dojo.destroy('round-counter-wrapper');
        }
        else {
            dojo.destroy('solo-counter-wrapper');
        }
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
                this.clickAction = 'load';
                var allDisabled = !args.args.selectableAnimals.length;
                this.setGamestateDescription(allDisabled ? 'impossible' : '');
                this.onEnteringStateLoadAnimal(args.args);
                break;
            case 'viewCards':
                this.onEnteringStateLookCards(args.args);
                break;
            case 'moveNoah':
                this.onEnteringStateMoveNoah(args.args);
                break;
            case 'chooseOpponent':
                var enteringChooseOpponentArgs = args.args;
                if (enteringChooseOpponentArgs.exchangeCard) {
                    this.setGamestateDescription('exchange');
                }
                else if (enteringChooseOpponentArgs.giveCardFromFerry) {
                    this.setGamestateDescription('give');
                }
                break;
            case 'giveCard':
                this.clickAction = 'lion';
                this.onEnteringStateGiveCard();
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
    Noah.prototype.onEnteringStateOptimalLoading = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.cardsToGive = args.number;
            this.giveCardsTo = new Map();
            this.opponentsIds = args.opponentsIds;
            this.playerHand.setSelectionMode(2);
        }
    };
    Noah.prototype.onEnteringStateGiveCard = function () {
        if (this.isCurrentPlayerActive()) {
            this.playerHand.setSelectionMode(1);
        }
    };
    Noah.prototype.onEnteringStateLookCards = function (args) {
        var _this = this;
        var viewCardsDialog = new ebg.popindialog();
        viewCardsDialog.create('noahViewCardsDialog');
        viewCardsDialog.setTitle(dojo.string.substitute(_(" ${player_name} cards"), { player_name: this.getPlayer(args.opponentId).name }));
        var html = "<div id=\"opponent-hand\"></div>";
        // Show the dialog
        viewCardsDialog.setContent(html);
        var opponentHand = new ebg.stock();
        opponentHand.create(this, $('opponent-hand'), ANIMAL_WIDTH, ANIMAL_HEIGHT);
        opponentHand.setSelectionMode(0);
        opponentHand.centerItems = true;
        //opponentHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        setupAnimalCards(opponentHand);
        args.animals.forEach(function (animal) { return opponentHand.addToStockWithId(getUniqueId(animal), '' + animal.id); });
        viewCardsDialog.show();
        setTimeout(function () { return opponentHand.updateDisplay(); }, 100);
        // Replace the function call when it's clicked
        viewCardsDialog.replaceCloseCallback(function () {
            if (!_this.checkAction('seen'))
                return;
            _this.takeAction("seen");
            viewCardsDialog.destroy();
        });
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
            case 'optimalLoading':
                this.onLeavingStateOptimalLoading();
                break;
            case 'giveCard':
                this.onLeavingStateGiveCard();
                break;
        }
    };
    Noah.prototype.onLeavingStateLoadAnimal = function () {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        dojo.query('.stockitem').removeClass('disabled');
    };
    Noah.prototype.onLeavingStateMoveNoah = function () {
        dojo.query('.noah-spot').removeClass('selectable');
    };
    Noah.prototype.onLeavingStateOptimalLoading = function () {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        this.cardsToGive = null;
        this.giveCardsTo = null;
        this.opponentsIds = null;
        this.removeAllBubbles();
    };
    Noah.prototype.onLeavingStateGiveCard = function () {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
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
                case 'chooseWeight':
                    var chooseWeightArgs_1 = args;
                    this.addActionButton('min-weight-button', '1', function () { return _this.setWeight(1); });
                    this.addActionButton('adjust-weight-button', '' + chooseWeightArgs_1.weightForDeparture, function () { return _this.setWeight(chooseWeightArgs_1.weightForDeparture); });
                    break;
                case 'chooseOpponent':
                    var choosePlayerArgs = args;
                    var exchange_1 = choosePlayerArgs.exchangeCard;
                    var give_1 = choosePlayerArgs.giveCardFromFerry;
                    choosePlayerArgs.opponentsIds.forEach(function (playerId, index) {
                        var player = _this.getPlayer(playerId);
                        _this.addActionButton("choosePlayer" + playerId + "-button", player.name + (index === 0 ? " (" + _('next player') + ")" : ''), function () { return (give_1 ? _this.giveCardFromFerry(playerId) : (exchange_1 ? _this.exchangeCard(playerId) : _this.lookCards(playerId))); });
                        document.getElementById("choosePlayer" + playerId + "-button").style.border = "3px solid #" + player.color;
                    });
                    break;
                case 'optimalLoading':
                    this.clickAction = 'give';
                    this.onEnteringStateOptimalLoading(args);
                    this.addActionButton('giveCards-button', this.getGiveCardsButtonText(), function () { return _this.giveCards(); });
                    dojo.addClass('giveCards-button', 'disabled');
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Noah.prototype.getGiveCardsButtonText = function () {
        return dojo.string.substitute(_('Give ${selecardCardsCount} selected cards'), { selecardCardsCount: this.giveCardsTo.size != this.cardsToGive ? "<span style=\"color: orange;\">" + this.giveCardsTo.size + "</span>" : this.giveCardsTo.size });
    };
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
        dojo.connect(this.playerHand, 'onChangeSelection', this, function (_, id) { return _this.onPlayerHandSelectionChanged(Number(id)); });
        setupAnimalCards(this.playerHand);
        animals.forEach(function (animal) { return _this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id); });
    };
    Noah.prototype.onPlayerHandSelectionChanged = function (id) {
        var added = (this.playerHand.getSelectedItems().some(function (item) { return Number(item.id) == id; }));
        if (this.clickAction === 'load' && added) {
            this.loadAnimal(id);
        }
        else if (this.clickAction === 'lion' && added) {
            this.giveCard(id);
        }
        else if (this.clickAction === 'give') {
            if (Object.keys(this.gamedatas.players).length == 2) {
                var opponentId = this.getOpponentId(this.getPlayerId());
                if (added) {
                    this.giveCardsTo.set(id, opponentId);
                }
                else {
                    this.giveCardsTo.delete(id);
                }
                this.updateGiveCardsButton();
            }
            else {
                if (added) {
                    this.toggleBubbleChangeDie(id);
                }
                else {
                    this.cancelGiveToOpponent(id);
                }
            }
        }
    };
    Noah.prototype.updateGiveCardsButton = function () {
        dojo.toggleClass('giveCards-button', 'disabled', this.giveCardsTo.size != this.cardsToGive);
        document.getElementById('giveCards-button').innerHTML = this.getGiveCardsButtonText();
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
    Noah.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
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
    Noah.prototype.setWeight = function (weight) {
        if (!this.checkAction('setWeight')) {
            return;
        }
        this.takeAction('setWeight', {
            weight: weight
        });
    };
    Noah.prototype.lookCards = function (playerId) {
        if (!this.checkAction('lookCards')) {
            return;
        }
        this.takeAction('lookCards', {
            playerId: playerId
        });
    };
    Noah.prototype.exchangeCard = function (playerId) {
        if (!this.checkAction('exchangeCard')) {
            return;
        }
        this.takeAction('exchangeCard', {
            playerId: playerId
        });
    };
    Noah.prototype.giveCardFromFerry = function (playerId) {
        if (!this.checkAction('giveCardFromFerry')) {
            return;
        }
        this.takeAction('giveCardFromFerry', {
            playerId: playerId
        });
    };
    Noah.prototype.giveCard = function (id) {
        if (!this.checkAction('giveCard')) {
            return;
        }
        this.takeAction('giveCard', {
            id: id
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
    Noah.prototype.giveCards = function () {
        if (!this.checkAction('giveCards')) {
            return;
        }
        var giveCardsTo = [];
        this.giveCardsTo.forEach(function (value, key) { return giveCardsTo[key] = value; });
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
    Noah.prototype.removeAllBubbles = function () {
        Array.from(document.getElementsByClassName('choose-opponent-discussion_bubble')).forEach(function (elem) { return elem.parentElement.removeChild(elem); });
    };
    Noah.prototype.hideBubble = function (cardId) {
        var bubble = document.getElementById("discussion_bubble_card" + cardId);
        if (bubble) {
            bubble.style.display = 'none';
            bubble.dataset.visible = 'false';
            // reset tooltip, hidden on opening
            var cardDivId = "my-animals_item_" + cardId;
            setupAnimalCard(this, document.getElementById(cardDivId), this.playerHand.items.find(function (item) { return Number(item.id) == cardId; }).type);
        }
    };
    Noah.prototype.toggleBubbleChangeDie = function (cardId) {
        var _this = this;
        var divId = "card" + cardId;
        var cardDivId = "my-animals_item_" + cardId;
        if (!document.getElementById("discussion_bubble_" + divId)) {
            dojo.place("<div id=\"discussion_bubble_" + divId + "\" class=\"discussion_bubble choose-opponent-discussion_bubble\"></div>", cardDivId);
        }
        var bubble = document.getElementById("discussion_bubble_" + divId);
        var visible = bubble.dataset.visible == 'true';
        if (visible) {
            this.hideBubble(cardId);
        }
        else {
            // remove tooltip so it doesn't go over bubble
            this.addTooltipHtml(cardDivId, '');
            var creation = bubble.innerHTML == '';
            if (creation) {
                var html_1 = "<div>";
                this.opponentsIds.forEach(function (opponentId) {
                    var player = _this.getPlayer(opponentId);
                    var buttonId = divId + "-give-to-opponent-" + player.id;
                    html_1 += "<div>\n                        <button id=\"" + buttonId + "\" class=\"bgabutton bgabutton_gray " + divId + "-give-to-opponent\" style=\"border: 3px solid #" + player.color + "\">" + player.name + "</button>\n                    </div>";
                });
                html_1 += "<div>\n                    <button id=\"" + divId + "-give-to-opponent-cancel\" class=\"bgabutton bgabutton_gray\">" + _('Keep this card') + "</button>\n                </div>";
                html_1 += "</div>";
                dojo.place(html_1, bubble.id);
                this.opponentsIds.forEach(function (opponentId) {
                    var buttonId = divId + "-give-to-opponent-" + opponentId;
                    document.getElementById(buttonId).addEventListener('click', function (event) {
                        dojo.query("." + divId + "-give-to-opponent").removeClass('bgabutton_blue');
                        dojo.query("." + divId + "-give-to-opponent").addClass('bgabutton_gray');
                        dojo.addClass(buttonId, 'bgabutton_blue');
                        dojo.removeClass(buttonId, 'bgabutton_gray');
                        _this.giveCardsTo.set(cardId, opponentId);
                        _this.updateGiveCardsButton();
                        event.stopPropagation();
                    });
                });
                document.getElementById(divId + "-give-to-opponent-cancel").addEventListener('click', function () { return _this.cancelGiveToOpponent(cardId); });
            }
            bubble.style.display = 'block';
            bubble.dataset.visible = 'true';
        }
    };
    Noah.prototype.cancelGiveToOpponent = function (cardId) {
        dojo.query(".card" + cardId + "-give-to-opponent").removeClass('bgabutton_blue');
        dojo.query(".card" + cardId + "-give-to-opponent").addClass('bgabutton_gray');
        this.giveCardsTo.delete(cardId);
        this.updateGiveCardsButton();
        this.hideBubble(cardId);
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
            ['remainingAnimals', 1],
            ['animalGiven', ANIMATION_MS],
            ['animalGivenFromFerry', ANIMATION_MS],
            ['removedCard', ANIMATION_MS],
            ['newCard', ANIMATION_MS],
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
        this.table.newRound(notif.args.ferries);
        this.roundCounter.incValue(1);
    };
    Noah.prototype.notif_newHand = function (notif) {
        var _this = this;
        if (!notif.args.keepCurrentHand) {
            this.playerHand.removeAll();
        }
        notif.args.animals.forEach(function (animal) { return _this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id); });
        this.notif_remainingAnimals(notif);
    };
    Noah.prototype.notif_remainingAnimals = function (notif) {
        if (this.gamedatas.solo) {
            this.soloCounter.toValue(notif.args.remainingAnimals);
        }
    };
    Noah.prototype.notif_animalGiven = function (notif) {
        if (this.getPlayerId() == notif.args.playerId) {
            var animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.removeFromStockById('' + animal.id);
        }
        else if (this.getPlayerId() == notif.args.toPlayerId) {
            var animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id);
        }
        // TODO animate
    };
    Noah.prototype.notif_animalGivenFromFerry = function (notif) {
        if (this.getPlayerId() == notif.args.toPlayerId) {
            var animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id);
        }
        this.table.removeFirstAnimalFromFerry();
        // TODO animate
    };
    Noah.prototype.notif_departure = function (notif) {
        this.table.departure(notif.args.newFerry, notif.args.remainingFerries);
    };
    Noah.prototype.notif_removedCard = function (notif) {
        this.playerHand.removeFromStockById('' + notif.args.animal.id, notif.args.fromPlayerId ? 'overall_player_board_' + notif.args.fromPlayerId : undefined);
    };
    Noah.prototype.notif_newCard = function (notif) {
        var animal = notif.args.animal;
        this.playerHand.addToStockWithId(getUniqueId(animal), '' + animal.id, notif.args.fromPlayerId ? 'overall_player_board_' + notif.args.fromPlayerId : undefined);
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
                if (typeof args.animalName == 'string' && args.animalName[0] != '<' && typeof args.animal == 'object') {
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
