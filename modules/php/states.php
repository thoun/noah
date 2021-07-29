<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNextPlayer() {     
        $playerId = self::getActivePlayerId();

        //self::incStat(1, 'turnsNumber');
        //self::incStat(1, 'turnsNumber', $playerId);

        if ($this->isEndOfRound()) {
            $this->gamestate->nextState('endRound');
        } else {
            if (intval(self::getGameStateValue(PAIR_PLAY_AGAIN)) == 0) {
                $this->activeNextPlayer();       
                $playerId = self::getActivePlayerId();
            } else {
                self::setGameStateValue(PAIR_PLAY_AGAIN, 0);
            }

            self::giveExtraTime($playerId);

            $this->gamestate->nextState('nextPlayer');
        }
    }
}
