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
        $this->debugSetAnimalInHand(2343492, 2, 2);
        //$this->debugSetAnimalInHand(2343492, 1, 0);

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
