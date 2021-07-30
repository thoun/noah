<?php

class AnimalCard {
    public /*array*/ $cardsByGender; // card ocunt by gender, set in array depending on player number [2 => x, ..., 5 => y]
    public /*int*/ $weight;
    public /*int*/ $points;
    public /*int*/ $power;
  
    public function __construct(array $cardsByGender, int $weight, int $points, int $power = 0) {
        $this->cardsByGender = $cardsByGender;
        $this->weight = $weight;
        $this->points = $points;
        $this->power = $power;
    } 
}

class Animal extends AnimalCard {
    public $id;
    public $location;
    public $location_arg; // order on table$position
    public /*int*/ $type; // race
    public $gender; // 0 : hermaphrodite (gender not yet set), 1 : male, 2 : female

    public function __construct($dbCard, $ANIMALS) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
        $this->gender = intval($dbCard['type_arg']);

        $animalCard = $ANIMALS[$this->type];
        $this->weight = $animalCard->weight;
        $this->points = $animalCard->points;
        $this->power = $animalCard->power;
    } 
}
?>