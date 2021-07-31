<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function loadAnimal(int $id) {
        self::checkAction('loadAnimal');
        
        $animal = $this->getAnimalFromDb($this->animals->getCard($id));

        if (!$this->canLoadAnimal($animal)) {
            throw new Error("Can't load this animal");
        }

        $position = $this->getNoahPosition();
        $location = 'table'.$position;
        $animalCount = intval($this->animals->countCardInLocation($location));
        $this->animals->moveCard($id, 'deck', $location, $animalCount);

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
          
        self::setGameStateValue(NOAH_NEXT_MOVE, $animal->power == DONT_MOVE_NOAH ? 0 : $animal->gender);
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

    public function giveCards($TODO) {
        self::checkAction('giveCards'); 
        
        // TODO

        $this->gamestate->nextState('nextPlayer');
    }
}
