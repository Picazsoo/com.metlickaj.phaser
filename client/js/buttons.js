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

$("#load-tiff-files-bridge").on("click" , () => jsx.evalScript("loadFiles('bridge')", (returnJSONobj) => addFiles(returnJSONobj, /\.(TIF|TIFF|tif|tiff)$/)));
$("#load-tiff-files-explorer").on("click" , () => jsx.evalScript("loadFiles('explorer')", (returnJSONobj) => addFiles(returnJSONobj, /\.(TIF|TIFF|tif|tiff)$/)));
$("#load-psd-files-bridge").on("click" , () => jsx.evalScript("loadFiles('bridge')", (returnJSONobj) => addFiles(returnJSONobj, /\.(PSD|psd|)$/)));
$("#load-psd-files-explorer").on("click" , () => jsx.evalScript("loadFiles('explorer')", (returnJSONobj) => addFiles(returnJSONobj, /\.(PSD|psd|)$/)));
$("#clear-cache").on("click", () => clearCache());
$("#process-tiffs").on("click", () => processTiffsToPSDs());
$("#process-psds").on("click", () => processPSDsToImageJPNGs());
$("#despeckle-from-png").on("click", () => despecklePSDsWithImageJPNGs());
$("#switch-to-layer-comp").on("click", () => switchToLayerComp());
$("#fix-broken-holes").on("click", () => fixBrokenHoles());
$("#layer-comps-names").on("click", () => jsx.evalScript(`getLc()`, (lCJsonObj) => populateDropDown(lCJsonObj)));
$("#clear-files").on("click", clearFiles);

function openTab(event, idName) {
    $(".tab-content").css('visibility', 'hidden');
    $(`#${idName}`).css('visibility', 'visible');
}

$(window).on("ready", function(){
    //activate tooltips
    $("[rel='tooltip']").tooltip();
    //hide default options
    openTab(null, 'phase-prepare');
      })