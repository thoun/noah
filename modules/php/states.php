<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stStartRound() {
        
        self::setGameStateValue(ROUND_NUMBER, $roundNumber + 1);

        // reset cards
        $this->animals->moveAllCardsInLocation(null, 'deck');
        $this->animals->shuffle('deck');
        $this->ferries->moveAllCardsInLocation(null, 'deck');
        $this->ferries->shuffle('deck');

        $this->setInitialCardsAndResources($this->getPlayersIds());

        $this->gamestate->nextState('');
    }

    function stMoveNoah() {
        if (intval($this->getGameStateValue(NOAH_NEXT_MOVE)) == 0) {
            $this->gamestate->nextState('checkOptimalLoading');
        }
    }

    function stOptimalLoading() {
        $ferry = $this->getFerry($this->getNoahPosition());

        $ferryComplete = $ferry->getCurrentWeight() == $ferry->getMaxWeight();

        if (!$ferryComplete) {
            $this->gamestate->nextState('nextPlayer');
        } else {
            $playerId = self::getActivePlayerId();

            if (intval($this->animals->countCardInLocation('hand', $playerId)) == 0) {
                $this->gamestate->nextState('nextPlayer');
            }
        }
    }

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

    function stEndRound() {
        // count points remaining in hands
        $playersIds = $this->getPlayersIds();
        foreach($playersIds as $playerId) {
            $animals = $this->getAnimalsFromDb($this->animals->countCardInLocation('hand', $playerId));
            $points = array_reduce($animals, function ($carry, $item) { return $carry + $item->points; });
            $this->incPlayerScore($playerId, $points);
        }
        
        // player with highest score starts        
        $sql = "SELECT player_id FROM player where player_score=(select min(player_score) from player) limit 1";
        $minScorePlayerId = self::getUniqueValueFromDB($sql);
        $this->gamestate->changeActivePlayer($minScorePlayerId);
        self::giveExtraTime($minScorePlayerId);

        $roundNumber = intval(self::getGameStateValue(ROUND_NUMBER));

        $endGame = null;
        if ($this->isVariant()) {
            $endGame = $this->getMaxPlayerScore() >= 26;
        } else {
            $endGame = $roundNumber >= 3;
        }

        if ($endGame) {
            $this->gamestate->nextState('endGame');
        } else {
            $this->gamestate->nextState('newRound');
        }
    }
}
