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
 * material.inc.php
 *
 * Noah game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once('modules/php/objects/animal.php');

$this->ANIMALS = [ // (int $cardsByGender, int $weight, int $points, int $power = 0)
    SNAIL => new AnimalCard([2 => 3, 3 => 3, 4 => 3, 5 => 5], 1, 2, POWER_HERMAPHRODITE),
    GIRAFFE => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 8, 0, POWER_LOOK_CARDS),
    DONKEY => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 2], 6, 1, POWER_DONT_MOVE_NOAH),
    LION => new AnimalCard([2 => 1, 3 => 1, 4 => 2, 5 => 2], 5, 1, POWER_EXCHANGE_CARD),
    WOODPECKER => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 0, 2, POWER_REDUCE_MAX_WEIGHT),
    CAT => new AnimalCard([2 => 2, 3 => 2, 4 => 3, 5 => 3], 2, 1),
    ELEPHANT => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 10, 0),
    PANDA => new AnimalCard([2 => 1, 3 => 1, 4 => 2, 5 => 3], 4, 4),
    PARROT => new AnimalCard([2 => 2, 3 => 2, 4 => 2, 5 => 3], 0, 2),
    KANGAROO => new AnimalCard([2 => 2, 3 => 2, 4 => 3, 5 => 3], 3, 1),
    RHINOCEROS => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 9, 0),
    BEAR => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 7, 0),

    // Bonus cards
    FROG => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 1, 5, POWER_ADJUSTABLE_WEIGHT),
    CROCODILE => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 6, 0, POWER_CROCODILE),
];
