<?php
class Ferry {
    public $id;
    public $location;
    public $location_arg;
    public $animals;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
    } 

    public function getCurrentWeight() {
        $currentWeight = 0;
        foreach($this->animals as $animal) {
            $currentWeight += $animal->weight;
        }
        return $currentWeight;
    }

    public function getMaxWeight() {
        foreach($this->animals as $animal) {
            if ($animal->power == REDUCE_MAX_WEIGHT) {
                return 13;
            }
            return 21;
        }
    }
    
}
?>