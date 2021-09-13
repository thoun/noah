declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

const ANIMATION_MS = 500;

const ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-300, -166, -100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'Noah-zoom';

const isDebug = window.location.host == 'studio.boardgamearena.com';
const log = isDebug ? console.log.bind(window.console) : function () { };

class Noah implements NoahGame {
    public gamedatas: NoahGamedatas;
    private helpDialog: any;

    private playerHand: Stock;
    private table: Table;
    private roundCounter: Counter;
    private soloCounter: Counter;

    public zoom: number = 1;

    public clickAction: 'load' | 'give' | 'lion' = 'load';
    private cardsToGive: number;
    private giveCardsTo: Map<number, number>; // key = card id, value = toPlayerId
    private opponentsIds: number[];

    constructor() {    
        const zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
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

    public setup(gamedatas: NoahGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        //this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handAnimals);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.ferries, gamedatas.noahPosition, gamedatas.remainingFerries, gamedatas.topFerry);

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
        } else {
            dojo.destroy('solo-counter-wrapper');
        }

        this.addHelp();
        this.setupNotifications();

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log( 'Entering state: '+stateName , args.args);

        this.setProgressionBackground(Number(args.updateGameProgression));

        switch (stateName) {
            case 'loadAnimal':
                this.clickAction = 'load';
                const allDisabled = !(args.args as EnteringLoadAnimalArgs).selectableAnimals.length;
                this.setGamestateDescription(allDisabled ? 'impossible' : '');
                this.onEnteringStateLoadAnimal(args.args as EnteringLoadAnimalArgs);
                break;
            case 'viewCards':
                if ((this as any).isCurrentPlayerActive()) {
                    this.onEnteringStateLookCards(args.args as EnteringLookCardsArgs);
                }
                break;
            case 'moveNoah':
                this.onEnteringStateMoveNoah(args.args as EnteringMoveNoahArgs);
                break;
            case 'chooseOpponent':
                const enteringChooseOpponentArgs = args.args as EnteringChooseOpponentArgs;
                if (enteringChooseOpponentArgs.exchangeCard) {
                    this.setGamestateDescription('exchange');
                } else if (enteringChooseOpponentArgs.giveCardFromFerry) {
                    this.setGamestateDescription('give');
                }                
                break;
            case 'giveCard':
                this.clickAction = 'lion';
                this.onEnteringStateGiveCard();
                break;
        }
    }
    
