(function() {

    "use strict";

    var streaming = false,
        id = function(id) {
            return document.getElementById(id);
        },
        video = id('video'),
        canvas = id('canvas'),
        booth = id('booth'),
        drapes = id('drapes'),
        filmstrip = id('filmstrip'),
        wrapper = id('wrapper'),
        instruction = id('instruction'),
        startbutton = id('startbutton'),
        timerbtn = id('timerbutton'),
        trash = id('trash'),
        delay = id('delay'),
        delayNumber = id('delayNumber'),
        ul = id("pics"),
        timerSec = 3,
        timerimg = id('timer'),
        countdown = id('countdown'),
        snap = id('snap'),
        curtain = id('curtain'),
        width = 320,
        height = 240,
        alreadyAsked = false,
        enabled = false,
        clazzes = ["first", "second", "third", "fourth", "fifth"],
        units = ["px", "", "", "deg", "", "", "", ""],
        effects = ["blur", "grayscale", "sepia", "hue-rotate", "brightness", "invert", "contrast", "saturate"];


    var transitionEnd = (function() {

        var el = document.createElement('test'),
            transitionEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd otransitionend',
                'transition': 'transitionend'
            },
            name;

        for (name in transitionEndEventNames) {
            if (el.style[name] !== undefined) {
                return transitionEndEventNames[name];
            }
        }

    }());

    navigator.camera = {};
    window._pics = 0;
    window.count = delay.value;

    delayNumber.innerHTML = delay.value;

    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    video.addEventListener('canplay', function(ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width) || height;
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    function clear() {
        trash.classList.add('disabled');
        window._pics = 0;
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
    }

    function addFilter(filter, value) {
        var currentFilter = video.style["-webkit-filter"] || "";
        var filterName = filter.substring(0, filter.indexOf('('));
        var regex = new RegExp(filterName + "\\(\\w*\\.*\\w*\\)");
        currentFilter = regex.test(currentFilter) ? currentFilter.replace(regex, ((value === 0) ? "" : filter)) : currentFilter + " " + filter;
        video.style["-webkit-filter"] = currentFilter;
    }

    window.af = addFilter;

    function takePicture() {
        var clazz = clazzes[window._pics];
        if (window._pics > 4) {
            window._pics = 0;
        }

        trash.classList.remove('disabled');

        snap.play();
        startbutton.classList.add('flash');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/png');
        var li = document.createElement("li");
        li.classList.add(clazz);
        var photo = document.createElement("img");
        photo.setAttribute('src', data);
        photo.style["-webkit-filter"] = video.style["-webkit-filter"];
        li.appendChild(photo);
        ul.appendChild(li);
        window.count = timerSec;
        window._pics++;
        if (window._pics > 4) {
            disableBooth();
            timerbtn.classList.remove('reverse');
            timerimg.classList.remove('hide');
            countdown.classList.add('hide');
            clearInterval(window._tid);
            window._tid = null;
            window.count = 0;
            clearTimeout(window.toid);
            return;
        }
    }

    function openBooth() {
        if (!alreadyAsked) {
            navigator.getUserMedia({
                video: true,
                audio: false
            }, function(stream) {
                window.stream = stream;
                if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                video.play();

                enableBooth();

                effects.forEach(function(v, i) {
                    var input = id(v);
                    input.addEventListener('change', function(ev) {
                        if (enabled) {
                            var value = this.value + units[i];
                            id(v + "Number").innerHTML = value;
                            addFilter(v + "(" + value + ")", parseInt(this.value, 10));
                        }
                        ev.preventDefault();
                    }, false);
                });

                document.addEventListener('keydown', function(ev) {
                    if (enabled) {
                        if (ev.keyCode === 13 || ev.keyCode === 32) {
                            takePicture();
                        }
                    }
                    ev.preventDefault();
                }, false);

                delay.addEventListener('change', function(ev) {
                    if (enabled) {
                        timerSec = this.value;
                        delayNumber.innerHTML = timerSec;
                    }
                    ev.preventDefault();
                }, false);


                document.addEventListener('keyup', function(ev) {
                    if (enabled) {
                        if (ev.keyCode === 13 || ev.keyCode === 32) {
                            startbutton.classList.remove('flash');
                        }
                        ev.preventDefault();
                    }
                }, false);

                startbutton.addEventListener('mousedown', function(ev) {
                    if (enabled) {
                        startbutton.classList.add('flash');
                        ev.preventDefault();
                    }
                }, false);

                trash.addEventListener('mousedown', function(ev) {
                    if (window._pics) {
                        clear();
                        enableBooth();
                        ev.preventDefault();
                    }
                }, false);

                startbutton.addEventListener('click', function(ev) {
                    if (enabled) {
                        takePicture();
                        startbutton.classList.remove('flash');
                        ev.preventDefault();
                    }
                }, false);

                timerbtn.addEventListener('click', function(ev) {
                    if (enabled) {
                        timerbtn.classList.add('reverse');
                        timerimg.classList.add('hide');
                        countdown.classList.remove('hide');
                        delay.disabled = true;

                        window._tid = setInterval(function() {
                            startbutton.classList.add('flash');
                            takePicture();
                        }, (timerSec * 1000));
                        window.count = timerSec;
                        counter();
                        ev.preventDefault();
                    }
                }, false);

            }, function(err) {
                console.log("An error occured! " + err);
            });
            alreadyAsked = true;
        }
    }

    function counter() {
        countdown.innerHTML = window.count--;
        window.toid = setTimeout(function() {
            if (window.count > 0 && window._tid) {
                counter();
            }
        }, 1000);
        startbutton.classList.remove('flash');
    }

    function disableBooth() {
        startbutton.classList.add('disabled');
        timerbtn.classList.add('disabled');
        delay.disabled = true;
        effects.forEach(function(v) {
            var el = id(v);
            el.classList.add('disabled');
            el.disabled = true;
            id(v + "Number").classList.add('disabled');
        });

        enabled = false;
    }

    function enableBooth() {
        startbutton.classList.remove('disabled');
        timerbtn.classList.remove('disabled');
        delay.disabled = false;
        effects.forEach(function(v) {
            var el = id(v);
            el.classList.remove('disabled');
            el.disabled = false;
            id(v + "Number").classList.remove('disabled');
        });
        enabled = true;
    }

    drapes.addEventListener('click', function(ev) {
        wrapper.classList.remove('hide');
        curtain.play();
        drapes.addEventListener(transitionEnd, openBooth, true);
        instruction.classList.add('hide');
        drapes.classList.add('open');
        instruction.classList.add('open');
        ev.preventDefault();
    }, false);

})();