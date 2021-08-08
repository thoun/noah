<?php

require_once(__DIR__.'/objects/animal.php');
require_once(__DIR__.'/objects/ferry.php');
require_once(__DIR__.'/objects/player.php');

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

    function isVariant() {
        return intval(self::getGameStateValue(OPTION_VARIANT)) === 2;
    }

    function useFrog() {
        return intval(self::getGameStateValue(OPTION_FROG)) === 2;
    }

    function useCrocodile() {
        return intval(self::getGameStateValue(OPTION_CROCODILE)) === 2;
    }

    function useRoomates() {
        return intval(self::getGameStateValue(OPTION_ROOMATES)) === 2;
    }

    function getMaxPlayerScore() {
        return -intval(self::getUniqueValueFromDB("SELECT min(player_score) FROM player"));
    }

    function getPlayersIds() {
        $sql = "SELECT player_id FROM player ORDER BY player_no";
        $dbResults = self::getCollectionFromDB($sql);
        return array_map(function($dbResult) { return intval($dbResult['player_id']); }, array_values($dbResults));
    }

    function getOpponentId(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_id <> $playerId"));
    }    

    function getOrderedOpponentsIds(int $playerId) {
        $players = $this->getOrderedPlayers($playerId);
        $opponents = array_values(array_filter($players, function($player) use ($playerId) { return $player->id != $playerId; }));
        $opponentsIds = array_map(function($player) { return $player->id; }, $opponents);
        return $opponentsIds;
    }

    function getPlayers() {
        $sql = "SELECT * FROM player ORDER BY player_no";
        $dbResults = self::getCollectionFromDB($sql);
        return array_map(function($dbResult) { return new NoahPlayer($dbResult); }, array_values($dbResults));
    }

    function getOrderedPlayers(int $currentTurnPlayerId) {
        $players = $this->getPlayers();

        $playerIndex = 0; 
        foreach($players as $player) {
            if ($player->id == $currentTurnPlayerId) {
                break;
            }
            $playerIndex++;
        }

        $orderedPlayers = $players;
        if ($playerIndex > 0) { // we start from $currentTurnPlayerId and then follow order
            $orderedPlayers = array_merge(array_slice($players, $playerIndex), array_slice($players, 0, $playerIndex));
        }

        return $orderedPlayers;
    }

    function isSoloMode() {
        return intval(self::getUniqueValueFromDb("SELECT count(*) FROM player")) == 1;
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function isEndOfRound() {
        // if last ferry left table
        if (intval($this->ferries->countCardInLocation('deck')) == 0 && intval($this->ferries->countCardInLocation('table')) < 5) {
            return true;
        }

        // if one player has no cards in hand
        $playersIds = $this->getPlayersIds();
        foreach($playersIds as $playerId) {
            if (intval($this->animals->countCardInLocation('hand', $playerId)) == 0) {
                return true;
            }
        }

        return false;
    }

    function getNoahPosition() {
        return intval(self::getGameStateValue(NOAH_POSITION));
    }

    function setNoahPosition(int $position) {
        self::setGameStateValue(NOAH_POSITION, $position);
    }

    function getPlayerScore(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function incPlayerScore(int $playerId, int $incScore) {
        self::DbQuery("UPDATE player SET player_score = player_score - $incScore WHERE player_id = $playerId");

        self::notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $this->getPlayerScore($playerId),
        ]);
    }

    function decPlayerScore(int $playerId, int $decScore) {
        $newScore = max(0, $this->getPlayerScore($playerId) + 2);
        self::DbQuery("UPDATE player SET player_score = $newScore WHERE player_id = $playerId");

        self::notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $newScore,
        ]);
    }

    function setPlayerScore(int $playerId, int $score) {
        self::DbQuery("UPDATE player SET player_score = $score WHERE player_id = $playerId");
    }

    function setupCards(int $playerCount) {
        // animal cards    
        $animals = [];
        $useFrog = $this->useFrog();
        $useCrocodile = $this->useCrocodile();
        foreach($this->ANIMALS as $type => $animal) {
            if ($useFrog && $type == 1) { continue; } // frog remove snails
            if (!$useFrog && $type == 20) { continue; } // frog not used
            if ($useCrocodile && $type == 3) { continue; } // crocodile remove donkeys
            if (!$useCrocodile && $type == 21) { continue; } // crocodile not used

            if ($animal->power == POWER_HERMAPHRODITE) {
                $animals[] = [ 'type' => $type, 'type_arg' => 0, 'nbr' => $animal->cardsByGender[$playerCount] ];
            } else {
                $animals[] = [ 'type' => $type, 'type_arg' => 1, 'nbr' => $animal->cardsByGender[$playerCount] ];
                $animals[] = [ 'type' => $type, 'type_arg' => 2, 'nbr' => $animal->cardsByGender[$playerCount] ];
            }
        }
        
        $this->animals->createCards($animals, 'deck');
        
        // 8 ferries
        $this->ferries->createCards([[ 'type' => ($this->useRoomates() ? 1 : 0), 'type_arg' => 0, 'nbr' => 8 ]], 'deck');
    }

    function applySetGender(int $animalId, int $gender) {
        self::DbQuery("UPDATE animal SET `card_type_arg` = $gender where `card_id` = $animalId");
    }

    function applySetWeight(int $animalId, int $weight) {
        self::DbQuery("UPDATE animal SET `card_weight` = $weight where `card_id` = $animalId");
    }

    function setInitialCardsAndResources(array $playersIds) {
        // reset frog weights
        self::DbQuery("UPDATE animal SET `card_weight` = 1 where `card_type` = 20"); 
        $soloMode = $this->isSoloMode(); 

        // set table ferries and first animal on it
        for ($position=0; $position<5; $position++) {
            $this->ferries->pickCardForLocation('deck', 'table', $position);
            if (!$soloMode) {
                $card = $this->getAnimalFromDb($this->animals->pickCardForLocation('deck', 'table'.$position, 0)); 
                if ($card->power == POWER_HERMAPHRODITE) {
                    $this->applySetGender($card->id, bga_rand(1, 2));
                }
            }
        }    
        
        $ferries = [];
        for ($position=0; $position<5; $position++) {
            $ferries[$position] = $this->getFerry($position);
        }
        self::notifyAllPlayers('newRound', '', [
            'ferries' => $ferries,
        ]);

        // set players animals
        foreach ($playersIds as $playerId) {
            $this->animals->pickCardsForLocation($soloMode ? 2 : 8, 'deck', 'hand', $playerId);
            self::notifyPlayer($playerId, 'newHand', '', [
                'playerId' => $playerId,
                'animals' => $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId)),
            ]);
        }
    }

    function getAnimalFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("animal doesn't exists ".json_encode($dbObject));
        }

        $animal = new Animal($dbObject, $this->ANIMALS, $this);

        if ($animal->power == POWER_ADJUSTABLE_WEIGHT) {
            $animal->weight = intval(self::getUniqueValueFromDB("SELECT card_weight FROM animal where `card_id` = ".$animal->id));
        }

        return $animal;
    }

    function getAnimalsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getAnimalFromDb($dbObject); }, array_values($dbObjects));
    }

    function getFerryFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("ferry doesn't exists ".json_encode($dbObject));
        }
        return new Ferry($dbObject);
    }

    function getFerriesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getFerryFromDb($dbObject); }, array_values($dbObjects));
    }

    function getFerry(int $position) {
        $ferries = $this->getFerriesFromDb($this->ferries->getCardsInLocation('table', $position));
        if (count($ferries) > 0) {
            $ferry = $ferries[0];
            $ferry->animals = $this->getAnimalsFromDb($this->animals->getCardsInLocation('table'.$position, null, 'location_arg'));
            return $ferry;
        } else {
            return null;
        }
    }

    function getAnimalName(int $type) {
        switch ($type) {
            case 1: return _('snail');
            case 2: return _('giraffe');
            case 3: return _('mule');
            case 4: return _('lion');
            case 5: return _('woodpecker');
            case 6: return _('cat');
            case 7: return _('elephant');
            case 8: return _('panda');
            case 9: return _('perrot');
            case 10: return _('kangaroo');
            case 11: return _('rhinoceros');
            case 12: return _('bear');

            case 20: return _('frog');
            case 21: return _('crocodile');
        }
        return null;
    }
}