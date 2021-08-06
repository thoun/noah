<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in noah.action.php)
    */

    public function loadAnimal(int $id) {
        self::checkAction('loadAnimal');
        
        $animal = $this->getAnimalFromDb($this->animals->getCard($id));

        if (!$this->canLoadAnimal($animal)) {
            throw new Error("Can't load this animal");
        }

        $position = $this->getNoahPosition();
        $location = 'table'.$position;
        $animalsInFerry = $this->getAnimalsFromDb($this->animals->getCardsInLocation($location));
        $nbr = count($animalsInFerry);

        if ($nbr < 2 && $animal->power == POWER_HERMAPHRODITE) { // need to set gender
            $this->gamestate->nextState('chooseGender');
        } else {
            $this->applyLoadAnimal($id);
        }
    }

    function setGender(int $gender) {
        self::checkAction('setGender'); 
        
        $position = $this->getNoahPosition();
        $location = 'table'.$position;
        $animalsInFerry = $this->getAnimalsFromDb($this->animals->getCardsInLocation($location));
        $nbr = count($animalsInFerry);
        if ($nbr < 1 || $nbr > 2 || $animals[$nbr - 1]->power != POWER_HERMAPHRODITE) {
            throw new Error("No animal need to set gender");
        }

        $this->applySetGender($animals[$nbr - 1]->id, $gender);
        $this->applyLoadAnimal($animals[$nbr - 1]->id);
    }

    function applyLoadAnimal(int $id) {        
        $animal = $this->getAnimalFromDb($this->animals->getCard($id));
        $position = $this->getNoahPosition();
        $location = 'table'.$position;
        $animalCount = intval($this->animals->countCardInLocation($location));
        $this->animals->moveCard($id, $location, $animalCount);

        if ($animalCount > 0 && $animal->type == $this->getAnimalsFromDb($this->animals->getCardsInLocation($location, $animalCount-1))[0]->type) {
            self::setGameStateValue(PAIR_PLAY_AGAIN, 1);
        }
        
        $playerId = self::getActivePlayerId();

        self::notifyAllPlayers('animalLoaded', clienttranslate('${player_name} loads animal ${animalName}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'animal' => $animal,
            'position' => $position,
            'animalName' => $this->getAnimalName($animal->type),
        ]);

        if ($animal->power == POWER_CROCODILE) {
            $this->decPlayerScore(2);
        }
          
        self::setGameStateValue(LAST_LOADED_ANIMAL_POSITION, $position);
        self::setGameStateValue(NOAH_NEXT_MOVE, $animal->power == POWER_DONT_MOVE_NOAH ? 0 : $animal->gender);
        $this->gamestate->nextState('moveNoah');
    }

    public function moveNoah(int $destination) {
        self::checkAction('moveNoah'); 

        $possiblePositions = $this->getPossiblePositions();
        if (array_search($destination,  $possiblePositions) === false) {
            throw new Error("Invalid destination for Noah");
        }
        
        $playerId = self::getActivePlayerId();

        self::setGameStateValue(NOAH_POSITION, $destination);

        self::notifyAllPlayers('noahMoved', '', [
            'position' => $destination,
        ]);

        $this->gamestate->nextState('checkOptimalLoading');
    }

    public function giveCards(array $giveCardsTo) {
        self::checkAction('giveCards'); 

        $playerId = self::getActivePlayerId();

        if (count($giveCardsTo) != $this->getNumberOfCardsToGive($playerId)) {
            throw new Error("Invalid card count");
        }

        $handAnimals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId));

        foreach($giveCardsTo as $animalId => $toPlayerId) {
            if (!$this->array_some($handAnimals, function ($animal) use ($animalId) { return $animal->id == $animalId; })) {
                throw new Error("You can't give a card which is not in your hand");
            }
        }

        foreach($giveCardsTo as $animalId => $toPlayerId) {
            $this->animals->moveCard($animalId, 'hand', $toPlayerId);
            $animal = $this->array_find($handAnimals, function ($animal) use ($animalId) { return $animal->id == $animalId; });

            self::notifyAllPlayers('animalGiven', clienttranslate('${player_name} gives an animal to ${player_name2}'), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
                'toPlayerId' => $toPlayerId,
                'player_name2' => self::getPlayerNameById($toPlayerId),
                '_private' => [          // Using "_private" keyword, all data inside this array will be made private
                    'active' => [       // Using "active" keyword inside "_private", you select active player(s)
                        'animal' => $animal,
                    ],
                    $toPlayerId => [
                        'animal' => $animal,
                    ],
                ],
            ]);
        }

        $this->gamestate->nextState('nextPlayer');
    }
}
