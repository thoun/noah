<?php

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function getUniqueId(object $card) {
        return $card->type * 10 + $card->subType;
    }

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \Error('Global Variable null');
        }*/
        $jsonObj = json_encode($obj);
        self::DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = self::getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function deleteGlobalVariable(string $name) {
        self::DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    /*function getMaxPlayerScore() {
        return intval(self::getUniqueValueFromDB("SELECT max(player_score) FROM player"));
    }*/

    /*function setupCards() {
        // 56 machine cards    
        $machines = [];
        foreach(array_keys($this->MACHINES) as $projectId) {
            $type = floor($projectId / 10);
            $machines[] = [ 'type' => $type, 'type_arg' => $projectId % 10, 'nbr' => $type == 3 ? 2 : 4 ];
        }
        $this->machines->createCards($machines, 'deck');
        $this->machines->shuffle('deck');
        
        //17 project tiles
        $projects = [];
        foreach(array_keys($this->PROJECTS) as $projectId) {
            $projects[] = [ 'type' => floor($projectId / 10), 'type_arg' => $projectId % 10, 'nbr' => 1 ];
        }
        $this->projects->createCards($projects, 'deck');
        $this->projects->shuffle('deck');

        //12 charcoaliums & 24 resources : 8 wood, 8 copper, 8 crystal        
        $resources = [
            [ 'type' => 0, 'type_arg' => null, 'nbr' => 12 ],
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 2, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 3, 'type_arg' => null, 'nbr' => 8 ],
        ];
        $this->resources->createCards($resources, 'table');
    }

    function setInitialCardsAndResources(array $players) {
        // set table and players machines
        $this->machines->pickCardForLocation('deck', 'table', 1); 
        foreach($players as $playerId => $player) {
            $this->machines->pickCardsForLocation(5, 'deck', 'hand', $playerId);
        }

        // set table projects
        for ($i=1; $i<=6; $i++) {
            $this->projects->pickCardForLocation('deck', 'table', $i);
        }

        // set initial resources
        foreach($players as $playerId => $player) {
            if ($this->getFirstPlayerId() == $playerId) {
                $this->addResource($playerId, 2, 0);
            } else {
                $this->addResource($playerId, 1, 0);
                $this->addResource($playerId, 1, 1);
            }
        }
    }

    function getRemainingMachines() {
        return $this->machines->countCardInLocation('deck');
    }

    function getRemainingProjects() {
        return $this->projects->countCardInLocation('deck');
    }

    function getMachineFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("machine doesn't exists ".json_encode($dbObject));
        }
        return new Machine($dbObject, $this->MACHINES);
    }

    function getMachinesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getMachineFromDb($dbObject); }, array_values($dbObjects));
    }

    function getMachinesWithResourcesFromDb(array $dbObjects) {
        $machines = $this->getMachinesFromDb($dbObjects);
    
        foreach($machines as &$machine) {
            $machine->resources = $this->getResourcesFromDb($this->resources->getCardsInLocation('machine', $machine->id));
        }

        return $machines;
    }*/

    function getPlayerScore(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function incPlayerScore(int $playerId, int $incScore) {
        self::DbQuery("UPDATE player SET player_score = player_score + $incScore WHERE player_id = $playerId");

        if ($this->getMaxPlayerScore() >= 20) {
            self::setGameStateValue(LAST_TURN, 1);
            self::notifyAllPlayers('lastTurn', clienttranslate("There is not enough machines left on the deck, it's last turn !"), [
                'playerId' => $playerId,
                'points' => $this->getPlayerScore($playerId),
            ]);
        }

        self::notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $this->getPlayerScore($playerId),
        ]);
    }
}
