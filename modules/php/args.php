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
        if ($ferry == null) {
            return false;
        }

        $currentWeight = $ferry->getCurrentWeight($newAnimal->power == POWER_CROCODILE);
        $maxWeight = $ferry->getMaxWeight($newAnimal->power == POWER_REDUCE_MAX_WEIGHT);

        if ($currentWeight + $newAnimal->weight > $maxWeight) {
            return false;
        }

        $animalCount = count($ferry->animals);
        // gender must always be the same as 2 cards before
        if ($animalCount >= 2 && $newAnimal->power != POWER_HERMAPHRODITE && $newAnimal->gender != $ferry->animals[$animalCount - 2]->gender) {
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

    function getSelectableAnimals(int $playerId) {
        $animals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId));

        $selectableAnimals = [];
        foreach($animals as $animal) {
            if ($this->canLoadAnimal($animal)) {
                $selectableAnimals[] = $animal;
            }
        }

        return $selectableAnimals;
    }
    
    function argLoadAnimal() {
        $playerId = $this->getActivePlayerId();

        $selectableAnimals = $this->getSelectableAnimals($playerId);
    
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

    function getWeightForDeparture() {
        $ferry = $this->getFerry($this->getNoahPosition());

        $currentWeight = $ferry->getCurrentWeight();
        $maxWeight = $ferry->getMaxWeight();
        $remainingWeight = $maxWeight - $currentWeight;

        if ($remainingWeight > 1 && $remainingWeight <= 5) {
            return $remainingWeight;
        } else {
            return null;
        }
    }

    function argChooseWeight() {
        return [
            'weightForDeparture' => $this->getWeightForDeparture(),            
        ];
    }

    function argChooseOpponent() {
        $playerId = intval($this->getActivePlayerId());
        $opponentsIds = $this->getOrderedOpponentsIds($playerId);

        return [
            'opponentsIds' => $opponentsIds,            
            'viewCards' => intval($this->getGameStateValue(LOOK_OPPONENT_HAND)) == 1,
            'exchangeCard' => intval($this->getGameStateValue(EXCHANGE_CARD)) == 1,
            'giveCardFromFerry' => intval($this->getGameStateValue(GIVE_CARD_FROM_FERRY)) == 1,
        ];
    }

    function argViewCards() {
        $opponentId = intval($this->getGameStateValue(LOOK_OPPONENT_HAND));
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
            intval($this->ferries->countCardInLocation('discard')),
            intval($this->animals->countCardInLocation('hand', $playerId))
        );
    }

    function argOptimalLoadingGiveCards() {
        $playerId = intval($this->getActivePlayerId());

        $opponentsIds = $this->getOrderedOpponentsIds($playerId);
        $number = $this->getNumberOfCardsToGive($playerId);

        return [
            'number' => $number,
            'opponentsIds' => $opponentsIds,
        ];
    }
    
    function argReorderTopDeck() {
        $topCards = $this->getAnimalsFromDb($this->animals->getCardsOnTop(3, 'deck'));

        return [
            'topCards' => $topCards,
        ];
    }

    private function getPossibleCardsToReplaceOnTopDeck(int $position) {
        $ferryAnimals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('table'.$position, null, 'location_arg'));
        $animalCount = count($ferryAnimals);

        // 2 or less, can replace any
        if ($animalCount <= 2) {
            return $ferryAnimals;
        }

        // same gender, can replace any
        if ($ferryAnimals[$animalCount - 1]->gender == $ferryAnimals[$animalCount - 2]->gender) {
            return $ferryAnimals;
        }

        // more than 2 and alternate gender, can replace first or last
        return [$ferryAnimals[0], $ferryAnimals[$animalCount - 1]];
    }
    
    function argReplaceOnTopDeck() {
        $animals = [];

        for ($position=0; $position<5; $position++) {
            $animals = array_merge($animals, $this->getPossibleCardsToReplaceOnTopDeck($position));
        }

        $currentPositionAnimals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('table'.$this->getGameStateValue(LAST_LOADED_ANIMAL_POSITION), null, 'location_arg'));
        $lionId = $currentPositionAnimals[count($currentPositionAnimals)-1]->id;

        $animals = array_values(array_filter($animals, fn($animal) => $animal->id != $lionId));

        return [
            'animals' => $animals,
        ];
    }

}