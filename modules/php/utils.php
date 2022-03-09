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
        $this->DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function deleteGlobalVariable(string $name) {
        $this->DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    function isVariant() {
        return intval($this->getGameStateValue(OPTION_VARIANT)) === 2;
    }

    function useFrog() {
        return intval($this->getGameStateValue(OPTION_FROG)) === 2;
    }

    function useCrocodile() {
        return intval($this->getGameStateValue(OPTION_CROCODILE)) === 2;
    }

    function useRoomates() {
        return intval($this->getGameStateValue(OPTION_ROOMATES)) === 2;
    }

    function getMaxPlayerScore() {
        return -intval($this->getUniqueValueFromDB("SELECT min(player_score) FROM player"));
    }

    function getPlayersIds() {
        $sql = "SELECT player_id FROM player ORDER BY player_no";
        $dbResults = $this->getCollectionFromDB($sql);
        return array_map(fn($dbResult) => intval($dbResult['player_id']), array_values($dbResults));
    }

    function getOpponentId(int $playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_id FROM player WHERE player_id <> $playerId"));
    }    

    function getOrderedOpponentsIds(int $playerId) {
        $players = $this->getOrderedPlayers($playerId);
        $opponents = array_values(array_filter($players, fn($player) => $player->id != $playerId));
        $opponentsIds = array_map(fn($player) => $player->id, $opponents);
        return $opponentsIds;
    }

    function getPlayers() {
        $sql = "SELECT * FROM player ORDER BY player_no";
        $dbResults = $this->getCollectionFromDB($sql);
        return array_map(fn($dbResult) => new NoahPlayer($dbResult), array_values($dbResults));
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
        return intval($this->getUniqueValueFromDb("SELECT count(*) FROM player")) == 1;
    }

    function getPlayerName(int $playerId) {
        return $this->getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
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
        return intval($this->getGameStateValue(NOAH_POSITION));
    }

    function setNoahPosition(int $position) {
        $this->setGameStateValue(NOAH_POSITION, $position);
    }

    function getPlayerScore(int $playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function incPlayerScore(int $playerId, int $incScore) {
        $this->DbQuery("UPDATE player SET player_score = player_score - $incScore WHERE player_id = $playerId");

        $this->notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $this->getPlayerScore($playerId),
        ]);
    }

    function decPlayerScore(int $playerId, int $decScore) {
        $newScore = min(0, $this->getPlayerScore($playerId) + 2);
        $this->DbQuery("UPDATE player SET player_score = $newScore WHERE player_id = $playerId");

        $this->notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $newScore,
        ]);
    }

    function setPlayerScore(int $playerId, int $score) {
        $this->DbQuery("UPDATE player SET player_score = $score WHERE player_id = $playerId");
    }

    function setupCards(int $playerCount) {
        // animal cards    
        $animals = [];
        $useFrog = $this->useFrog();
        $useCrocodile = $this->useCrocodile();
        foreach($this->ANIMALS as $type => $animal) {
            if (!$useFrog && $type == 20) { continue; } // frog not used
            if (!$useCrocodile && $type == 21) { continue; } // crocodile not used

            $number = $animal->cardsByGender[$playerCount];

            if ($useFrog && $type == 1) { $number -= 2; } // frog remove a couple of snails
            if ($useCrocodile && $type == 3) { $number -= 1; } // crocodile remove a couple of donkeys

            $animalCard = [ 'type' => $type, 'nbr' => $number ];
            if ($animal->power == POWER_HERMAPHRODITE) {
                $animals[] = $animalCard + [ 'type_arg' => 0];
            } else {
                $animals[] = $animalCard + [ 'type_arg' => 1 ];
                $animals[] = $animalCard + [ 'type_arg' => 2 ];
            }
        }
        
        $this->animals->createCards($animals, 'deck');
        
        // 8 ferries
        $useRoomates = $this->useRoomates();
        $ferries = [[ 'type' => 0, 'type_arg' => 0, 'nbr' => $useRoomates ? 7 : 8 ]];
        if ($useRoomates) {
            $ferries[] = [ 'type' => 1, 'type_arg' => 0, 'nbr' => 1 ];
        }
        $this->ferries->createCards($ferries, 'deck');
    }

    function applySetGender(int $animalId, int $gender) {
        $this->DbQuery("UPDATE animal SET `card_type_arg` = $gender where `card_id` = $animalId");
    }

    function applySetWeight(int $animalId, int $weight) {
        $this->DbQuery("UPDATE animal SET `card_weight` = $weight where `card_id` = $animalId");
    }

    function setInitialCardsAndResources(array $playersIds) {
        // reset frog weights
        $this->DbQuery("UPDATE animal SET `card_weight` = 1 where `card_type` = 20"); 
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
        $this->notifyAllPlayers('newRound', '', [
            'ferries' => $ferries,
        ]);

        // set players animals
        foreach ($playersIds as $playerId) {
            $this->animals->pickCardsForLocation($soloMode ? 2 : 8, 'deck', 'hand', $playerId);
            $this->notifyPlayer($playerId, 'newHand', '', [
                'playerId' => $playerId,
                'animals' => $this->getAnimalsFromDb($this->animals->getCardsInLocation('hand', $playerId)),
            ]);
        }

        $this->notifyHandCount($playersIds);
    }

    function getAnimalFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("animal doesn't exists ".json_encode($dbObject));
        }

        $animal = new Animal($dbObject, $this->ANIMALS, $this);

        if ($animal->power == POWER_ADJUSTABLE_WEIGHT) {
            $animal->weight = intval($this->getUniqueValueFromDB("SELECT card_weight FROM animal where `card_id` = ".$animal->id));
        }

        return $animal;
    }

    function getAnimalsFromDb(array $dbObjects) {
        return array_map(fn($dbObject) => $this->getAnimalFromDb($dbObject), array_values($dbObjects));
    }

    function getFerryFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("ferry doesn't exists ".json_encode($dbObject));
        }
        return new Ferry($dbObject);
    }

    function getFerriesFromDb(array $dbObjects) {
        return array_map(fn($dbObject) => $this->getFerryFromDb($dbObject), array_values($dbObjects));
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
            case 1: return _('Snail');
            case 2: return _('Giraffe');
            case 3: return _('Mule');
            case 4: return _('Lion');
            case 5: return _('Woodpecker');
            case 6: return _('Cat');
            case 7: return _('Elephant');
            case 8: return _('Panda');
            case 9: return _('Parrot');
            case 10: return _('Kangaroo');
            case 11: return _('Rhinoceros');
            case 12: return _('Bear');

            case 20: return _('Frog');
            case 21: return _('Crocodile');
        }
        return null;
    }

    function getHandCount(int $playerId) {
        return intval($this->animals->countCardInLocation('hand', $playerId));
    }

    function notifyHandCount(array $playersIds) {
        $handCount = [];

        foreach ($playersIds as $playerId) {
            $handCount[$playerId] = $this->getHandCount($playerId);
        }

        $this->notifyAllPlayers('handCount', '', [
            'handCount' => $handCount,
        ]);
    }
}