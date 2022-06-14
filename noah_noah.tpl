{OVERALL_GAME_HEADER}

<div id="zoom-wrapper">
    <div id="full-table">
        <div id="table">
            <div id="round-counter-wrapper" class="whiteblock">
                <div>{ROUND}</div>
                <div class="counter"><span id="round-counter"></span><span id="counter-no-variant">&nbsp;/&nbsp;3</span></div>
            </div>
            <div id="solo-counter-wrapper" class="whiteblock">
                <div>{REMAINING_ANIMALS_IN_DECK}</div>
                <div class="counter"><span id="solo-counter"></span></div>
            </div>
            <div id="center-board">
                <div id="ferry-deck" class="stockitem"></div>
            </div>
        </div>
        
    </div>
    <div id="zoom-controls">
        <button id="zoom-out"></button>
        <button id="zoom-in" class="disabled"></button>
    </div>
</div>

<div id="hands">
    <div id="myhand-wrap" class="whiteblock hand-wrap">
        <div id="my-hand-label" class="hand-label">
            <button id="sortByWeight" class="sort-button"><div class="sort-icon" data-type="weight"></div></button>
            <button id="sortByGender" class="sort-button"><div class="sort-icon" data-type="gender"></div></button>
            <h3>{MY_HAND}</h3>
        </div>
        <div id="my-animals" class="animals"></div>
    </div>
    <div id="giraffe-hand-wrap" class="whiteblock hand-wrap hidden">
        <div class="hand-label"><h3 id="giraffe-hand-label"></h3></div>
        <div id="giraffe-animals" class="animals"></div>
    </div>
</div>

{OVERALL_GAME_FOOTER}
