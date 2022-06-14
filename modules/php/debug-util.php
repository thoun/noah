<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        //$this->DbQuery("UPDATE animal SET `card_location_arg` = card_location_arg + 200 where `card_type` = 1");
        //$this->debugSetPoints(19);
        /*$this->debugSetAnimalsInFerry(0, [
            $this->debugGetAnimalByType(1, 1),
            $this->debugGetAnimalByType(10, 2),
            $this->debugGetAnimalByType(1, 1),
        ]);*/
        //$this->debugSetAnimalInHand(2343492, 2, 2);
        //$this->debugSetAnimalInHand(2343492, 1, 0);

        $this->setTopDeckAnimals([
            [11, 2], [11, 1],
            [2, 2],
            // plays giraffe : kangaroo Female, Bear Female, kangaroo male (default order)
            [10, 2],
            [12, 2],
            [10, 1],
            [5, 2], [6, 1],
            [5, 1],
            [8, 2],
            [12, 1], [2, 1],
            [1, 0], [7, 1],
            // plays giraffe // mules male & female, perrot female (default order)
            [3, 1], [3, 2],
            [9, 1],
            // bug here !
            [9, 2],
        ]);
        /*
    1 => new AnimalCard([2 => 3, 3 => 3, 4 => 3, 5 => 5], 1, 2, POWER_HERMAPHRODITE), // The Snail
    2 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 8, 0, POWER_LOOK_CARDS), // The Giraffe
    3 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 2], 6, 1, POWER_DONT_MOVE_NOAH), // The Mule / donkey?
    4 => new AnimalCard([2 => 1, 3 => 1, 4 => 2, 5 => 2], 5, 1, POWER_EXCHANGE_CARD), // The Lion 
    5 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 0, 2, POWER_REDUCE_MAX_WEIGHT), // The Woodpecker
    6 => new AnimalCard([2 => 2, 3 => 2, 4 => 3, 5 => 3], 2, 1), // Cat
    7 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 10, 0), // Elephant
    8 => new AnimalCard([2 => 1, 3 => 1, 4 => 2, 5 => 3], 4, 4), // Panda
    9 => new AnimalCard([2 => 2, 3 => 2, 4 => 2, 5 => 3], 0, 2), // Perrot
    10 => new AnimalCard([2 => 2, 3 => 2, 4 => 3, 5 => 3], 3, 1), // Kangaroo
    11 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 9, 0), // Rhinoceros
    12 => new AnimalCard([2 => 1, 3 => 1, 4 => 1, 5 => 1], 7, 0), // Bear*/

        // Activate first player must be commented in setup if this is used
        $this->gamestate->changeActivePlayer(2343492);

        //$this->animals->pickCardsForLocation(6, 'hand', 'discard', 2343492);
        //$this->animals->pickCardsForLocation(6, 'hand', 'discard', 2343493);
    }

    private function debugSetPlayerPoints(int $playerId, int $score) {
        $this->DbQuery("UPDATE player SET `player_score` = $score where `player_id` = $playerId");
    }

    private function debugSetPoints(int $score) {
        $this->DbQuery("UPDATE player SET `player_score` = $score");
    }

    private function debugGetAnimalByType($type, $subType, $index = 0) {
        if ($type == 1) {
            $snail = $this->getAnimalsFromDb($this->animals->getCardsOfType($type, 0))[$index];
            $this->applySetGender($snail->id, $subType);
            return $snail;
        }
        return $this->getAnimalsFromDb($this->animals->getCardsOfType($type, $subType))[$index];
    }

    private function debugSetAnimalsInFerry(int $position, array $animals) {
        $this->animals->moveAllCardsInLocation('table'.$position, 'discard');
        $index = 0;
        foreach($animals as $animal) {
            $this->animals->moveCard($animal->id, 'table'.$position, $index++);
        }
    }

    private function debugSetAnimalInHand($playerId, $type, $subType, $index = 0) {
        $card = $this->debugGetAnimalByType($type, $subType, $index);
        $this->animals->moveCard($card->id, 'hand', $playerId);
    }

    private function setTopDeckAnimals(array $animals) {
        foreach($animals as $index => $animal) {
            $type = $animal[0];
            $gender = $animal[1];
            $id = intval($this->getUniqueValueFromDb("SELECT card_id from animal where `card_type` = $type AND `card_type_arg` = $gender AND `card_location_arg` < 100 LIMIT 1"));
            $arg = 500 - $index;
            $this->DbQuery("UPDATE animal SET `card_location_arg` = $arg where `card_id` = $id");
        }
    }

    public function debugRemoveFerries(int $except = 0) {
        $this->DbQuery("UPDATE `ferry` SET `card_location` = 'discard' where `card_location_arg` <> $except");
    }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		$ids = [
            84995393
		];

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			$this->DbQuery("UPDATE animal SET card_location_arg=$sid WHERE card_location_arg = $id" );
			
			++$sid;
		}
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
