var api_studies_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/studies";
var study;
var column=1;
var row=1;

 $(document).ready(function() {

     var config = {
         maxWebWorkers: navigator.hardwareConcurrency || 1,
         startWebWorkersOnDemand: true,
         webWorkerPath: 'js/cornerstone/cornerstoneWADOImageLoaderWebWorker.js',
         taskConfiguration: {
             'decodeTask': {
                 // loadCodecsOnStartup: false,
                 // initializeCodecsOnStartup: false,
                 codecsPath: 'cornerstoneWADOImageLoaderCodecs.js',
                 // usePDFJS: false
             },
             'sleepTask': {
                 sleepTime: 3000
             }
         }
     };
     cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

    //image layout
    var GridButton = $(".img-editor .nav ul.view li.layout");
    var Layout = $(".img-editor .nav ul.view li.layout ul.pull-right.dropdown-menu");
    GridButton.click(function(){
        if(Layout.hasClass("grid_view")){
            Layout.removeClass('grid_view');
        }else{
            Layout.addClass('grid_view');
        }
        
    });
    init_layout_set();
    $('.image-layout').droppable({
        drop: function(evt, ui) {
            var stackIndex = ui.draggable.attr("index");
            element_id = $(this).attr("id");
            element = $("#"+element_id+" #dicomImage").get(0);         
            loadStudy(element,stackIndex);            
        }
    });  
    $(".img-editor").find('.choose-layout a').on('click touchstart',function(){
        
        var type = $(this).text();
        clone_image_viewer(type);
    });

 });

 
  function init_layout_set(){
       $(".img-preview").css("height",$(window).height()-$("#header").height());console.log("llll",$(".img-preview").height());
        $(".image-layout").css("width","100%");
        $(".image-layout").css("height","100%");
        
    }



 function resetImageViewer() {
     cornerstone.imageCache.purgeCache();
     $("#seriesList").remove();

     var seriesList = '<div class="img-bar" id="seriesList"> <div class="thumbnails list-group"> </div> </div>'
     $('#seriesHolder').append(seriesList);

     $("#dicomImage").remove();
     var dicomImageDiv = '<div class="dicom-img" id="dicomImage"><div>';



     $('#dicom-img-holder').append(dicomImageDiv);

     $('#dicom-img-holder').append('<div id="mrbottomright" style="position: absolute;bottom:3px; right:3px">Zoom: </div>');
     $('#dicom-img-holder').append('<div id="mrbottomleft" style="position: absolute;bottom:3px; left:3px"> WW/WC: </div>');

    
 }

 function openStudyForViewing(userAccessToken, study1) {
   
     resetImageViewer();

     //get data from server
     var xhr = new XMLHttpRequest();
     xhr.withCredentials = false;

     $('#series-thumbnail-list').empty();

     xhr.addEventListener("readystatechange", function() {
         if (this.readyState === 4) {
             var data = JSON.parse(this.responseText);
             //load thumbnails first
             study = data;
             loadThumbnails();
             loadStudy($('#img-layout0 #dicomImage').get(0), 0);
             var intercomMetadata = {
                 "patient": study.patientFirstName + " " +  study.patientLastName ,
                 "patientId": study.patientId,
                 "accession": study.accessionNumber,
                 "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
                 "company": study1.company,
                 "modality": study.modality,
                 "studyDescription": study.studyDescription,
                 "images": study.instanceCount
             }
             //console.log("intercomMetadata", intercomMetadata);
             sendIntercomEvent("viewed-images", intercomMetadata);
         } else {

         }
     });

     xhr.open("GET", api_studies_url + "/" + study1.qubsStudyInstanceUid); //secure api
     xhr.setRequestHeader("content-type", "application/json");
     xhr.setRequestHeader("authorization", userAccessToken);
     xhr.send(null);

     var currentValueSpan = document.getElementById("loadProgress");
     currentValueSpan.textContent = 'Loading please wait';
     currentValueSpan.style.display = 'block';
     //click the close button in image-study screen

     jQuery(".btn-img-close").bind('click', function(){
        
        var image_layout_length = $(".image-layout").length;
        for(var i=1; i<image_layout_length; i++ ){
            $("#img-layout"+i).remove();
        }
        init_layout_set();
        $("#content .patient-list").fadeIn(300);
        
     });
 }


 function loadThumbnails() {
     var seriesList = $('#seriesList').find('.thumbnails')[0];
     var seriesIndex = 0;
     study.series.forEach(function(series, stackIndex) {
        var seriesDescription = "";
            if (checkNested(series, "seriesDescription")) {
                seriesDescription =  study.studyDescription ;
            } else {
                seriesDescription =  "" ;
            }
          
          
            if(seriesDescription == undefined){
                seriesDescription =  "" ;
            }
            var seriesEntry = 
                '<div class="cell" style="width:100px">' +
                '<a draggable = "true" class="list-group-iteme list-group-item ui-draggable ui-draggable-handle" index="'+seriesIndex+'"'+
                'oncontextmenu="return false" unselectable="on" onselectstart="return false;" onmousedown="return false;">' +
                '<div class="csthumbnail "' +
                'oncontextmenu="return false"' +
                'unselectable="on"' +
                'onselectstart="return false;"' +
                'onmousedown="return false;"></div>' +
                "<div class='text-center small'>" + seriesDescription + '</div></a></div>';


            // Add to series list
            var seriesElement = $(seriesEntry).appendTo(seriesList);
            var seriesElement = $(seriesElement).find('a')[0];
            // Find thumbnail
            var thumbnail = $(seriesElement).find('div')[0];
            

            cornerstone.enable(thumbnail);

            // Have cornerstone load the thumbnail image
            var imageId = "dicomweb:" + series.instances[0].imageId;
            cornerstone.loadAndCacheImage(imageId).then(function(image) {
                // Make the first thumbnail active
                if (series.seriesIndex === 0) {
                    $(seriesElement).find('div')[0].addClass('active');
                }
                    console.log("Thum",$(seriesElement));
                // Display the image
                cornerstone.displayImage(thumbnail, image);
                $(seriesElement).draggable({
                    start: function(event, ui) { $(this).css("z-index", 10000000); },
                    helper: "clone",
                    cursor: 'move'
                });
            });

            // Handle thumbnail click
            $(seriesElement).on('click touchstart', function() {
                loadStudy($('#img-layout0 #dicomImage').get(0), stackIndex);
            });
            seriesIndex++;
        }, this);

      resizeThumbnailsViewer();

      $(window).resize(function() {
          resizeThumbnailsViewer();
      });

    
      function resizeThumbnailsViewer(){
       
        var window_width = $(window).width();
        console.log("windows_width",window_width);

        var full_serieslist_width;
        var full_seriesHolder_width;
        var window_height = $(window).height();
        var thumb_count = $(".cell").length;

        if(window_width>=1007){
            $("#seriesList").width(159);
            $("#seriesHolder").width(237);
            if($("#seriesList").height()<$(window).height()){
                $("#seriesHolder").height($("#seriesList").height()+100);
            }else{
                 $("#seriesHolder").height($(window).height());
            }
           
        }else if(window_width<1007 ){
            var serieslist_width = $(".cell").width()*thumb_count;
            if(parseFloat(serieslist_width) < parseFloat(window_width)){
                 $("#seriesList").width(window_width);
            }else{               
                $("#seriesList").width(serieslist_width);
            }

            $("#seriesHolder").width(window_width-30);
            if($("#seriesList").height()<150){
                $("#seriesHolder").height($("#seriesList").height()+30);                
            }else{
                 $("#seriesHolder").height(150);
            }
        }
     }
 }

