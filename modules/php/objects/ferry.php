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

    public function getCurrentWeight() {
        $currentWeight = 0;
        foreach($this->animals as $animal) {
            $currentWeight += $animal->weight;
        }
        return $currentWeight;
    }

    public function getMaxWeight($forceToThirteen = false) {
        if ($forceToThirteen) {
            return 13;
        }

        foreach($this->animals as $animal) {
            if ($animal->power == POWER_REDUCE_MAX_WEIGHT) {
                return 13;
            }
        }
        return 21;
    }
    
}
?>