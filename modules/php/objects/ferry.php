<?php
class Ferry {
    public $id;
    public $location;
    public $location_arg;
    public $animals;
    public $roomates;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->roomates = boolval($dbCard['type']);
    } 

    public function getCurrentWeight($ignoreFirst = false) {
        $currentWeight = 0;
        $animals = $ignoreFirst ? array_slice($this->animals, 1) : $this->animals;
        foreach($animals as $animal) {
            $currentWeight += $animal->weight;
        }
        return $currentWeight;
    }

    public function getMaxWeight($forceToThirteen = false, $ignoreFirst = false) {
        if ($forceToThirteen) {
            return 13;
        }

        $animals = $ignoreFirst ? array_slice($this->animals, 1) : $this->animals;

        foreach($animals as $animal) {
            if ($animal->power == POWER_REDUCE_MAX_WEIGHT) {
                return 13;
            }
        }
        return 21;
    }
    
}
?>