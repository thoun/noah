<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Noah implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * noah.action.php
 *
 * Noah main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/noah/noah/myAction.html", ...)
 *
 */
  
  
  class action_noah extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
        if ($this->isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = $this->getArg("table", AT_posint, true);
        } else {
            $this->view = "noah_noah";
            $this->trace("Complete reinitialization of board game");
        }
  	}
  	
    public function loadAnimal() {
        $this->setAjaxMode();

        $id = $this->getArg("id", AT_posint, true);

        $this->game->loadAnimal($id);

        $this->ajaxResponse();
    }
  	
    public function takeAllAnimals() {
        $this->setAjaxMode();

        $this->game->takeAllAnimals();

        $this->ajaxResponse();
    }
  	
    public function setGender() {
        $this->setAjaxMode();

        $gender = $this->getArg("gender", AT_posint, true);

        $this->game->setGender($gender);

        $this->ajaxResponse();
    }
  	
    public function setWeight() {
        $this->setAjaxMode();

        $weight = $this->getArg("weight", AT_posint, true);

        $this->game->setWeight($weight);

        $this->ajaxResponse();
    }
  	
    public function chooseOpponent() {
        $this->setAjaxMode();

        $playerId = $this->getArg("playerId", AT_posint, true);

        $this->game->chooseOpponent($playerId);

        $this->ajaxResponse();
    }
  	
    public function seen() {
        $this->setAjaxMode();

        $this->game->seen();

        $this->ajaxResponse();
    }
  	
    public function giveCard() {
        $this->setAjaxMode();

        $id = $this->getArg("id", AT_posint, true);

        $this->game->giveCard($id);

        $this->ajaxResponse();
    }
  	
    public function moveNoah() {
        $this->setAjaxMode();

        $destination = $this->getArg("destination", AT_posint, true);

        $this->game->moveNoah($destination);

        $this->ajaxResponse();
    }

    public function giveCards() {
        $this->setAjaxMode();

        $giveCardsTo = array_filter(
            json_decode(base64_decode($this->getArg("giveCardsTo", AT_base64, true)), true),
            fn($value) => $value !== null
        );

        $this->game->giveCards($giveCardsTo);

        $this->ajaxResponse();
    }

    public function reorderTopDeck() {
        $this->setAjaxMode();

        $reorderTopDeck = array_filter(
            json_decode(base64_decode($this->getArg("reorderTopDeck", AT_base64, true)), true),
            fn($value) => $value !== null
        );

        $this->game->reorderTopDeck($reorderTopDeck);

        $this->ajaxResponse();
    }
  	
    public function replaceOnTopDeck() {
        $this->setAjaxMode();

        $id = $this->getArg("id", AT_posint, true);

        $this->game->replaceOnTopDeck($id);

        $this->ajaxResponse();
    }
  	
    public function skipReplaceOnTopDeck() {
        $this->setAjaxMode();

        $this->game->skipReplaceOnTopDeck();

        $this->ajaxResponse();
    }

}