var init = function (lay_index) {
        var self=this;
        var str= '<div class="image-layout" id="img-layout'+lay_index+'" ><div class="img-head">' +
            '<div class="numbers"><span class="current-num" id="current-num">1</span><span class="total-num" id="total-num">0</span>' +
            '</div><div class="progress" id="progress-bar-holder"><span class="progress-bar" id="progress-bar" style="width: 0%; display:none;">' +
            '</span></div><div id="loadProgress"></div></div><div class="img-holder">' +
            '<div class="dicom-img-holder" id="dicom-img-holder" oncontextmenu="return false;" class="disable-selection noIbar" unselectable="on" ' +
            'onselectstart="return false;" onmousedown="return false;"><div class="dicom-img" id="dicomImage"></div></div></div></div>';
        var newDiv=$.parseHTML(str);

        $(".img-preview").append(newDiv);
        $(newDiv).droppable({
            drop: function (evt, ui) {
                var stackIndex = ui.draggable.attr("index");
                
                self.element=$(newDiv).find("#dicomImage").get(0);
                loadStudy(self.element,stackIndex)
            }
        });
    };

function clone_image_viewer(type){
    var element;
    var image_layout_length = $(".image-layout").length;
    for(var i=0; i<image_layout_length; i++ ){
        $("#img-layout"+i).remove();
    }
    var type_arr = type.split('x');
    column = type_arr[0];
    row = type_arr[1];
    
    var count = row * column; 
    for(j=0;j<count;j++){       
        init (j);

    }
    var initial_height = $(".img-preview").height();
    var layout_width = (100/ column)+ "%";
    var layout_height = (initial_height / row) + "px";
    $(".image-layout").css("width",layout_width);
    $(".image-layout").css("height",layout_height);
    // resizeStudyViewer();

    
    element = $("#img-layout0 #dicomImage").get(0);         
    loadStudy(element,0);   
}
    

    

    

