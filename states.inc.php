<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Noah implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Noah game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: $this->checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once("modules/php/constants.inc.php");

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_START_ROUND ]
    ],

    ST_NEXT_PLAYER => [
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => [
            "nextPlayer" => ST_PLAYER_LOAD_ANIMAL, 
            "endRound" => ST_END_ROUND,
            "endGame" => ST_END_GAME, // for solo mode
        ],
    ],
   
    // Final state.
    // Please do not modify.
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];


$playerActionsGameStates = [

    ST_PLAYER_LOAD_ANIMAL => [
        "name" => "loadAnimal",
        "description" => clienttranslate('${actplayer} must load an animal'),
        "descriptionmyturn" => clienttranslate('${you} must load an animal'),
        "descriptionimpossible" => clienttranslate('${actplayer} must take back all animals present on the ferry'),
        "descriptionmyturnimpossible" => clienttranslate('${you} must take back all animals present on the ferry'),
        "type" => "activeplayer",
        "args" => "argLoadAnimal",
        "possibleactions" => [ 
            "loadAnimal",
            "takeAllAnimals",
        ],
        "transitions" => [
            "loadAnimal" => ST_PLAYER_LOAD_ANIMAL,
            "chooseGender" => ST_PLAYER_CHOOSE_GENDER,
            "chooseWeight" => ST_PLAYER_CHOOSE_WEIGHT,
            "chooseOpponent" => ST_PLAYER_CHOOSE_OPPONENT,
            "reorderTopDeck" => ST_PLAYER_REORDER_TOP_DECK,
            "replaceOnTopDeck" => ST_PLAYER_REPLACE_ON_TOP_DECK,
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_GENDER => [
        "name" => "chooseGender",
        "description" => clienttranslate('${actplayer} must choose gender'),
        "descriptionmyturn" => clienttranslate('${you} must choose gender'),
        "type" => "activeplayer",  
        "possibleactions" => [ 
            "setGender",
        ],
        "transitions" => [
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_WEIGHT => [
        "name" => "chooseWeight",
        "description" => clienttranslate('${actplayer} must choose weight'),
        "descriptionmyturn" => clienttranslate('${you} must choose weight'),
        "type" => "activeplayer",    
        "args" => "argChooseWeight",  
        "possibleactions" => [ 
            "setWeight",
        ],
        "transitions" => [
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_REORDER_TOP_DECK => [
        "name" => "reorderTopDeck",
        "description" => clienttranslate('${actplayer} can reorder top deck cards'),
        "descriptionmyturn" => clienttranslate('${you} can reorder top deck cards'),
        "type" => "activeplayer",    
        "args" => "argReorderTopDeck",  
        "possibleactions" => [ 
            "reorderTopDeck",
        ],
        "transitions" => [
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_REPLACE_ON_TOP_DECK => [
        "name" => "replaceOnTopDeck",
        "description" => clienttranslate('${actplayer} can replace an animal on top of the deck'),
        "descriptionmyturn" => clienttranslate('${you} can replace an animal on top of the deck'),
        "type" => "activeplayer",  
        "args" => "argReplaceOnTopDeck",  
        "possibleactions" => [ 
            "replaceOnTopDeck",
            "skipReplaceOnTopDeck",
        ],
        "transitions" => [
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_OPPONENT => [
        "name" => "chooseOpponent",
        "description" => clienttranslate('${actplayer} must choose a player to look cards'),
        "descriptionmyturn" => clienttranslate('${you} must choose a player to look cards'),
        "descriptionexchange" => clienttranslate('${actplayer} must choose a player to exchange card'),
        "descriptionmyturnexchange" => clienttranslate('${you} must choose a player to exchange card'),
        "descriptiongive" => clienttranslate('${actplayer} must choose a player to give card'),
        "descriptionmyturngive" => clienttranslate('${you} must choose a player to give card'),
        "type" => "activeplayer",   
        "action" => "stChooseOpponent",      
        "args" => "argChooseOpponent",
        "possibleactions" => [
            "chooseOpponent",
        ],
        "transitions" => [
            "look" => ST_PLAYER_VIEW_CARDS,
            "exchange" => ST_PLAYER_GIVE_CARD,
            "moveNoah" => ST_PLAYER_MOVE_NOAH,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_VIEW_CARDS =>  [
        "name" => "viewCards",
    	"description" => clienttranslate('${actplayer} looks to chosen opponent cards'),
    	"descriptionmyturn" => clienttranslate('${you} look to chosen opponent cards'),
    	"type" => "activeplayer",
        "args" => "argViewCards",
    	"possibleactions" => [ "seen" ],
    	"transitions" => [ 
            "seen" => ST_PLAYER_MOVE_NOAH,
        ]
    ],

    ST_PLAYER_GIVE_CARD =>  [
        "name" => "giveCard",
    	"description" => clienttranslate('${actplayer} must give back a card to chosen opponent'),
    	"descriptionmyturn" => clienttranslate('${you} must give back a card to chosen opponent'),
    	"type" => "activeplayer",
        "action" => "stGiveCard",
    	"possibleactions" => [ "giveCard" ],
    	"transitions" => [ 
            "giveCard" => ST_PLAYER_MOVE_NOAH,
        ]
    ],

    ST_PLAYER_MOVE_NOAH => [
        "name" => "moveNoah",
        "description" => clienttranslate('${actplayer} must move Noah'),
        "descriptionmyturn" => clienttranslate('${you} must move Noah'),
        "type" => "activeplayer",  
        "action" => "stMoveNoah",      
        "args" => "argMoveNoah",
        "possibleactions" => [ 
            "moveNoah",
        ],
        "transitions" => [
            "checkOptimalLoading" => ST_OPTIMAL_LOADING,
            "endGame" => ST_END_GAME,
            "zombiePass" => ST_NEXT_PLAYER,
        ],
        "updateGameProgression" => true,
    ],

    ST_PLAYER_OPTIMAL_LOADING_GIVE_CARDS => [
        "name" => "optimalLoadingGiveCards",
        "description" => clienttranslate('${actplayer} must give ${number} card(s) from your hand to opponents'),
        "descriptionmyturn" => clienttranslate('${you} must give ${number} card(s) from your hand to opponents'),
        "type" => "activeplayer",      
        "args" => "argOptimalLoadingGiveCards",
        "possibleactions" => [ 
            "giveCards",
        ],
        "transitions" => [
            "drawCards" => ST_DRAW_CARDS,
            "nextPlayer" => ST_NEXT_PLAYER,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],
];


$gameGameStates = [
    ST_START_ROUND => [
        "name" => "startRound",
        "description" => "",
        "type" => "game",
        "action" => "stStartRound",
        "transitions" => [ 
            "" => ST_PLAYER_LOAD_ANIMAL,
        ],
        "updateGameProgression" => true,
    ],

    ST_DRAW_CARDS => [
        "name" => "drawCards",
        "description" => "",
        "type" => "game",
        "action" => "stDrawCards",
        "transitions" => [ 
            "nextPlayer" => ST_NEXT_PLAYER,
            "zombiePass" => ST_NEXT_PLAYER,
        ],
    ],

    ST_OPTIMAL_LOADING => [
        "name" => "optimalLoading",
        "description" => "",
        "type" => "game",  
        "action" => "stOptimalLoading",
        "transitions" => [
            "giveCards" => ST_PLAYER_OPTIMAL_LOADING_GIVE_CARDS,
            "drawCards" => ST_DRAW_CARDS,
            "nextPlayer" => ST_NEXT_PLAYER,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_END_ROUND => [
        "name" => "endRound",
        "description" => "",
        "type" => "game",
        "action" => "stEndRound",
        "transitions" => [ 
            "newRound" => ST_START_ROUND,
            "endGame" => ST_END_GAME
        ],
    ],
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;
