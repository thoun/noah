<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function canLoadAnimal(object $newAnimal) {
        $ferry = $this->getFerry($this->getNoahPosition());

        $currentWeight = $ferry->getCurrentWeight();
        $maxWeight = $ferry->getMaxWeight($newAnimal->power == POWER_REDUCE_MAX_WEIGHT);

        if ($currentWeight + $newAnimal->weight > $maxWeight) {
            return false;
        }

        $animalCount = count($ferry->animals);
        // gender must always be the same as 2 cards before
        if ($animalCount >= 2 && $newAnimal->gender != $ferry->animals[$animalCount - 2]->gender) {
            return false;
        }

        // on roomates ferry, every animal must be of different race
        if ($ferry->roomates) {
            foreach($ferry->animals as $animal) {
                if ($animal->type == $newAnimal->type) {
                    return false;
                }
            }
        }

        return true;
    }
    
    function argLoadAnimal() {
        $playerId = self::getActivePlayerId();

        $animals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId));

        $selectableAnimals = [];
        foreach($animals as $animal) {
            if ($this->canLoadAnimal($animal)) {
                $selectableAnimals[] = $animal;
            }
        }
    
        return [
            'selectableAnimals' => $selectableAnimals,
        ];
    }

    function getPossiblePositions() {
        $currentPosition = $this->getNoahPosition();

        $possiblePositions = [];

        $possiblePositionsFromActualPlace = [];
        $nextMove = intval($this->getGameStateValue(NOAH_NEXT_MOVE));
        if ($nextMove == 0) {
            $possiblePositionsFromActualPlace = [$currentPosition];
        } else if ($nextMove == 1) {
            $possiblePositionsFromActualPlace = [
                ($currentPosition + 2) % 5,
                ($currentPosition + 3) % 5,
            ];
        } else if ($nextMove == 2) {
            $possiblePositionsFromActualPlace = [
                ($currentPosition + 1) % 5,
                ($currentPosition + 4) % 5,
            ];
        }

        foreach($possiblePositionsFromActualPlace as $possiblePosition) {
            if (intval($this->ferries->countCardInLocation('table', $possiblePosition)) > 0) {
                $possiblePositions[] = $possiblePosition;
            }
        }

        return $possiblePositions;
    }

    function argChoosePlayerToLookCards() {
        $playerId = intval(self::getActivePlayerId());
        $players = $this->getOrderedPlayers($playerId);
        $opponents = array_values(array_filter($players, function($player) use ($playerId) { return $player->id != $playerId; }));
        $opponentsIds = array_map(function($player) { return $player->id; }, $opponents);

        return [
            'opponentsIds' => $opponentsIds,
        ];
    }

    function argViewCards() {
        $opponentId = intval(self::getGameStateValue(LOOK_OPPONENT_HAND));
        $playerHand = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $opponentId));

        return [
            'opponentId' => $opponentId,
            'animals' => $playerHand,
        ];
    }

    function argMoveNoah() {
        $possiblePositions = $this->getPossiblePositions();

        return [
            'possiblePositions' => $possiblePositions,
        ];
    }

    function getNumberOfCardsToGive(int $playerId) {
        return min(
            intval($this->ferries->countCardInLocation('discard')) + 1,
            intval($this->animals->countCardInLocation('hand', $playerId))
        );
    }

    function argOptimalLoading() {
        $playerId = self::getActivePlayerId();

        $number = $this->getNumberOfCardsToGive($playerId);

        return [
            'number' => $number,
        ];
    }
}