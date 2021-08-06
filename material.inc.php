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
    1 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 1, 2, POWER_HERMAPHRODITE), // The Snail
    2 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 8, 0, POWER_LOOK_CARDS), // The Giraffe // TODO power
    3 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 6, 1, POWER_DONT_MOVE_NOAH), // The Mule / donkey?
    4 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 5, 1, POWER_EXCHANGE_CARD), // The Lion // TODO power
    5 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 0, 2, POWER_REDUCE_MAX_WEIGHT), // The Woodpecker
    6 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 2, 1), // Cat
    7 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 10, 0), // Elephant
    8 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 4, 4), // Panda
    9 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 0, 2), // Perrot
    10 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 3, 1), // Kangaroo
    11 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 9, 0), // Rhinoceros
    12 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 7, 0), // Bear
    // TODO check if other animals

    // Bonus cards
    20 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 1, 5, POWER_ADJUSTABLE_WEIGHT), // Frog // TODO power
    21 => new AnimalCard([2 => 8, 3 => 8, 4 => 8, 5 => 8] /* TOCHECK*/, 6, 0, POWER_CROCODILE), // Crocodile // TODO crocodile teeth power
];
