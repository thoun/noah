
interface Animal {
    id: number;
    type: number; // race
    gender: number;
    location: string;
    location_arg: number;
    weight: number;
    points: number;
}

interface Ferry {
    id: number;
    location: string;
    location_arg: number;
    animals: Animal[];
    roomates: boolean;
}

interface NoahPlayer extends Player {
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
    noahPosition: number;
    remainingFerries: number;

    handAnimals: Animal[];

    roundNumber: number;
    variant: boolean;
}

interface NoahGame extends Game {
}

interface EnteringLoadAnimalArgs {
    selectableAnimals: Animal[];
}

interface NotifPointsArgs {
    playerId: number;
    points: number;
}

interface MoveNoahArgs {
    possibleDestinations: number[];
}

interface NotifAnimalLoadedArgs {
    animal: Animal;
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
}

interface NotifAnimalGivenArgs {
    playerId: number;
    toPlayerId: number;
    _private?: {
        animal: Animal
    };
}

interface NotifDepartureArgs {
    position: number;
    newFerry: boolean;
    remainingFerries: number;
}