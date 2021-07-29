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
        
        $playerId = self::getActivePlayerId();

        // TODO

        $this->gamestate->nextState('moveNoah');
    }

    public function moveNoah(int $destination) {
        self::checkAction('moveNoah'); 
        
        $playerId = self::getActivePlayerId();

        // TODO

        $this->gamestate->nextState('nextPlayer');
    }
    
    /*public function playMachine(int $id) {
        self::checkAction('playMachine'); 
        
        $playerId = intval(self::getActivePlayerId());

        $selectableMachines = $this->getSelectableMachinesForChooseAction($playerId);
        if (!$this->array_some($selectableMachines, function ($m) use ($id) { return $m->id == $id; })) {
            throw new Error("This machine cannot be played");
        }

        $freeTableSpot = $this->countMachinesOnTable() + 1;
        $this->machines->moveCard($id, 'table', $freeTableSpot);
        self::setGameStateValue(PLAYED_MACHINE, $id);

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays ${machine_type} machine ${machineImage}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machine_type' => $this->getColorName($machine->type),
            'machineImage' => $this->getUniqueId($machine),
        ]);

        self::incStat(1, 'playedMachines');
        self::incStat(1, 'playedMachines', $playerId);

        $this->gamestate->nextState('choosePlayAction');
    }*/
}
