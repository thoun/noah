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
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "noah_noah";
            self::trace("Complete reinitialization of board game");
        }
  	}
  	
    public function loadAnimal() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);

        $this->game->loadAnimal($id);

        self::ajaxResponse();
    }
  	
    public function moveNoah() {
        self::setAjaxMode();

        $destination = self::getArg("destination", AT_posint, true);

        $this->game->moveNoah($destination);

        self::ajaxResponse();
    }

}
  

