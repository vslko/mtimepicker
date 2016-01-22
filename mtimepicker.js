/*
 * jQuery MantellaTimePicker (mTimePicker) ver. 0.1 plugin
 * Copyright (c) 2013 Vasilij Olhov
 * Dual licensed under the MIT and GPL licenses
 */

;(function($) {


    // ================================================
    // =============== EXTERNAL METHODS ===============
    // ================================================
    var methods = {

        // === Initailization ===
        init: function(params) {

            this.data('drag', false);

            this.wrap("<div class='mtimepicker-container'></div>" );
            var container = getContainer.call(this);
            this.addClass('mtimepicker-clock').attr('readonly', 'readonly');
            var win = $('<div class="mtimepicker-window"></div>').appendTo(container);

            // add hours scale
            var hourScale = $('<div class="mtimepicker-scale mtimepicker-hours-scale"></div>').appendTo(win);
            var hourSlidingScale = $('<div class="mtimepicker-sliding-scale"></div>').appendTo(hourScale);
            hourSlidingScale.append('<div class="mtimepicker-scaler-prev-prev">00</div>');
            hourSlidingScale.append('<div class="mtimepicker-scaler-prev">00</div>');
            hourSlidingScale.append('<div class="mtimepicker-scaler-current">00</div>');
            hourSlidingScale.append('<div class="mtimepicker-scaler-next">00</div>');
            hourSlidingScale.append('<div class="mtimepicker-scaler-next-next">00</div>');

            // add lines with sliders
            $('<div class="mtimepicker-line mtimepicker-hours-line"><div class="mtimepicker-slider mtimepicker-hours-slider"></div>').appendTo(win);
            $('<div class="mtimepicker-line mtimepicker-minutes-line"><div class="mtimepicker-slider mtimepicker-hours-slider"></div></div>').appendTo(win);

            // add minutes scale
            var minutesScale         = $('<div class="mtimepicker-scale mtimepicker-minutes-scale"></div>').appendTo(win);
            var minutesSlidingScale = $('<div class="mtimepicker-sliding-scale"></div>').appendTo(minutesScale);
            minutesSlidingScale.append('<div class="mtimepicker-scaler-prev-prev">00</div>');
            minutesSlidingScale.append('<div class="mtimepicker-scaler-prev">00</div>');
            minutesSlidingScale.append('<div class="mtimepicker-scaler-current">00</div>');
            minutesSlidingScale.append('<div class="mtimepicker-scaler-next">00</div>');
            minutesSlidingScale.append('<div class="mtimepicker-scaler-next-next">00</div>');

            setLayout.call(this);
            bindActions.call(this);
            if (this.val().length == 5) { methods.setTime.call(this,this.val()); }
            return this;
        },


        // === Return extra parameters of grid ---
        getTime : function() {
             return this.val();
        },


        // === Set new extra parameters into grid ---
        setTime : function( time ) {
            var h_m = time.split(':');
            setSliderByTime.call( this, 'hour', h_m[0] );
            setSliderByTime.call( this, 'minute', h_m[1] );
            return this;
        },


    };







    // =================================================
    // ======== INTERFACE/HELPING FUNCTIONS ============
    // =================================================

    // === Get container of element
    var getContainer = function() {
        return this.parents('div.mtimepicker-container').first();
    };

    var getWindow = function() {
        return getContainer.call(this).find('div.mtimepicker-window');
    };

    // === Calculate width's and height's of blocks ===
    var setLayout = function() {
           var container    = getContainer.call(this),
                  win           = getWindow.call(this),
                  pClock       = this,
               pScales         = win.find('div.mtimepicker-scale'),
                  pLines          = win.find('div.mtimepicker-line'),
               pHeight, pWidth;

        // set height of scales and lines
        pHeight = win.height() - ( pScales.first().outerHeight(true) - pScales.first().height() );
        pScales.height( pHeight );
        pLines.height( pHeight );

        // set width for scales
        pWidth = Math.ceil( ( win.width() - pLines.first().outerWidth(true) * 2 - ( pScales.outerWidth(true) - pScales.width() ) * 2 ) / 2 );
        pScales.width( pWidth );

    };





    // === Define position on line by hours/minutes value and set it
    var setSliderByTime = function( what, value ) {
        var win        = getWindow.call(this),
            line    = win.find('.mtimepicker-'+what+'s-line').first(),
            grade    = (what=='hour') ? 23 : 59,
            low     = line.height()/grade * parseInt(value),
            high    = line.height()/grade * parseInt(value)+1,
            pos     = parseInt(low + (high-low) / 2);

        var sliderPos = setSliderPosition.call(line, pos );
        setScalePosition.call(line, sliderPos);

        setTimeValueBySliderPosition.call(line);
    };

    // === Calculate slider position in cause of mouse position [this = line] ===
    var __getSliderPositionByMousePosition = function( mousePos ) {
         var    slider      = $(this).children('.mtimepicker-slider').first(),
                minPos      = slider.height() / 2,
                maxPos      = $(this).height() - minPos,
                sliderPos    = mousePos - minPos;

           if ( mousePos > maxPos ) { sliderPos = maxPos - minPos; }
           else if ( sliderPos < 0 ) { sliderPos = 0; }

           return sliderPos;
    };

    // === Calculate slider position in cause of mouse position [this = line] ===
    var setSliderPosition = function( mousePos ) {
        var slider    = $(this).children('.mtimepicker-slider').first(),
            sliderPos = __getSliderPositionByMousePosition.call( this, mousePos );

        slider.css('top', Math.ceil(sliderPos) + 'px' );
        return sliderPos;
    };

    // === Calculate scale position in cause of mouse position [this = line] ===
    var setScalePosition = function( sliderPos ) {
        var win            = this.parents('.mtimepicker-window').first(),
            what        = this.hasClass('mtimepicker-hours-line') ? 'hour' : 'minute',
            max              = (what == 'hour') ? 24 : 60,
            scale        = win.find('.mtimepicker-'+what+'s-scale > div.mtimepicker-sliding-scale').first();
            time           = __getTimeValueBySliderPosition.call( this, sliderPos );

        scale.children('div.mtimepicker-scaler-prev-prev').html( (time-2)>=0 ? ( ((time-2)<10?'0':'')+(time-2) ) : '&nbsp;' );
        scale.children('div.mtimepicker-scaler-prev').html( (time-1)>=0 ? ( ((time-1)<10?'0':'')+(time-1) ) : '&nbsp;' );
        scale.children('div.mtimepicker-scaler-current').html( (time<10 ? '0' : '')+time );
        scale.children('div.mtimepicker-scaler-next').html( (time+1)<max ? ( ((time+1)<10?'0':'')+(time+1) ) : '&nbsp;' );
        scale.children('div.mtimepicker-scaler-next-next').html( (time+2)<max ? ( ((time+2)<10?'0':'')+(time+2) ) : '&nbsp;' );
        scale.css('top', parseInt( sliderPos - scale.outerHeight(true) / 2 )+'px');
    };

    // === Calculate time value in cause of slider position on line [this = line] ===
    var __getTimeValueBySliderPosition = function( sliderPos ) {
        var slider      = $(this).children('.mtimepicker-slider').first(),
            grades      = $(this).hasClass('mtimepicker-hours-line') ? 23 : 60,
            maxPos      = $(this).height() - ( slider.height() / 2 ),
          val = Math.ceil( sliderPos / (maxPos/grades) );
        return val;
    }

    // === Set time value in cause of current slider position on line [this = line] ===
    var setTimeValueBySliderPosition = function() {
        var what        = this.hasClass('mtimepicker-hours-line') ? 'hour' : 'minute',
            slider      = this.children('.mtimepicker-slider').first(),
            sliderPos    = parseInt(slider.css('top')),
            timeValue     =  __getTimeValueBySliderPosition.call( $(this), sliderPos ),
            clock        = this.parents('.mtimepicker-container').first().find('.mtimepicker-clock').first(),
            clockValues    = clock.val().split(':');

        timeValue = ( (timeValue<10) ? '0' : '' ) + timeValue;
        if ( what=='hour' ) { clockValues[0] = timeValue; }
        else { clockValues[1] = timeValue; }

        clock.val( clockValues[0]+':'+clockValues[1] );
    };


    // === intercept evants chain ===
    var killEvent = function( event ) {
        event.preventDefault();
        new Event(event).preventDefault(); // special for IE8
        return false;
    };







    // =================================================
    // ================ BIND ACTIONS ===================
    // =================================================
    var bindActions = function() {
        var clock      = this,
            container = getContainer.call(clock),
            win          = getWindow.call(clock);

        clock.on('click', function(event) { win.show(); });
        win.on('mouseleave', function(event) { $(this).hide(); });


        // === move mouse over line -> show scales ===
        win.find('.mtimepicker-line').on('mousemove', function(event) {
            var slider    = $(this).children('.mtimepicker-slider').first(),
                mousePos  = event.pageY - $(this).offset().top,
                sliderPos = __getSliderPositionByMousePosition.call( $(this), mousePos );
                setScalePosition.call( $(this), sliderPos );
        });


        // === click on line -> move slider, update time ===
        win.find('.mtimepicker-line').on('click', function(event) {
            var slider       = $(this).children('.mtimepicker-slider').first(),
                clickPos     = event.pageY - $(this).offset().top;

            setSliderPosition.call( $(this),  clickPos );
            setTimeValueBySliderPosition.call( $(this) );
            return killEvent.call(clock, event);
        });

        // === start drag slider ===
        win.find('.mtimepicker-slider').on('mousedown', function(event) {
            var drag = {
                slider    : $(this),
                mousePos  : event.pageY
            }
            clock.data('drag', drag)
            return killEvent.call(clock, event);
        });

        // === then dragging slider, update time ===
        $(document).mousemove( function(event) {
            var drag = clock.data('drag');
            if ( drag ) { // move slider and recalculate time value
                var line = drag.slider.parents('.mtimepicker-line').first();
                setSliderPosition.call( line,  ( event.pageY-line.offset().top ) );
                setTimeValueBySliderPosition.call( line );
                return killEvent.call(clock, event);
            }
        })
        // === stop drag slider ===
        .mouseup( function(event) {
            var drag = clock.data('drag');
            if ( drag ) { // stop dragging
                clock.data('drag',false);
                return killEvent.call(clock, event);
            }
        });


    }; // end bind action







    /*
    * =================================================
    * ============ EXTERNAL ENTRY POINT ===============
    * =================================================
    */
    $.fn.mTimePicker = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) { return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 )); }
        else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) { return methods.init.apply( this, arguments ); }
        else { return false; }
    };


})(jQuery);
