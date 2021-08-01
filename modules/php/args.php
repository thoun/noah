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
        $maxWeight = $ferry->getMaxWeight();

        if ($currentWeight + $newAnimal->weight > $maxWeight) {
            return false;
        }

        $animalCount = count($ferry->animals);
        if ($animalCount >= 2) {
            return $newAnimal->gender == $ferry->animals[$animalCount - 2]->gender; // gender must always be the same as 2 cards before
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
        $position = $this->getNoahPosition();

        $nextMove = intval($this->getGameStateValue(NOAH_NEXT_MOVE));
        if ($nextMove == 1) {
            return [
                ($position + 2) % 5,
                ($position + 3) % 5,
            ];
        } else if ($nextMove == 2) {
            return [
                ($position + 1) % 5,
                ($position + 4) % 5,
            ];
        }

        return null;
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
            intval($this->animals->countCardInLocation('hand', $playerId)),
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