//   var element;
 var lay_index = 0;

 
 function loadStudy(element, stackIndex) {
    // *********************************************************************************************************
     // Listen for changes to the viewport so we can update the text overlays in the corner
        function onViewportUpdated(e) {
            var viewport = cornerstone.getViewport(e.target)
            $('#mrbottomleft').text("WW/WC: " + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
            $('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2));
        };

        $(element).on("CornerstoneImageRendered", onViewportUpdated);

        $(element).on("CornerstoneNewImage", onNewImage);

     // On new image (displayed?)
        function onNewImage(e, eventData) {


            var toolData = cornerstoneTools.getToolState(element, 'stack');
            if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
                return;
            }
            var stack = toolData.data[0];

            // Update Image number overlay 
            $('#current-num').text((stack.currentImageIdIndex + 1));
            $('#total-num').text(stack.imageIds.length);
        }

        var imageIds = [];
        study.series[stackIndex].instances.forEach(function(instance) {
            imageIds.push("wadouri:" + instance.imageId)
        }, this);

        var stack = {
            currentImageIdIndex: 0,
            imageIds: imageIds
        };

        // Deep copy the imageIds
        var loadProgress = {
            "imageIds": stack.imageIds.slice(0),
            "total": stack.imageIds.length,
            "remaining": stack.imageIds.length,
            "percentLoaded": 0,
        };

        var totalImagesCount = imageIds.length; //store total images to load to display in progress bar
        function onImageLoaded(event, args) {
           
            var imageId = args.image.imageId;
            var imageIds = loadProgress["imageIds"];

            // Remove all instances, in case the stack repeats imageIds
            for (var i = imageIds.length - 1; i >= 0; i--) {
                if (imageIds[i] === imageId) {
                    imageIds.splice(i, 1);
                }
            }

            // Populate the load progress object
            loadProgress["remaining"] = imageIds.length;
            loadProgress["percentLoaded"] = parseInt(100 - loadProgress["remaining"] / loadProgress["total"] * 100, 10);

            if ((loadProgress["remaining"] / loadProgress["total"]) === 0) {
                console.timeEnd("Loading");
            }

            // Write to a span in the DOM
            var currentValueSpan = document.getElementById("loadProgress");
            currentValueSpan.textContent = loadProgress["percentLoaded"] + '%';


            var totalImages = document.getElementById("total-num");
            totalImages.textContent = loadProgress["total"];

            var progressBar = document.getElementById("progress-bar");
            progressBar.style = 'width: ' + loadProgress["percentLoaded"] + '%;'

            var progressBarHolder = document.getElementById("progress-bar-holder");
            var currentValueSpan = document.getElementById("loadProgress");

            if (loadProgress["percentLoaded"] == 100) {
                //load complete hide progress bar
                progressBarHolder.style.display = 'none';
                currentValueSpan.style.display = 'none';
            } else {
                progressBarHolder.style.display = 'block';
                currentValueSpan.style.display = 'block';
            }

            //  console.timeEnd(JSON.stringify( loadProgress));

        }

        // Image loading events are bound to the cornerstone object, not the element
        $(cornerstone).on("CornerstoneImageLoaded", onImageLoaded);

        $(cornerstone).on("CornerstoneImageCacheFull", function(cacheInfo) {
            console.log(cacheInfo);
        });

        // image enable the dicomImage element and the mouse inputs
        console.time("Loading");

        var container = element.parentNode;

        $('#fullscreen').click(function(e) {
            if (!document.fullscreenElement && !document.mozFullScreenElement &&
                !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            }
        });

        $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function() {
            if (!document.fullscreenElement && !document.mozFullScreenElement &&
                !document.webkitFullscreenElement && !document.msFullscreenElement) {
                $(container).width(256);
                $(container).height(256);
                $(element).width(256);
                $(element).height(256);
            } else {
                $(container).width($(window).width());
                $(container).height($(window).height());
                $(element).width($(container).width());
                $(element).height($(container).height());
            }
            cornerstone.resize(element, true);
        });

        $(window).on("resize orientationchange", function() {
            if (document.fullscreenElement || document.mozFullScreenElement ||
                document.webkitFullscreenElement || document.msFullscreenElement) {
                $(container).width($(window).width());
                $(container).height($(window).height());
                $(element).width($(container).width());
                $(element).height($(container).height());
                cornerstone.resize(element, true);
            }
        });

     // Call resize main on window resize
     $(window).resize(function() {
         resizeStudyViewer();
     });
     
     //this function needs to chage
     function resizeStudyViewer() {
        var window_width = $(window).width();
        var initial_width = $(".img-holder").width();
        var initial_height = $(window).height() - $("#header").height();
        var left_width = $("#seriesHolder").width();
        var side_width = $("#sidebar").width();
        var height;
        var width = initial_width;
        
         height = $(".image-layout").height()- $(".img-head").height()-40;
         if(window_width>1000 && window_width<1400){
            $(".image-layout").css("width",(100 / column)+"%");
            height = $(".image-layout").height() - $(".img-head").height()-40;
            //width = $(window).width() - parseFloat(left_width) - parseFloat(side_width)-230;
            width= initial_width - 50;

           

         }else if (window_width<1000){
            height = $(".image-layout").height() - $(".img-head").height()-40;
            $(".image-layout").css("width","100%");
            // width = $(window).width() - parseFloat(left_width) - parseFloat(side_width)-230;
         }
        // width = $(".image-layout").width();
         $('#dicomImage').height(height);
         $('#dicom-img-holder').height(height);

         $('#dicomImage').width(width);
         $('#dicom-img-holder').width(width);

         $(container).width(width);
         $(container).height(height);
         $(element).width($(container).width());
         $(element).height($(container).height());
         cornerstone.resize(element, true);
     }



     cornerstone.enable(element);

     var configuration = {
         testPointers: function(eventData) {
             return (eventData.numPointers >= 3);
         }
     };
     cornerstoneTools.panMultiTouch.setConfiguration(configuration);
     resizeStudyViewer();
     cornerstone.loadAndCacheImage(imageIds[stack.currentImageIdIndex]).then(function(image) {


         var defaultViewport = cornerstone.getDefaultViewportForImage(element, image);

         // display this image
         cornerstone.displayImage(element, image, defaultViewport);
         

         cornerstoneTools.mouseInput.enable(element);
         cornerstoneTools.mouseWheelInput.enable(element);



         // set the stack as tool state
         cornerstoneTools.addStackStateManager(element, ['stack']);
         cornerstoneTools.addToolState(element, 'stack', stack);

         // Enable all tools we want to use with this element
         cornerstoneTools.stackScroll.activate(element, 1);
         cornerstoneTools.stackScrollWheel.activate(element);

         // Uncomment below to enable stack prefetching
         // With the example images the loading will be extremely quick, though
         cornerstoneTools.stackPrefetch.enable(element, 3);



         // Enable all tools we want to use with this element
         cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
         cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
         cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
         //cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
         cornerstoneTools.probe.enable(element);
         cornerstoneTools.length.enable(element);
         cornerstoneTools.ellipticalRoi.enable(element);
         cornerstoneTools.rectangleRoi.enable(element);
         cornerstoneTools.angle.enable(element);
         cornerstoneTools.highlight.enable(element);

         //mobile
         cornerstoneTools.touchInput.enable(element);

         // Enable all tools we want to use with this element
         cornerstoneTools.zoomTouchPinch.activate(element);
         //cornerstoneTools.rotateTouch.activate(element);
         cornerstoneTools.wwwcTouchDrag.activate(element);
         cornerstoneTools.panMultiTouch.activate(element);


         setupButtons();

         // helper function used by the tool button handlers to disable the active tool
         // before making a new tool active
         function disableAllTools() {
             cornerstoneTools.wwwc.disable(element);
             cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
             cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
             cornerstoneTools.probe.deactivate(element, 1);
             cornerstoneTools.length.deactivate(element, 1);
             cornerstoneTools.angle.deactivate(element, 1);
             cornerstoneTools.ellipticalRoi.deactivate(element, 1);
             cornerstoneTools.rectangleRoi.deactivate(element, 1);
             cornerstoneTools.stackScroll.deactivate(element, 1);
             cornerstoneTools.wwwcTouchDrag.deactivate(element);
             cornerstoneTools.zoomTouchDrag.deactivate(element);
             cornerstoneTools.panTouchDrag.deactivate(element);
             cornerstoneTools.stackScrollTouchDrag.deactivate(element);

             //mobile
             cornerstoneTools.panTouchDrag.deactivate(element);
             cornerstoneTools.rotateTouchDrag.deactivate(element);
             cornerstoneTools.rotateTouch.disable(element);
             cornerstoneTools.ellipticalRoiTouch.deactivate(element);
             cornerstoneTools.angleTouch.deactivate(element);
             cornerstoneTools.rectangleRoiTouch.deactivate(element);
             cornerstoneTools.lengthTouch.deactivate(element);
             cornerstoneTools.probeTouch.deactivate(element);
             cornerstoneTools.zoomTouchDrag.deactivate(element);
             cornerstoneTools.wwwcTouchDrag.deactivate(element);
             cornerstoneTools.stackScrollTouchDrag.deactivate(element);
         }

         function setupButtons() {

             // Tool button event handlers that set the new active tool

             // WW/WL
             $("#btn_ww").on('click touchstart', function() {
                 disableAllTools();

                 cornerstoneTools.wwwcTouchDrag.activate(element);
                 cornerstoneTools.wwwc.activate(element, 1);
                 cornerstoneTools.wwwcTouchDrag.activate(element);

             });

             // Invert
             $("#btn_invert").on('click touchstart', function() {
                 disableAllTools();

                 var viewport = cornerstone.getViewport(element);
                 // Toggle invert
                 if (viewport.invert === true) {
                     viewport.invert = false;
                 } else {
                     viewport.invert = true;
                 }
                 cornerstone.setViewport(element, viewport);

             });

             // Zoom
             $("#btn_zoom").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.zoomTouchPinch.activate(element);
                 cornerstoneTools.zoom.activate(element, 5); // 5 is right mouse button and left mouse button
                 cornerstoneTools.zoomTouchDrag.activate(element);

             });

             // Pan
             $("#btn_pan").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.panTouchDrag.activate(element);
                 cornerstoneTools.pan.activate(element, 3); // 3 is middle mouse button and left mouse button
                 cornerstoneTools.panTouchDrag.activate(element);

             });

             // Stack scroll
             $("#btn_scroll").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.stackScrollTouchDrag.activate(element);
                 cornerstoneTools.stackScroll.activate(element, 1);
                 cornerstoneTools.stackScrollTouchDrag.activate(element);

             });

             // Length measurement
             $("#btn_length").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.lengthTouch.activate(element);
                 cornerstoneTools.length.activate(element, 1);

             });

             // Angle measurement
             $("#btn_angle").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.angleTouch.activate(element);
                 cornerstoneTools.angle.activate(element, 1);

             });

             // Pixel probe
             $("#btn_probe").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.probeTouch.activate(element);
                 cornerstoneTools.probe.activate(element, 1);

             });

             // Elliptical ROI
             $("#btn_eroi").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.ellipticalRoiTouch.activate(element);
                 cornerstoneTools.ellipticalRoi.activate(element, 1);

             });

             // Rectangle ROI
             $("#btn_rroi").on('click touchstart', function() {
                 disableAllTools();
                 cornerstoneTools.rectangleRoiTouch.activate(element);
                 cornerstoneTools.rectangleRoi.activate(element, 1);

             });

             // Play clip
             $("#btn_play").on('click touchstart', function() {

                 var stackState = cornerstoneTools.getToolState(element, 'stack');
                 var frameRate = stackState.data[0].frameRate;
                 // Play at a default 10 FPS if the framerate is not specified
                 if (frameRate === undefined) {
                     frameRate = 10;
                 }
                 cornerstoneTools.playClip(element, frameRate);

             });

             // Stop clip
             $("#btn_stop").on('click touchstart', function() {

                 cornerstoneTools.stopClip(element);

             });

             /*
                          $('#resetViewport').click(function() {
                              var canvas = $('#dicomImage canvas').get(0);
                              var enabledElement = cornerstone.getEnabledElement(element);
                              var viewport = cornerstone.getDefaultViewport(canvas, enabledElement.image)
                              cornerstone.setViewport(element, viewport);
                          });
             */
         };


     });
 }

 //check if a nested object has a property
//http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
function checkNested(obj /*, level1, level2, ... levelN*/ ) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
}