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
    private gamedatas: NoahGamedatas;
    private helpDialog: any;

    private playerHand: Stock;
    private table: Table;

    public zoom: number = 1;

    public clickAction: 'load' | 'give' | 'lion' = 'load';
    private cardsToGive: number;
    private giveCardsTo: Map<number, number>; // key = card id, value = toPlayerId

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
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.ferries, gamedatas.noahPosition, gamedatas.remainingFerries);

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
        log( 'Entering state: '+stateName , args.args );

        switch (stateName) {
            case 'loadAnimal':
                this.clickAction = 'load';
                const allDisabled = !(args.args as EnteringLoadAnimalArgs).selectableAnimals.length;
                this.setGamestateDescription(allDisabled ? 'impossible' : '');
                this.onEnteringStateLoadAnimal(args.args as EnteringLoadAnimalArgs);
                break;
            case 'moveNoah':
                this.onEnteringStateMoveNoah(args.args as EnteringMoveNoahArgs);
                break;
            case 'optimalLoading':
                this.clickAction = 'give';
                this.onEnteringStateOptimalLoading(args.args as EnteringOptimalLoadingArgs);
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

    private onEnteringStateOptimalLoading(args: EnteringOptimalLoadingArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.cardsToGive = args.number;
            this.giveCardsTo = new Map();
            this.playerHand.setSelectionMode(2);
        }
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
            case 'optimalLoading':
                this.onLeavingStateOptimalLoading();
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

    onLeavingStateOptimalLoading() {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        this.cardsToGive = null;
        this.giveCardsTo = null;
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

                case 'optimalLoading':
                    (this as any).addActionButton('giveCards-button', _('Give selected cards'), () => this.giveCards());
                    dojo.addClass('giveCards-button', 'disabled');
                    break;
            }
        }
    }    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////
    

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
        this.playerHand.image_items_per_row = 10;
        this.playerHand.onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupAnimalCard(this, cardDiv, type);
        dojo.connect(this.playerHand, 'onChangeSelection', this, (_, id: string) => this.onPlayerHandSelectionChanged(Number(id)));

        setupAnimalCards(this.playerHand);

        animals.forEach(animal => this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id));
    }

    public onPlayerHandSelectionChanged(id: number) {
        if (this.clickAction === 'load') {
            this.loadAnimal(id);
        } else if (this.clickAction === 'give') {
            const added = (this.playerHand.getSelectedItems().some(item => Number(item.id) == id));
            if (Object.keys(this.gamedatas.players).length == 2) {
                const opponentId = this.getOpponentId(this.getPlayerId());
                if (added) {
                    this.giveCardsTo.set(id, opponentId);
                } else {
                    this.giveCardsTo.delete(id);
                }
                this.updateGiveCardsButton();
            } else {
                // TODO
            }
        }
    }

    private updateGiveCardsButton() {
        dojo.toggleClass('giveCards-button', 'disabled', this.giveCardsTo.size != this.cardsToGive);
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
            ['animalGiven', ANIMATION_MS],
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
        this.table.addAnimal(notif.args.animal);
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
    }

    notif_newHand(notif: Notif<NotifNewHandArgs>) {
        this.playerHand.removeAll();
        notif.args.animals.forEach(animal => this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id));
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

    notif_departure(notif: Notif<NotifDepartureArgs>) {
        this.table.departure(notif.args.newFerry, notif.args.remainingFerries);
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
                if (typeof args.animalName == 'string' && args.animalName[0] != '<'/* && typeof args.animal == 'object'*/) {
                    args.animalName = `<strong style="color: ${this.getAnimalColor(args.animal?.gender ?? 'black')}">${args.animalName}</strong>`;
                }
            }

            if (log == '${player_name} loads animal ${animalName}') {
                console.log(log, args);
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}