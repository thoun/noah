<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        //$this->DbQuery("UPDATE animal SET `card_location_arg` = card_location_arg + 200 where `card_type` = 2");
        //$this->debugSetPoints(19);
        /*$this->debugSetAnimalsInFerry(0, [
            $this->debugGetAnimalByType(7, 1),
            $this->debugGetAnimalByType(7, 2),
        ]);*/
        $this->debugSetAnimalInHand(2343492, 2, 1);
        $this->debugSetAnimalInHand(2343492, 1, 0);

        // Activate first player must be commented in setup if this is used
        $this->gamestate->changeActivePlayer(2343492);
    }

    private function debugSetPlayerPoints(int $playerId, int $score) {
        $this->DbQuery("UPDATE player SET `player_score` = $score where `player_id` = $playerId");
    }

    private function debugSetPoints(int $score) {
        $this->DbQuery("UPDATE player SET `player_score` = $score");
    }

    private function debugGetAnimalByType($type, $subType, $index = 0) {
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
}
