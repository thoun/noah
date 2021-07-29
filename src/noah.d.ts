
interface Animal {
    id: number;
    type: number; // race
    subType: number; // gender
    location: string;
    location_arg: number;
    weight: number;
    points: number;
}

interface Ferry {
    animals: Animal[];
}

interface NoahPlayer extends Player {
    playerNo: number;
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
    handAnimals: Animal[];

    turnNumber: number;
    variant: boolean;
}

interface NoahGame extends Game {
}

interface LoadAnimalArgs {
    selectableAnimals: Animal[];
}

interface MoveNoahArgs {
    destination: number;
}

interface NotifAnimalLoadedArgs {
    animal: Animal;
    position: number;
}

interface NotifNoahMovedArgs {
    position: number;
}