    private setGamestateDescription(property: string = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + property]}`; 
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + property]}`; 
        (this as any).updatePageTitle();        
    }
    
    private onEnteringStateLoadAnimal(args: EnteringLoadAnimalArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.playerHand.items
                .filter(item => !args.selectableAnimals.some(animal => animal.id === Number(item.id)))
                .forEach(item => dojo.addClass(`${this.playerHand.container_div.id}_item_${item.id}`, 'disabled'));
            this.playerHand.setSelectionMode(1);
        }
    }
    
    private onEnteringStateMoveNoah(args: EnteringMoveNoahArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            args.possiblePositions.forEach(position => dojo.addClass(`noah-spot-${position}`, 'selectable'));
        }
    }

    private onEnteringStateOptimalLoadingGiveCards(args: EnteringOptimalLoadingGiveCardsArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.cardsToGive = args.number;
            this.giveCardsTo = new Map();
            this.opponentsIds = args.opponentsIds;
            this.playerHand.setSelectionMode(2);
        }
    }

    private onEnteringStateGiveCard() {
        if ((this as any).isCurrentPlayerActive()) {
            this.playerHand.setSelectionMode(1);
        }
    }

    private onEnteringStateLookCards(args: EnteringLookCardsArgs) {
        const viewCardsDialog = new ebg.popindialog();
        viewCardsDialog.create( 'noahViewCardsDialog' );
        viewCardsDialog.setTitle(dojo.string.substitute(_(" ${player_name} cards"), { player_name: this.getPlayer(args.opponentId).name }));
        
        var html = `<div id="opponent-hand"></div>`;
        
        // Show the dialog
        viewCardsDialog.setContent(html);

        const opponentHand = new ebg.stock() as Stock;
        opponentHand.create( this, $('opponent-hand'), ANIMAL_WIDTH, ANIMAL_HEIGHT);
        opponentHand.setSelectionMode(0);
        opponentHand.centerItems = true;
        //opponentHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        setupAnimalCards(opponentHand);
        console.log(opponentHand.item_type);
        args.animals.forEach(animal => opponentHand.addToStockWithId(getUniqueId(animal), ''+animal.id));

        viewCardsDialog.show();
        setTimeout(() => opponentHand.updateDisplay(), 100);

        // Replace the function call when it's clicked
        viewCardsDialog.replaceCloseCallback(() => {
            if(!(this as any).checkAction('seen'))
            return;
        
            this.takeAction("seen");

            viewCardsDialog.destroy();
        });
    }

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'loadAnimal':
                this.onLeavingStateLoadAnimal();
                break;
            case 'moveNoah':
                this.onLeavingStateMoveNoah();
                break;
            case 'optimalLoadingGiveCards':
                this.onLeavingStateOptimalLoadingGiveCards();
                break;
            case 'giveCard':
                this.onLeavingStateGiveCard();
                break;
        }
    }

    onLeavingStateLoadAnimal() {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        dojo.query('.stockitem').removeClass('disabled');
    }

    onLeavingStateMoveNoah() {
        dojo.query('.noah-spot').removeClass('selectable');
    }

    onLeavingStateOptimalLoadingGiveCards() {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        this.cardsToGive = null;
        this.giveCardsTo = null;
        this.opponentsIds = null;
        this.removeAllBubbles();
    }

    onLeavingStateGiveCard() {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'loadAnimal':
                    const loadAnimalArgs = args as EnteringLoadAnimalArgs;
                    if (!loadAnimalArgs.selectableAnimals.length) {
                        (this as any).addActionButton('takeAllAnimals-button', _('Take all animals'), () => this.takeAllAnimals(), null, null, 'red');
                    }
                    break;

                case 'chooseGender':
                    (this as any).addActionButton('chooseGender-male-button', _('Male'), () => this.setGender(1));
                    (this as any).addActionButton('chooseGender-female-button', _('Female'), () => this.setGender(2));
                    break;

                case 'chooseWeight':
                    const chooseWeightArgs = args as EnteringChooseWeightArgs;
                    (this as any).addActionButton('min-weight-button', '1', () => this.setWeight(1));
                    (this as any).addActionButton('adjust-weight-button', ''+chooseWeightArgs.weightForDeparture, () => this.setWeight(chooseWeightArgs.weightForDeparture));
                    break;

                case 'chooseOpponent':
                    const choosePlayerArgs = args as EnteringChooseOpponentArgs;
                    const exchange = choosePlayerArgs.exchangeCard;
                    const give = choosePlayerArgs.giveCardFromFerry;
                    choosePlayerArgs.opponentsIds.forEach((playerId, index) => {
                        const player = this.getPlayer(playerId);
                        (this as any).addActionButton(`choosePlayer${playerId}-button`, player.name + (index === 0 ? ` (${_('next player')})` : ''), () => (give ? this.giveCardFromFerry(playerId) : (exchange ? this.exchangeCard(playerId) : this.lookCards(playerId))));
                        document.getElementById(`choosePlayer${playerId}-button`).style.border = `3px solid #${player.color}`;
                    });
                    break;

                case 'optimalLoadingGiveCards':                    
                    this.clickAction = 'give';
                    this.onEnteringStateOptimalLoadingGiveCards(args as EnteringOptimalLoadingGiveCardsArgs);
                    (this as any).addActionButton('giveCards-button', this.getGiveCardsButtonText(), () => this.giveCards());
                    dojo.addClass('giveCards-button', 'disabled');
                    break;
            }
        }
    }    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    private getGiveCardsButtonText() {
        return dojo.string.substitute(_('Give ${selecardCardsCount} selected cards'), { selecardCardsCount: this.giveCardsTo.size != this.cardsToGive ? `<span style="color: orange;">${this.giveCardsTo.size}</span>` : this.giveCardsTo.size });
    }
    

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% ${(1-zoom)*-100}% 0`;
        }

        this.playerHand.updateDisplay();

        document.getElementById('zoom-wrapper').style.height = `${div.getBoundingClientRect().height}px`;
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public setHand(animals: Animal[]) {
        this.playerHand = new ebg.stock() as Stock;
        this.playerHand.create(this, $('my-animals'), ANIMAL_WIDTH, ANIMAL_HEIGHT);
        this.playerHand.setSelectionMode(1);            
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.selectionClass = 'selected';
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupAnimalCard(this, cardDiv, type);
        dojo.connect(this.playerHand, 'onChangeSelection', this, (_, id: string) => this.onPlayerHandSelectionChanged(Number(id)));

        setupAnimalCards(this.playerHand);

        animals.forEach(animal => this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id));
    }

    public onPlayerHandSelectionChanged(id: number) {
        const added = (this.playerHand.getSelectedItems().some(item => Number(item.id) == id));
        if (this.clickAction === 'load' && added) {
            this.loadAnimal(id);
        } else if (this.clickAction === 'lion' && added) {
            this.giveCard(id);
        } else if (this.clickAction === 'give') {
            if (Object.keys(this.gamedatas.players).length == 2) {
                const opponentId = this.getOpponentId(this.getPlayerId());
                if (added) {
                    this.giveCardsTo.set(id, opponentId);
                } else {
                    this.giveCardsTo.delete(id);
                }
                this.updateGiveCardsButton();
            } else {
                if (added) {
                    this.toggleBubbleChangeDie(id);
                } else {
                    this.cancelGiveToOpponent(id);
                }
            }
        }
    }

    private updateGiveCardsButton() {
        dojo.toggleClass('giveCards-button', 'disabled', this.giveCardsTo.size != this.cardsToGive);
        document.getElementById('giveCards-button').innerHTML = this.getGiveCardsButtonText();
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getOpponentId(playerId: number): number {
        return Number(Object.values(this.gamedatas.players).find(player => Number(player.id) != playerId).id);
    }

    public getPlayerScore(playerId: number): number {
        return (this as any).scoreCtrl[playerId]?.getValue() ?? Number(this.gamedatas.players[playerId].score);
    }

    private getPlayer(playerId: number): NoahPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private loadAnimal(id: number) {
        if(!(this as any).checkAction('loadAnimal')) {
            return;
        }

        this.takeAction('loadAnimal', {
            id
        });
    }

    private takeAllAnimals() {
        if(!(this as any).checkAction('takeAllAnimals')) {
            return;
        }

        this.takeAction('takeAllAnimals');
    }

    private setGender(gender: number) {
        if(!(this as any).checkAction('setGender')) {
            return;
        }

        this.takeAction('setGender', {
            gender
        });
    }

    private setWeight(weight: number) {
        if(!(this as any).checkAction('setWeight')) {
            return;
        }

        this.takeAction('setWeight', {
            weight
        });
    }

    private lookCards(playerId: number) {
        if(!(this as any).checkAction('lookCards')) {
            return;
        }

        this.takeAction('lookCards', {
            playerId
        });
    }

    private exchangeCard(playerId: number) {
        if(!(this as any).checkAction('exchangeCard')) {
            return;
        }

        this.takeAction('exchangeCard', {
            playerId
        });
    }

    private giveCardFromFerry(playerId: number) {
        if(!(this as any).checkAction('giveCardFromFerry')) {
            return;
        }

        this.takeAction('giveCardFromFerry', {
            playerId
        });
    }

    private giveCard(id: number) {
        if(!(this as any).checkAction('giveCard')) {
            return;
        }

        this.takeAction('giveCard', {
            id
        });
    }

    public moveNoah(destination: number) {
        if(!(this as any).checkAction('moveNoah')) {
            return;
        }

        this.takeAction('moveNoah', {
            destination
        });
    }

    private giveCards() {
        if(!(this as any).checkAction('giveCards')) {
            return;
        }

        const giveCardsTo = []; 
        this.giveCardsTo.forEach((value, key) => giveCardsTo[key] = value);

        const base64 = btoa(JSON.stringify(giveCardsTo));

        this.takeAction('giveCards', {
            giveCardsTo: base64
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/noah/noah/${action}.html`, data, this, () => {});
    }
    
    private setPoints(playerId: number, points: number) {
        (this as any).scoreCtrl[playerId]?.toValue(points);
        this.table.setPoints(playerId, points);
    }

    private addHelp() {
        dojo.place(`<button id="noah-help-button">?</button>`, 'left-side');
        dojo.connect( $('noah-help-button'), 'onclick', this, () => this.showHelp());
    }

    private showHelp() {
        if (!this.helpDialog) {
            this.helpDialog = new ebg.popindialog();
            this.helpDialog.create( 'noahHelpDialog' );
            this.helpDialog.setTitle( _("Cards help") );
            
            var html = `
            <div id="help-popin">
                <h1>${_("Animal traits")}</h1>
                <div class="help-section help-animals">
                    <table>`;
                ANIMALS_WITH_TRAITS.forEach(number => html += `<tr><td><div id="animal${number}" class="animal"></div></td><td>${getAnimalTooltip(number)}</td></tr>`);
                html += `</table>
                </div>
                <h1>${_("Bonus animal traits")}</h1>
                <div class="help-section help-animals">
                    <table>`;
                BONUS_ANIMALS_WITH_TRAITS.forEach(number => html += `<tr><td><div id="animal${number}" class="animal"></div></td><td>${getAnimalTooltip(number)}</td></tr>`);
                html += `</table>
                </div>
            </div>`;
            
            // Show the dialog
            this.helpDialog.setContent(html);
        }

        this.helpDialog.show();
    }

    public removeAllBubbles() {
        Array.from(document.getElementsByClassName('choose-opponent-discussion_bubble')).forEach(elem => elem.parentElement.removeChild(elem));
    }

    private hideBubble(cardId: number) {
        const bubble = document.getElementById(`discussion_bubble_card${cardId}`);
        if (bubble) {
            bubble.style.display = 'none';
            bubble.dataset.visible = 'false';

            // reset tooltip, hidden on opening
            const cardDivId = `my-animals_item_${cardId}`;
            setupAnimalCard(this, document.getElementById(cardDivId) as HTMLDivElement, this.playerHand.items.find(item => Number(item.id) == cardId).type);
        }
    }

    private toggleBubbleChangeDie(cardId: number) {
        const divId = `card${cardId}`;
        const cardDivId = `my-animals_item_${cardId}`;
        if (!document.getElementById(`discussion_bubble_${divId}`)) { 
            dojo.place(`<div id="discussion_bubble_${divId}" class="discussion_bubble choose-opponent-discussion_bubble"></div>`, cardDivId);
        }
        const bubble = document.getElementById(`discussion_bubble_${divId}`);
        const visible = bubble.dataset.visible == 'true';

        if (visible) {
            this.hideBubble(cardId);
        } else {
            // remove tooltip so it doesn't go over bubble
            (this as any).addTooltipHtml(cardDivId, '');

            const creation = bubble.innerHTML == '';
            if (creation) {
                let html = `<div>`;
                this.opponentsIds.forEach(opponentId => {
                    const player = this.getPlayer(opponentId);
                    const buttonId = `${divId}-give-to-opponent-${player.id}`;
                    html += `<div>
                        <button id="${buttonId}" class="bgabutton bgabutton_gray ${divId}-give-to-opponent" style="border: 3px solid #${player.color}">${player.name}</button>
                    </div>`;
                });

                html += `<div>
                    <button id="${divId}-give-to-opponent-cancel" class="bgabutton bgabutton_gray">${_('Keep this card')}</button>
                </div>`;

                html += `</div>`;
                dojo.place(html, bubble.id);

                this.opponentsIds.forEach(opponentId => {
                    const buttonId = `${divId}-give-to-opponent-${opponentId}`;
                    document.getElementById(buttonId).addEventListener('click', event => {
                        dojo.query(`.${divId}-give-to-opponent`).removeClass('bgabutton_blue');
                        dojo.query(`.${divId}-give-to-opponent`).addClass('bgabutton_gray');
                        dojo.addClass(buttonId, 'bgabutton_blue');
                        dojo.removeClass(buttonId, 'bgabutton_gray');
                        this.giveCardsTo.set(cardId, opponentId);
                        this.updateGiveCardsButton();
                        event.stopPropagation();
                    });
                });

                document.getElementById(`${divId}-give-to-opponent-cancel`).addEventListener('click', () => this.cancelGiveToOpponent(cardId));
            }

            bubble.style.display = 'block';
            bubble.dataset.visible = 'true';
        }
        
    }

    private cancelGiveToOpponent(cardId: number) {
        dojo.query(`.card${cardId}-give-to-opponent`).removeClass('bgabutton_blue');
        dojo.query(`.card${cardId}-give-to-opponent`).addClass('bgabutton_gray');
        this.giveCardsTo.delete(cardId);
        this.updateGiveCardsButton();
        this.hideBubble(cardId);
    }

    private setProgressionBackground(progression: number) {
        if (isNaN(progression)) {
            return;
        }

        const position = (progression * 4.5) - 100;
        document.getElementById('pagesection_gameview').style.backgroundPositionY = `${position}%`;
        dojo.toggleClass('pagesection_gameview', 'downcolor', position > 100);
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your noah.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
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

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_points(notif: Notif<NotifPointsArgs>) {
        this.setPoints(notif.args.playerId, notif.args.points);
        this.table.setPoints(notif.args.playerId, notif.args.points);
    }

    notif_animalLoaded(notif: Notif<NotifAnimalLoadedArgs>) {        
        this.playerHand.removeFromStockById(''+notif.args.animal.id);
        const fromHand = this.getPlayerId() === Number(notif.args.playerId);
        const originId = fromHand ? 'my-animals' : `player_board_${notif.args.playerId}`;
        let xShift = 0;
        if (fromHand) {
            const cardBR = document.getElementById(`my-animals_item_${notif.args.animal.id}`).getBoundingClientRect();
            const handBR = document.getElementById('my-animals').getBoundingClientRect();
            xShift = cardBR.x - handBR.x;
        }
        this.table.addAnimal(notif.args.animal, originId, xShift);
    }

    notif_ferryAnimalsTaken(notif: Notif<NotifFerryAnimalsTakenArgs>) {
        if (this.getPlayerId() == notif.args.playerId) {
            notif.args.animals.forEach(animal => this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id));
        }
        this.table.removeAnimals();
    }

    notif_noahMoved(notif: Notif<NotifNoahMovedArgs>) {
        this.table.noahMoved(notif.args.position);
    }

    notif_newRound(notif: Notif<NotifNewRoundArgs>) {
        this.table.newRound(notif.args.ferries);
        this.roundCounter.incValue(1);
    }

    notif_newHand(notif: Notif<NotifNewHandArgs>) {
        if (!notif.args.keepCurrentHand) {
            this.playerHand.removeAll();
        }
        notif.args.animals.forEach(animal => this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id));

        this.notif_remainingAnimals(notif);
    }

    notif_remainingAnimals(notif: Notif<NotifNewHandArgs>) {
        if (this.gamedatas.solo) {
            this.soloCounter.toValue(notif.args.remainingAnimals);
        }
    }

    notif_animalGiven(notif: Notif<NotifAnimalGivenArgs>) {
        if (this.getPlayerId() == notif.args.playerId) {
            const animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.removeFromStockById(''+animal.id);
        } else if (this.getPlayerId() == notif.args.toPlayerId) {
            const animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id);
        }
        // TODO animate
    }

    notif_animalGivenFromFerry(notif: Notif<NotifAnimalGivenArgs>) {
        if (this.getPlayerId() == notif.args.toPlayerId) {
            const animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id);
        }
        this.table.removeFirstAnimalFromFerry();

        // TODO animate
    }

    notif_departure(notif: Notif<NotifDepartureArgs>) {
        this.table.departure(notif.args.topFerry, notif.args.newFerry, notif.args.remainingFerries);
    }
    
    notif_removedCard(notif: Notif<NotifRemovedCardArgs>) {
        this.playerHand.removeFromStockById(''+notif.args.animal.id, notif.args.fromPlayerId  ? 'overall_player_board_'+notif.args.fromPlayerId : undefined);
    }
    
    notif_newCard(notif: Notif<NotifNewCardArgs>) {
        const animal = notif.args.animal;
        this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id, notif.args.fromPlayerId ? 'overall_player_board_'+notif.args.fromPlayerId : undefined);
    }

    private getAnimalColor(gender: number) {
        switch (gender) {
            // blue
            case 1: return '#16bee6';
            case 2: return '#e97aa3';
            default: return 'black';
        }
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (typeof args.animalName == 'string' && args.animalName[0] != '<' && typeof args.animal == 'object') {
                    args.animalName = `<strong style="color: ${this.getAnimalColor(args.animal?.gender ?? 'black')}">${args.animalName}</strong>`;
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}