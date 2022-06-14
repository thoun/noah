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
    private handCounters: Counter[] = [];

    private playerHand: Stock;
    private table: Table;
    private roundCounter: Counter;
    private soloCounter: Counter;

    public zoom: number = 1;
    public maxZoom: number = 1;

    public clickAction: 'load' | 'give' | 'lion' = 'load';
    private cardsToGive: number;
    private giveCardsTo: Map<number, number>; // key = card id, value = toPlayerId
    private opponentsIds: number[];
    private topDeckOrder: {[id: number]: number};

    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    private sort: HandSort = {
        type: 'weight',
        direction: 'asc',
        currentWeights: null
    };

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

        this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handAnimals);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.ferries, gamedatas.noahPosition, gamedatas.remainingFerries, gamedatas.sentFerries, gamedatas.topFerry);

        this.roundCounter = new ebg.counter();
        this.roundCounter.create('round-counter');
        this.roundCounter.setValue(gamedatas.roundNumber);
        if (gamedatas.variant) {
            dojo.destroy('counter-no-variant');
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

        this.setupPreferences();

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
            this.table.updateMargins(); 
        }

        (this as any).onScreenWidthChange = () => {
            this.setMaxZoom();
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

        switch (stateName) {
            case 'loadAnimal':
                this.clickAction = 'load';
                const allDisabled = !(args.args as EnteringLoadAnimalArgs).selectableAnimals.length;
                this.setGamestateDescription(allDisabled ? 'impossible' : '');
                this.onEnteringStateLoadAnimal(args.args as EnteringLoadAnimalArgs);
                break;
            case 'viewCards':
                this.onEnteringStateLookCards(args.args as EnteringLookCardsArgs, (this as any).isCurrentPlayerActive());
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
            case 'reorderTopDeck':
                this.onEnteringStateReorderTopDeck(args.args);
                break;
            case 'replaceOnTopDeck':
                this.onEnteringStateReplaceOnTopDeck(args.args);
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

    private onEnteringStateLookCards(args: EnteringLookCardsArgs, isActivePlayer: boolean) {
        const opponent = this.getPlayer(args.opponentId);
        const giraffeAnimalsDiv = document.getElementById('giraffe-animals');
        giraffeAnimalsDiv.innerHTML = '';
        document.getElementById('giraffe-hand-label').innerHTML = dojo.string.substitute(_("${player_name} cards"), { player_name: `<span style="color: #${opponent.color}">${opponent.name}</span>` });
        
        const giraffeHandWrap = document.getElementById('giraffe-hand-wrap');
        giraffeHandWrap.classList.remove('hidden');
        giraffeHandWrap.style.boxShadow = `0 0 3px 3px #${opponent.color}`;
        
        giraffeAnimalsDiv.classList.toggle('text', !isActivePlayer);
        if (isActivePlayer) {
            const giraffeHand = new ebg.stock() as Stock;
            giraffeHand.create( this, $('giraffe-animals'), ANIMAL_WIDTH, ANIMAL_HEIGHT);
            giraffeHand.setSelectionMode(0);
            giraffeHand.centerItems = true;
            giraffeHand.onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupAnimalCard(this, cardDiv, type);
            setupAnimalCards(giraffeHand);
            args.animals.forEach(animal => giraffeHand.addToStockWithId(getUniqueId(animal), ''+animal.id));
        } else {
            const active = this.getPlayer(Number((this as any).getActivePlayerId()));
            document.getElementById('giraffe-animals').innerHTML = '<div>' + dojo.string.substitute(_("${active_player_name} is looking at ${player_name} cards"), { 
                active_player_name: `<span style="color: #${active.color}">${active.name}</span>`,
                player_name: `<span style="color: #${opponent.color}">${opponent.name}</span>` 
            }) + '</div>';
        }
    }

    private onEnteringStateReplaceOnTopDeck(args: EnteringReplaceOnTopDeckArgs) {
        this.table.makeCardsSelectable(args.animals);
    }

    private onEnteringStateReorderTopDeck(args: EnteringReorderTopDeckArgs) {
        this.topDeckOrder = {};
        
        let html = `<div id="order-selector">`;
        args.topCards.forEach((animal, index) => {
            html += `
            <div class="order-card-zone">
                <div id="order-card-zone-${animal.id}" class="animal-card" style="background-position: ${getBackgroundPosition(animal)}"></div>
                <div id="order-card-zone-${animal.id}-selector" class="selector">`;
            for (let i=1; i<=args.topCards.length; i++) {
                html += `<div id="order-card-zone-${animal.id}-selector-${i}" class="selector-arrow" data-selected="${i == index + 1 ? 'true' : 'false'}" data-number="${i}"></div>`;
            }
            html += `
                </div>
            </div>`;

            this.topDeckOrder[animal.id] = index + 1;
        });
        html += `</div>`;
        dojo.place(html, 'table', 'before');

        args.topCards.forEach(animal => {
            for (let i=1; i<=args.topCards.length; i++) {
                document.getElementById(`order-card-zone-${animal.id}-selector-${i}`).addEventListener('click', () => 
                    this.orderSelectorClick(animal.id, i)
                );
            }
        });
    }

    private orderSelectorClick(id: number, order: number) {
        this.topDeckOrder[id] = order;
        for (let i=1; i<=Object.keys(this.topDeckOrder).length; i++) {
            document.getElementById(`order-card-zone-${id}-selector-${i}`).dataset.selected = i === order ? 'true' : 'false';
        }

        let valid = true;

        for (let i=1; i<=Object.keys(this.topDeckOrder).length; i++) {
            valid = valid && Object.values(this.topDeckOrder).some(val => Number(val) === i);
        }
        
        dojo.toggleClass('reorderTopDeck-button', 'disabled', !valid);
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
            case 'viewCards':
                this.onLeavingStateLookCards();
            case 'moveNoah':
                this.onLeavingStateMoveNoah();
                break;
            case 'optimalLoadingGiveCards':
                this.onLeavingStateOptimalLoadingGiveCards();
                break;
            case 'giveCard':
                this.onLeavingStateGiveCard();
                break;
            case 'replaceOnTopDeck':
                this.onLeavingStateReplaceOnTopDeck();
                break;
            case 'reorderTopDeck':
                this.onLeavingStateReorderTopDeck();
                break;
        }
    }

    onLeavingStateLoadAnimal() {
        this.playerHand.setSelectionMode(0);
        this.playerHand.unselectAll();
        dojo.query('.stockitem').removeClass('disabled');
    }

    onLeavingStateLookCards() {
        const giraffeHandWrap = document.getElementById('giraffe-hand-wrap');
        giraffeHandWrap.classList.add('hidden');
        giraffeHandWrap.style.boxShadow = '';
        document.getElementById('giraffe-animals').innerHTML = '';
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

    onLeavingStateReplaceOnTopDeck() {
        this.table.endCardSelection();
    }

    onLeavingStateReorderTopDeck() {
        dojo.destroy('order-selector');
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
                case 'viewCards':
                    (this as any).addActionButton('seen-button', _('Seen'), () => this.seen());
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
                        (this as any).addActionButton(`choosePlayer${playerId}-button`, player.name + (index === 0 ? ` (${_('next player')})` : ''), () => this.chooseOpponent(playerId));
                        document.getElementById(`choosePlayer${playerId}-button`).style.border = `3px solid #${player.color}`;
                    });
                    break;

                case 'optimalLoadingGiveCards':                    
                    this.clickAction = 'give';
                    this.onEnteringStateOptimalLoadingGiveCards(args as EnteringOptimalLoadingGiveCardsArgs);
                    (this as any).addActionButton('giveCards-button', this.getGiveCardsButtonText(), () => this.giveCards());
                    dojo.addClass('giveCards-button', 'disabled');
                    break;

                case 'reorderTopDeck':
                    (this as any).addActionButton('reorderTopDeck-button', _('Replace on top deck'), () => this.reorderTopDeck());
                    break;

                case 'replaceOnTopDeck':
                    (this as any).addActionButton('skipReplaceOnTopDeck-button', _('Skip'), () => this.skipReplaceOnTopDeck());
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////
    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }


    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_control_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
          this.onPreferenceChange(prefId, prefValue);
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            case 201: 
                const hand = document.getElementById('hands');
                const table = document.getElementById('zoom-wrapper');
                if (prefValue == 2) {
                    table.after(hand);
                } else {
                    table.before(hand);
                }
                document.getElementById(`full-table`).dataset.handPosition = prefValue == 2 ? 'after' : 'before';
                break;
        }
    }

    private getGiveCardsButtonText() {
        return dojo.string.substitute(_('Give ${selectedCardsCount} selected cards'), { selectedCardsCount: this.giveCardsTo.size != this.cardsToGive ? `<span style="color: orange;">${this.giveCardsTo.size}</span>` : this.giveCardsTo.size });
    }
    

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.indexOf(this.maxZoom));
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% ${(1-zoom)*-100}% 0`;
        }
        div.dataset.zoom = ''+zoom;

        this.playerHand.updateDisplay();

        document.getElementById('zoom-wrapper').style.height = `${div.getBoundingClientRect().height}px`;
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);

        this.setMaxZoom();
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public getZoom(): number {
        return this.zoom;
    }

    public setMaxZoom() {
        dojo.style("page-content", "zoom", 'unset');

        if (!this.table) {
            return;
        }

        const neededScreenWidth = this.table.neededScreenWidth;
        const realAvailableScreenWidth = document.getElementById('full-table').getBoundingClientRect().width;
        if (realAvailableScreenWidth < neededScreenWidth) {
            let maxZoom = 1;
            while (neededScreenWidth * maxZoom > realAvailableScreenWidth) {
                const newIndex = ZOOM_LEVELS.indexOf(maxZoom) - 1;
                maxZoom = ZOOM_LEVELS[newIndex];
            }
            this.maxZoom = maxZoom;
            if (this.zoom > this.maxZoom) {
                this.setZoom(this.maxZoom);
            }
        } else {
            this.maxZoom = 1;
        }
        dojo.toggleClass('zoom-in', 'disabled', ZOOM_LEVELS.indexOf(this.zoom) >= ZOOM_LEVELS.indexOf(this.maxZoom));
    }

    public isSoloMode(): boolean {
        return this.gamedatas.solo;
    }

    private createPlayerPanels(gamedatas: NoahGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            // hand cards counter
            dojo.place(`<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                </div>
            </div>`, `player_board_${player.id}`);

            const handCounter = new ebg.counter();
            handCounter.create(`playerhand-counter-${playerId}`);
            handCounter.setValue(player.handCount);
            this.handCounters[playerId] = handCounter;
        });

        this.setTooltipToClass('playerhand-counter', _('Number of cards in hand'));

        dojo.place(`
            <div id="overall_player_board_0" class="player-board current-player-board">					
                <div class="player_board_inner" id="player_board_inner_982fff">

                    <div id="remaining-ferry-counter-wrapper" class="remaining-counter table-counter-wrapper">${_("Remaining ferries on deck:")} <span id="remaining-ferry-counter" class="remaining-counter-number"></span></div>
                    <div id="sent-ferry-counter-wrapper" class="remaining-counter table-counter-wrapper">${_("Ferries sent to the Great Ark:")} <span id="sent-ferry-counter" class="remaining-counter-number"></span></div>
                   
                </div>
            </div>`, `player_boards`, 'first');
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

        document.getElementById(`sortByWeight`).addEventListener('click', () => this.sortByWeight());
        document.getElementById(`sortByGender`).addEventListener('click', () => this.sortByGender());

        this.setTooltip('sortByWeight', _('Sort hand cards by weight'));        
        this.setTooltip('sortByGender', _('Sort hand cards by gender'));

        this.updateHandWeights();
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
                    this.toggleBubbleGiveCards(id);
                } else {
                    this.cancelGiveToOpponent(id);
                }
            }
        }
    }

    private updateHandWeights() {
        const weights = {};

        const animalTypes: AnimalTypeForSorting[] = [];

        [...ANIMALS_TYPES, ...BONUS_ANIMALS_TYPES].forEach(animalType => [0, 1, 2].forEach(gender => {
            animalTypes.push({
                uniqueId: animalType * 10 + gender,
                gender,
                weight: this.gamedatas.WEIGHTS[animalType]
            });
        }));
    
        if (this.sort.type === 'weight') {
            animalTypes.sort((a, b) => a.weight === b.weight ? b.gender - a.gender : this.sort.direction === 'asc' ? a.weight - b.weight : b.weight - a.weight);
            
        } else if (this.sort.type === 'gender') {
            animalTypes.sort((a, b) => a.gender === b.gender ? a.weight - b.weight : this.sort.direction === 'asc' ? a.gender - b.gender : b.gender - a.gender);
        }

        document.getElementById(this.sort.type === 'weight' ? `sortByWeight` : `sortByGender`).dataset.direction = this.sort.direction;

        animalTypes.forEach((animalType, index) => weights[animalType.uniqueId] = index);

        this.playerHand.changeItemsWeight(weights);
    }

    private sortByWeight() {
        if (this.sort.type == 'weight') {
            this.sort.direction = this.sort.direction == 'asc' ? 'desc' : 'asc';
        } else {
            this.sort.type = 'weight';
            this.sort.direction = 'asc';
        }
        this.updateHandWeights();
    }
    private sortByGender() {
        if (this.sort.type == 'gender') {
            this.sort.direction = this.sort.direction == 'asc' ? 'desc' : 'asc';
        } else {
            this.sort.type = 'gender';
            this.sort.direction = 'asc';
        }
        this.updateHandWeights();
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

    private seen() {
        if(!(this as any).checkAction('seen')) {
            return;
        }

        this.takeAction('seen');
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

    private chooseOpponent(playerId: number) {
        if(!(this as any).checkAction('chooseOpponent')) {
            return;
        }

        this.takeAction('chooseOpponent', {
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

    private reorderTopDeck() {
        if(!(this as any).checkAction('reorderTopDeck')) {
            return;
        }

        const base64 = btoa(JSON.stringify(this.topDeckOrder));

        this.takeAction('reorderTopDeck', {
            reorderTopDeck: base64
        });
    }
    
    public tableCardSelected(id: number): void {
        this.replaceOnTopDeck(id);
    }

    private replaceOnTopDeck(id: number) {
        if(!(this as any).checkAction('replaceOnTopDeck')) {
            return;
        }
        
        this.takeAction('replaceOnTopDeck', {
            id
        });
    }

    private skipReplaceOnTopDeck() {
        if(!(this as any).checkAction('skipReplaceOnTopDeck')) {
            return;
        }

        this.takeAction('skipReplaceOnTopDeck');
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
        const helpDialog = new ebg.popindialog();
        helpDialog.create( 'noahHelpDialog' );
        helpDialog.setTitle( _("Cards help") );
        
        var html = `
        <div id="help-popin">
            <h1>${_("Animal traits")}</h1>
            <div class="help-section help-animals">
                <table>`;
            ANIMALS_WITH_TRAITS.forEach(number => html += `<tr><td><div id="animal${number}" class="animal"></div></td><td>${getAnimalTooltip(number, this.isSoloMode())}</td></tr>`);
            html += `</table>
            </div>
            <h1>${_("Bonus animal traits")}</h1>
            <div class="help-section help-animals">
                <table>`;
            BONUS_ANIMALS_WITH_TRAITS.forEach(number => html += `<tr><td><div id="animal${number}" class="animal"></div></td><td>${getAnimalTooltip(number, this.isSoloMode())}</td></tr>`);
            html += `</table>
            </div>
        </div>`;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();
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

    private toggleBubbleGiveCards(cardId: number) {
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
            ['handCount', 1],
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
            this.playerHand.removeFromStockById(''+animal.id, `overall_player_board_${notif.args.toPlayerId}`);
            const bubble = document.getElementById(`${this.playerHand.container_div.id}_item_${animal.id}`)?.getElementsByClassName('choose-opponent-discussion_bubble')?.[0];
            bubble?.parentElement.removeChild(bubble);
        } else if (this.getPlayerId() == notif.args.toPlayerId) {
            const animal = notif.args._private[this.getPlayerId()].animal;
            this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id, `overall_player_board_${notif.args.playerId}`);
        }
    }

    notif_animalGivenFromFerry(notif: Notif<NotifAnimalGivenFromFerryArgs>) {
        if (!notif.args.toPlayerId) { // lion in solo mode
            const animal = notif.args.animal;

            this.table.removeAnimalToDeck(animal);
        } else {

            if (this.getPlayerId() == notif.args.toPlayerId) {
                const animal = notif.args.animal;
                this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id);
            }
            this.table.removeFirstAnimalFromFerry();
        }
    }

    notif_departure(notif: Notif<NotifDepartureArgs>) {
        this.table.departure(notif.args.position, notif.args.topFerry, notif.args.newFerry, notif.args.remainingFerries, notif.args.sentFerries);
    }
    
    notif_removedCard(notif: Notif<NotifRemovedCardArgs>) {
        this.playerHand.removeFromStockById(''+notif.args.animal.id, notif.args.fromPlayerId  ? 'overall_player_board_'+notif.args.fromPlayerId : undefined);
    }
    
    notif_newCard(notif: Notif<NotifNewCardArgs>) {
        const animal = notif.args.animal;
        this.playerHand.addToStockWithId(getUniqueId(animal), ''+animal.id, notif.args.fromPlayerId ? 'overall_player_board_'+notif.args.fromPlayerId : undefined);
    }
    
    notif_handCount(notif: Notif<NotifHandCountArgs>) {
        Object.keys(notif.args.handCount).forEach(key => {
            const playerId = Number(key);
            const count = notif.args.handCount[playerId];            
            // set count to player panel counter
            this.handCounters[playerId].toValue(count);
        });
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
                    args.animalName = `<strong style="color: ${this.getAnimalColor(args.animal?.gender ?? 'black')}">${_(args.animalName)}</strong>`;
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}