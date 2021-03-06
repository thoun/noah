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
 * gameoptions.inc.php
 *
 * Noah game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in noah.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */
$game_options = [

    /* note: game variant ID should start at 100 (ie: 100, 101, 102, ...). The maximum is 199.*/
    100 => [
        'name' => totranslate('Variant'),
        'values' => [
            1 => [
                'name' => totranslate('Disabled'),
                'description' => totranslate("Game stops after 3 rounds."),
            ],
            2 => [
                'name' => totranslate('Enabled'),
                'description' => totranslate("Instead of playing 3 rounds, the game stops when a player reaches or goes over 26."),
                'tmdisplay' => totranslate('Variant (end at 26 or more)'),
            ],
        ],
        'default' => 1,
        /*'displaycondition' => [[
            'type' => 'minplayers',
            'value' => 2,
        ]],*/
    ],

    101 => [
        'name' => totranslate('Use bonus card : Frog'),
        'values' => [
            1 => [
                'name' => totranslate('Disabled'),
            ],
            2 => [
                'name' => totranslate('Enabled'),
                'description' => totranslate("Frog cards replace Snail cards."),
                'tmdisplay' => totranslate('Use bonus card : Frog'),
            ],
        ],
        'default' => 1,
        'startcondition' => [
            2 => [[
                'type' => 'minplayers',
                'value' => 2,
                'message' => totranslate('Bonus cards cannot be used with Solo mode.'),
            ]]
        ],
    ],

    102 => [
        'name' => totranslate('Use bonus card : Crocodile'),
        'values' => [
            1 => [
                'name' => totranslate('Disabled'),
            ],
            2 => [
                'name' => totranslate('Enabled'),
                'description' => totranslate("Crocodile cards replace Donkey cards."),
                'tmdisplay' => totranslate('Use bonus card : Crocodile'),
            ],
        ],
        'default' => 1,
        'startcondition' => [
            2 => [[
                'type' => 'minplayers',
                'value' => 2,
                'message' => totranslate('Bonus cards cannot be used with Solo mode.'),
            ]]
        ],
    ],

    103 => [
        'name' => totranslate('Use bonus card : Roomates'),
        'values' => [
            1 => [
                'name' => totranslate('Disabled'),
            ],
            2 => [
                'name' => totranslate('Enabled'),
                'description' => totranslate("In the Ark, it is impossible to place twice the same animal, whether male or female"),
                'tmdisplay' => totranslate('Use bonus card : Roomates'),
            ],
        ],
        'default' => 1,
        'startcondition' => [
            2 => [[
                'type' => 'minplayers',
                'value' => 2,
                'message' => totranslate('Bonus cards cannot be used with Solo mode.'),
            ]]
        ],
    ],

    120 => [
        'name' => totranslate('Solo mode'),
        'values' => [
            3 => [
                'name' => totranslate('Beginner'),
                'description' => totranslate("Remove all animals marked 4+ and 5+."),
            ],
            4 => [
                'name' => totranslate('Advanced'),
                'description' => totranslate("Remove all animals marked 5+."),
            ],
            5 => [
                'name' => totranslate('Expert'),
                'description' => totranslate("Play with all animals."),
            ],
        ],
        'default' => 3,
        /*'displaycondition' => [[
            'type' => 'maxplayers',
            'value' => 1,
        ]]*/
    ],
];

$game_preferences = [
    201 => [
        'name' => totranslate('Hand position'),
        'needReload' => false,
        'values' => [
            1 => [ 'name' => totranslate('Above table')],
            2 => [ 'name' => totranslate('Under table')],
        ],
        'default' => 1
    ],
];


