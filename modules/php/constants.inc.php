<?php

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_START_ROUND', 10);

define('ST_PLAYER_LOAD_ANIMAL', 20);
define('ST_PLAYER_CHOOSE_GENDER', 31);
define('ST_PLAYER_CHOOSE_PLAYER_TO_LOOK_CARDS', 32);
define('ST_PLAYER_VIEW_CARDS', 33);

define('ST_PLAYER_MOVE_NOAH', 50);

define('ST_PLAYER_OPTIMAL_LOADING', 60);

define('ST_NEXT_PLAYER', 90);

define('ST_END_ROUND', 95);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Variables
 */
define('NOAH_POSITION', 'NOAH_POSITION');
define('ROUND_NUMBER', 'ROUND_NUMBER');
define('PAIR_PLAY_AGAIN', 'PAIR_PLAY_AGAIN');
define('NOAH_NEXT_MOVE', 'NOAH_NEXT_MOVE'); // 0 : don't move, 1 : male, 2 : female
define('LAST_LOADED_ANIMAL_POSITION', 'LLAD');
define('LOOK_OPPONENT_HAND', 'LOOK_OPPONENT_HAND');

define('OPTION_VARIANT', 'OPTION_VARIANT');
define('OPTION_FROG', 'OPTION_FROG');
define('OPTION_CROCODILE', 'OPTION_CROCODILE');
define('OPTION_ROOMATES', 'OPTION_ROOMATES');

/*
 * Global variables
 */
/*define('APPLY_EFFECT_CONTEXT', 'ApplyEffectContext');
define('COMPLETED_PROJECTS', 'CompletedProjects');*/

/*
 * Powers
 */
define('POWER_HERMAPHRODITE', 1);
define('POWER_LOOK_CARDS', 2);
define('POWER_DONT_MOVE_NOAH', 3);
define('POWER_EXCHANGE_CARD', 4);
define('POWER_REDUCE_MAX_WEIGHT', 5);
define('POWER_ADJUSTABLE_WEIGHT', 20);
define('POWER_CROCODILE', 21);
?>
