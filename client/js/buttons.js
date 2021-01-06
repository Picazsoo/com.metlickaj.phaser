/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

$("#restartExt").on("click", function() {
    try {
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // if we're restarting then we should remove all the eventListeners so we don't get double events //
        // Try get the point over                                                                         //
        // CRITICAL MAKE SURE TO CLOSE NULLIFY ETC. ANY LOOSE WATCHERS, EVENTLISTENERS, GLOBALS ETC.      //
        // CRITICAL MAKE SURE TO CLOSE NULLIFY ETC. ANY LOOSE WATCHERS, EVENTLISTENERS, GLOBALS ETC.      //
        // CRITICAL MAKE SURE TO CLOSE NULLIFY ETC. ANY LOOSE WATCHERS, EVENTLISTENERS, GLOBALS ETC.      //
        // CRITICAL MAKE SURE TO CLOSE NULLIFY ETC. ANY LOOSE WATCHERS, EVENTLISTENERS, GLOBALS ETC.      //
        // for example watcher.close();                                                                   //
        // Then reset the UI to load it's page (if it hasn't change page)                                 //
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        process.removeAllListeners();
        window.location.href = "index.html";
    } catch (e) {
        window.location.href = "index.html";
    }
});

$("#load-files-bridge").on("click" , () => jsx.evalScript("loadFiles('bridge')", addFiles));
$("#load-files-explorer").on("click" , () => jsx.evalScript("loadFiles('explorer')", addFiles));
$("#clear-cache").on("click", () => clearCache());
$("#process-tiffs").on("click", () => processTiffsToPSDs());

$(window).on("ready", function(){
    $("[rel='tooltip']").tooltip();
      })