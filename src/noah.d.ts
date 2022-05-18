
interface Animal {
    id: number;
    type: number; // race
    gender: number;
    location: string;
    location_arg: number;
    weight: number;
    points: number;
    power: number;
}

interface Ferry {
    id: number;
    location: string;
    location_arg: number;
    animals: Animal[];
    roomates: boolean;
}

interface HandSort {
    type: 'weight' | 'gender',
    direction: 'asc' | 'desc',
    currentWeights: any
}

interface AnimalTypeForSorting {
    uniqueId: number;
    gender: number;
    weight: number;
}

interface NoahPlayer extends Player {
    handCount: number;
}

/**
 * Your game interfaces
 */

interface NoahGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: NoahPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    ferries: Ferry[];
    topFerry: Ferry;
    noahPosition: number;
    remainingFerries: number;
    sentFerries: number;
    remainingAnimals: number;

    handAnimals: Animal[];

    roundNumber: number;
    variant: boolean;
    solo: boolean;
    WEIGHTS: {
        [animalId: number]: number;
    }
}

interface NoahGame extends Game {
    gamedatas: NoahGamedatas;
    moveNoah(destination: number): void;
    tableCardSelected(id: number): void;
    setTooltip(id: string, html: string): void;
}

interface EnteringLoadAnimalArgs {
    selectableAnimals: Animal[];
}

interface EnteringChooseWeightArgs {
    weightForDeparture: number;
}

interface EnteringChooseOpponentArgs {
    opponentsIds: number[];
    viewCards: boolean;
    exchangeCard: boolean;
    giveCardFromFerry: boolean;
}

interface EnteringMoveNoahArgs {
    possiblePositions: number[];
}

interface EnteringOptimalLoadingGiveCardsArgs {
    number: number;
    opponentsIds: number[];
}

interface EnteringLookCardsArgs {
    opponentId: number;
    animals: Animal[];
}

interface EnteringReorderTopDeckArgs {
    topCards: Animal[];
}

interface EnteringReplaceOnTopDeckArgs {
    animals: Animal[];
}

interface NotifPointsArgs {
    playerId: number;
    points: number;
}

interface MoveNoahArgs {
    possibleDestinations: number[];
}

interface NotifAnimalLoadedArgs {
    playerId: number;
    animal: Animal;
    position: number;
}

interface NotifFerryAnimalsTakenArgs {
    playerId: number;
    animals: Animal[];
    position: number;
}

interface NotifNoahMovedArgs {
    position: number;
}

interface NotifNewRoundArgs {
    ferries: Ferry[];
}

interface NotifNewHandArgs {
    animals: Animal[];
    keepCurrentHand: boolean;
    remainingAnimals: number;
}

interface NotifAnimalGivenArgs {
    playerId: number;
    toPlayerId: number;
    _private?: { [playerId: number]: {
        animal: Animal;
    }};
}

interface NotifAnimalGivenFromFerryArgs {
    playerId: number;
    toPlayerId?: number;
    animal: Animal;
}

interface NotifDepartureArgs {
    position: number;
    newFerry: Ferry;
    topFerry: Ferry;
    remainingFerries: number;
    sentFerries: number;
}

interface NotifRemovedCardArgs {
    playerId: number;
    animal: Animal;
    fromPlayerId?: number;
}

interface NotifNewCardArgs {
    animal: Animal;
    fromPlayerId?: number;
}

interface NotifHandCountArgs {
    handCount: {[playerId: number]: number};
}