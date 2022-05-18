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
        $this->setGameStateValue(ROUND_NUMBER, intval($this->getGameStateValue(ROUND_NUMBER)) + 1);

        // reset cards
        $this->animals->moveAllCardsInLocation(null, 'deck');
        $this->animals->shuffle('deck');
        $this->ferries->moveAllCardsInLocation(null, 'deck');
        $this->ferries->shuffle('deck');

        $this->setInitialCardsAndResources($this->getPlayersIds());

        // TODO TEMP
        //$this->debugSetup();

        $this->gamestate->nextState('');
    }

    function stChooseOpponent() {
        if (count($this->getPlayersIds()) == 2) {
            $opponentId = $this->getOpponentId($this->getActivePlayerId());
            if (intval($this->getGameStateValue(LOOK_OPPONENT_HAND)) == 1) {
                $this->applyLookCards($opponentId);
            } else if (intval($this->getGameStateValue(EXCHANGE_CARD)) == 1) {
                $this->applyExchangeCard($opponentId);
            } else if (intval($this->getGameStateValue(GIVE_CARD_FROM_FERRY)) == 1) {
                $this->applyGiveCardFromFerry($opponentId);
            } 
        }
    }

    function stGiveCard() {
        $playerId = $this->getActivePlayerId();
        $opponentId = intval($this->getGameStateValue(EXCHANGE_CARD));

        $cardsInHand = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $opponentId));
        $removedCard = null;
        $cardsNumber = count($cardsInHand);
        if ($cardsNumber > 0) {
            $removedCard = $cardsInHand[bga_rand(1, $cardsNumber) - 1];
            $this->animals->moveCard($removedCard->id, 'hand', $playerId);
            $removedCards[$opponentId] = $removedCard;

            $this->notifyPlayer($opponentId, 'removedCard', clienttranslate('Card ${animalName} was removed from your hand'), [
                'playerId' => $opponentId,
                'animal' => $removedCard,
                'fromPlayerId' => $playerId,
                'animalName' => $this->getAnimalName($removedCard->type),
            ]);

            $this->notifyPlayer($playerId, 'newCard', clienttranslate('Card ${animalName} was picked from ${player_name2} hand'), [
                'playerId' => $playerId,
                'player_name2' => $this->getPlayerName($opponentId),
                'animal' => $removedCard,
                'fromPlayerId' => $opponentId,
                'animalName' => $this->getAnimalName($removedCard->type),
            ]);

            $this->notifyHandCount([$playerId, $opponentId]);
        }
    }

    function stMoveNoah() {
        if (intval($this->getGameStateValue(NOAH_NEXT_MOVE)) == 0) {
            $this->gamestate->nextState('checkOptimalLoading');
        }
    }

    function stOptimalLoading() {
        $ferry = $this->getFerry(intval($this->getGameStateValue(LAST_LOADED_ANIMAL_POSITION)));

        $ferryComplete = $ferry->getCurrentWeight() == $ferry->getMaxWeight();

        if (!$ferryComplete) {
            if ($this->isSoloMode()) {
                $this->gamestate->nextState('drawCards');
            } else {
                $this->gamestate->nextState('nextPlayer');
            }
        } else {
            $this->applyOptimalLoading();

            $playerId = $this->getActivePlayerId();

            if ($this->isSoloMode()) {
                $this->gamestate->nextState('drawCards');
            } else {
                if ($this->getNumberOfCardsToGive($playerId) == 0) {
                    $this->gamestate->nextState('nextPlayer');
                } else {
                    $this->gamestate->nextState('giveCards');
                }
            }
        }
    }

    function applyOptimalLoading() {
        $position = intval($this->getGameStateValue(LAST_LOADED_ANIMAL_POSITION));
        $this->animals->moveAllCardsInLocation('table'.$position, 'discard');
        $this->ferries->moveAllCardsInLocation('table', 'discard', $position);
        $remainingFerries = intval($this->ferries->countCardInLocation('deck'));
        $newFerry = null;
        if ($remainingFerries > 0) {
            $newFerry = $this->getFerryFromDb($this->ferries->pickCardForLocation('deck', 'table', $position));
            $remainingFerries--;
        }

        $topFerryDb = $this->ferries->getCardOnTop('deck');
        $topFerry = $topFerryDb != null ? $this->getFerryFromDb($topFerryDb) : null;
        
        $playerId = $this->getActivePlayerId();
        $this->notifyAllPlayers('departure', clienttranslate('${player_name} completes ferry'), [
            'playerId' => $playerId,
            'player_name' => $this->getActivePlayerName(),
            'position' => $position,
            'newFerry' => $newFerry,
            'remainingFerries' => $remainingFerries,
            'sentFerries' => intval($this->ferries->countCardInLocation('discard')),
            'topFerry' => $topFerry,
        ]);

        $this->incStat(1, 'optimalLoading');
        $this->incStat(1, 'optimalLoading', $playerId);

        if ($this->isSoloMode()) {
            $cardsToDiscard = intval($this->ferries->countCardInLocation('discard'));
            $this->animals->pickCardsForLocation($cardsToDiscard, 'deck', 'discard');
        
            $this->notifyPlayer($playerId, 'remainingAnimals', '', [
                'remainingAnimals' => intval($this->animals->countCardInLocation('deck')),
            ]);
        }
    }

    function stDrawCards() {
        $playerId = $this->getActivePlayerId();
        $number = intval($this->getGameStateValue(SOLO_DRAW_CARDS));
        
        $animals = $this->getAnimalsFromDb($this->animals->pickCardsForLocation($number, 'deck', 'hand', $playerId));
        $this->notifyPlayer($playerId, 'newHand', '', [
            'playerId' => $playerId,
            'animals' => $animals,
            'keepCurrentHand' => true,
            'remainingAnimals' => intval($this->animals->countCardInLocation('deck')),
        ]);

        $this->notifyHandCount([$playerId]);

        $this->setGameStateValue(SOLO_DRAW_CARDS, 1);

        $this->gamestate->nextState('nextPlayer');
    }

    function stNextPlayerForSoloMode(int $playerId) {
        if (intval($this->animals->countCardInLocation('deck')) == 0 && intval($this->animals->countCardInLocation('hand')) == 0) {
            // win !
            $this->setPlayerScore($playerId, 1);
            $this->gamestate->nextState('endGame');
        } else if (count($this->getSelectableAnimals($playerId)) == 0) {
            // loose...
            $this->setPlayerScore($playerId, 0);
            $this->gamestate->nextState('endGame');
        } else {
            // keep going
            $this->giveExtraTime($playerId);
            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stNextPlayerForMultiplayer(int $playerId) {
        if ($this->isEndOfRound()) {
            $this->gamestate->nextState('endRound');
        } else {
            if (intval($this->getGameStateValue(PAIR_PLAY_AGAIN)) == 0) {
                $this->activeNextPlayer();       
                $playerId = $this->getActivePlayerId();
            } else {
                $this->setGameStateValue(PAIR_PLAY_AGAIN, 0);
                
                $this->notifyAllPlayers('log', clienttranslate('${player_name} loaded an animal of the same race as the last animal played on the ferry, allowing to play again!'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                ]);
            }

            $this->giveExtraTime($playerId);

            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stNextPlayer() {     
        $playerId = $this->getActivePlayerId();

        $this->incStat(1, 'turnsNumber');
        $this->incStat(1, 'turnsNumber', $playerId);

        if ($this->isSoloMode()) {
            $this->stNextPlayerForSoloMode($playerId);
        } else {
            $this->stNextPlayerForMultiplayer($playerId);
        }
    }

    function stEndRound() {
        $roundNumber = intval($this->getGameStateValue(ROUND_NUMBER));

        $this->notifyAllPlayers('log', clienttranslate('End of round ${roundNumber}'), [
            'roundNumber' => $roundNumber,
        ]);

        // count points remaining in hands
        $playersIds = $this->getPlayersIds();
        foreach($playersIds as $playerId) {
            $animals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId));
            $points = array_reduce($animals, fn($carry, $item) => $carry + $item->points, 0);
            $this->incPlayerScore($playerId, $points);

            $this->notifyAllPlayers('log', clienttranslate('${player_name} adds ${handPoints} points from remaining hand cards, going to ${totalPoints} points'), [
                'player_name' => $this->getPlayerName($playerId),
                'handPoints' => $points,
                'totalPoints' => -$this->getPlayerScore($playerId),
            ]);
        }
        
        // player with highest score starts        
        $sql = "SELECT player_id FROM player where player_score=(select min(player_score) from player) limit 1";
        $minScorePlayerId = $this->getUniqueValueFromDB($sql);
        $this->gamestate->changeActivePlayer($minScorePlayerId);
        $this->giveExtraTime($minScorePlayerId);

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
