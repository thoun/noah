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
                <div id="remaining-ferry-counter" class="remaining-counter"></div>
            </div>
        </div>
        <div id="myhand-wrap" class="whiteblock">
            <div id="my-hand-label"><h3>{MY_HAND}</h3></div>
            <div id="my-animals"></div>
        </div>
    </div>
    <div id="zoom-controls">
        <button id="zoom-out"></button>
        <button id="zoom-in" class="disabled"></button>
    </div>
</div>

{OVERALL_GAME_FOOTER}
