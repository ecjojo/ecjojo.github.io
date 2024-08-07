$(function(){
    $(".typed").typed({
        strings: [
            "a Developer🐛", 
            "a Creator🪄", 
            "a Writer🐚", 
            
           "I building projects with AIGen🪅", 
           "I writing articles to share my thoughts🧠"
        ],


        // Optionally use an HTML element to grab strings from (must wrap each string in a <p>)
        stringsElement: null,
        // typing speed
        typeSpeed: 30,
        // time before typing starts
        startDelay: 1200,
        // backspacing speed
        backSpeed: 20,
        // time before backspacing
        backDelay: 600,
        // loop
        loop: true,
        // false = infinite
        loopCount: -1,
        // show cursor
        showCursor: false,
        // character for cursor
        cursorChar: "|",
        // attribute to type (null == text)
        attr: null,
        // either html or text
        contentType: 'html',
        // call when done callback function
        callback: function() {},
        // starting callback function before each string
        preStringTyped: function() {},
        //callback for every typed string
        onStringTyped: function() {},
        // callback for reset
        resetCallback: function() {}
    });
});