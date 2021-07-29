<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        //self::DbQuery("UPDATE card SET `card_location_arg` = card_location_arg + 200 where `card_type` = 117");
        //$this->addResource(2343492, 4, 0);
        //$this->debugSetPoints(19);
        $this->debugAddResources(2343492, 6);
        //$this->debugAddResources(2343493, 2);
        //$this->debugSetMachineInHand(2343492, 4, 1);
        //$this->debugSetMachineInHand(2343492, 4, 1, 1);
        //$this->machines->moveAllCardsInLocation('deck', 'discard');
        //$this->debugSetMachineInTable(1, 2);
        //$this->debugSetMachineInTable(4, 2);
        $this->debugSetMachineInWorkshop(2343492, 1, 1, 1);
        $this->debugSetMachineInWorkshop(2343492, 1, 1, 2);
        $this->debugSetMachineInWorkshop(2343492, 1, 2, 2);
        //$this->debugSetProjectInWorkshop(2343492, 1, 1);
        //$this->debugSetProjectInWorkshop(2343492, 2, 1);

        // Activate first player must be commented in setup if this is used
        $this->gamestate->changeActivePlayer(2343492);
    }

    private function debugSetPlayerPoints(int $playerId, int $score) {
        self::DbQuery("UPDATE player SET `player_score` = $score where `player_id` = $playerId");
    }

    private function debugSetPoints(int $score) {
        self::DbQuery("UPDATE player SET `player_score` = $score");
    }

    private function debugAddResources(int $playerId, int $number) {
        for ($i=0; $i<=3; $i++) {
            $this->addResource($playerId, $number, $i);
        }
    }

    private function debugGetMachineByTypes($type, $subType, $index = 0) {
        return $this->getMachinesFromDb($this->machines->getCardsOfType($type, $subType))[$index];
    }

    private function debugSetMachineInTable($type, $subType) {
        $card = $this->debugGetMachineByTypes($type, $subType);
        $this->machines->moveCard($card->id, 'table', $this->countMachinesOnTable() + 1);
    }

    private function debugSetMachineInHand($playerId, $type, $subType, $index = 0) {
        $card = $this->debugGetMachineByTypes($type, $subType, $index);
        $this->machines->moveCard($card->id, 'hand', $playerId);
    }

    private function debugSetMachineInWorkshop($playerId, $type, $subType, $index = 0) {
        $card = $this->debugGetMachineByTypes($type, $subType, $index);
        $this->machines->moveCard($card->id, 'player', $playerId);
    }

    private function debugGetProjectByTypes($type, $subType) {
        return $this->getProjectsFromDb($this->projects->getCardsOfType($type, $subType))[0];
    }

    private function debugSetProjectInTable($type, $subType, $position = 1) {
        $card = $this->debugGetProjectByTypes($type, $subType);
        $this->projects->moveCard($card->id, 'table', $position);
    }

    private function debugSetProjectInWorkshop($playerId, $type, $subType) {
        $card = $this->debugGetProjectByTypes($type, $subType);
        $this->projects->moveCard($card->id, 'player', $playerId);
    }
}
