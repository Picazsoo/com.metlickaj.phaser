//@include "./jachym-library.jsx"
//@include "./json.jsx"

var transformSettings;

var DIRY = "diry";
var LINKA_PRO_VYBARVOVANI = "LINKA pro vybarvovani";
var LINKA = "LINKA";
var BARVA = "BARVA";
var BILA = "BILA";
var SVETLO = "eSVETLO";
var STIN = "eSTIN";
var LINKA_BARVA = "LINKA-barva";
var LINKA_TEXTURE = "LINKA-texture";
var VRSTVY = "VRSTVY";
var BACKGROUND = "Background";


function loadFiles(source) {
    var files = [];
    if (source === 'bridge') {
        files = GetFilesFromBridge();
    } else {
        files = openDialog();
    }
    var filesWithPaths = [];
    for (var i = 0; i < files.length; i++) {
        var filePath = files[i].toString();
        filesWithPaths.push({
            fileName: filePath.substring(filePath.lastIndexOf("/") + 1),
            path: filePath
        });
    }
    return JSON.lave(filesWithPaths);
}

function batchProcessTiffsToPSDs(transformSettings, filePaths) {
    showPalettes(true)
    var saveOptions = new PhotoshopSaveOptions;
    saveOptions.alphaChannels = true;
    saveOptions.annotations = true;
    saveOptions.embedColorProfile = true;
    saveOptions.layers = true;
    saveOptions.spotColors = true;

    var numOfFiles = filePaths.length;
    for (i = 0; i < numOfFiles; i++) {
        var docRef = open(File(filePaths[i]));
        var docRefPath = app.activeDocument.fullName.toString();
        ProcessTIFsToStraightenedPSDs(transformSettings);
        var docRefPathPSD = docRefPath.substring(0, docRefPath.lastIndexOf(".")) + ".psd";
        docRef.saveAs(new File(docRefPathPSD), saveOptions);
        docRef.close(SaveOptions.DONOTSAVECHANGES);
    }
    showPalettes(true)
}

function fixWellDefinedHoles(transformSettings) {
    showPalettes(false)
    var saveOptions = new PhotoshopSaveOptions;
    saveOptions.alphaChannels = true;
    saveOptions.annotations = true;
    saveOptions.embedColorProfile = true;
    saveOptions.layers = true;
    saveOptions.spotColors = true;
    var docRef = app.activeDocument;
    fixBadHoles(transformSettings);
    //docRef.close(SaveOptions.SAVECHANGES);
    showPalettes(true)
}

function fixBadHoles(transformSettings) {

    var idealPointsCenters = transformSettings.idealPointsCenters;
    var marquees = transformSettings.marquees;

    //Promenne - idealni stredy der a realne stredy der:
    var idealPoints = {
        left: idealPointsCenters.left,
        right: idealPointsCenters.right
    }
    
    var leftMarquee = {};
    var rightMarquee = {};
    leftMarquee.top = 0;
    leftMarquee.left = 0;
    leftMarquee.right = Math.floor(app.activeDocument.width/2);
    leftMarquee.bottom = 370;

    rightMarquee.top = 0;
    rightMarquee.left = Math.floor(app.activeDocument.width/2);
    rightMarquee.right = app.activeDocument.width;
    rightMarquee.bottom = 370;

    selectLayers(DIRY);
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom);
    colorRangePinkHoles();

    var scannedPoints = {
        left: {},
        right: {}
    };
    // VÝPOČET STŘEDU LEVÉ DÍRY
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;
    deselectMarque(); //Zrušení marquee

    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom);
    colorRangePinkHoles();
    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    
    selectLayersFromTo(SVETLO,BILA);
    modifyLayersLock(false);

    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    JachRotateAroundPosition(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    moveLayerPixels(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    jachHorizontalTransform(percentScale, idealPoints.left.x, idealPoints.left.y);

}

function ProcessTIFsToStraightenedPSDs(transformSettings) {

    var idealPointsCenters = transformSettings.idealPointsCenters;
    var marquees = transformSettings.marquees;

    //Promenne - idealni stredy der a realne stredy der:
    var idealPoints = {
        left: idealPointsCenters.left,
        right: idealPointsCenters.right
    }

    var leftMarquee = marquees.left;
    var rightMarquee = marquees.right;

    //==================== VOJTA - LINKA 2018 - oba rozmery (07.03.2019) ==============

    //rotate if is in portrait mode
    if(app.activeDocument.width.as("px") < app.activeDocument.height.as("px")) {
        rotateInDegrees(90);
    }
    setCanvasSize(2480); // Canvas Size
    resetSwatches();
    switchSwatch();
    ReduceBGcomplexity();
    fillWithFGColor();
    deselectMarque();
    copyLayer(BACKGROUND, "Layer 1"); // Layer Via Copy
    desaturate(); // Desaturate
    step4(); // Color Range
    copyLayer("Layer 1", "Layer 2"); // Layer Via Copy
    newLayer("Layer 3"); // Make
    resetSwatches(); // Reset
    fillColor(); // Fill
    selectLayers("Layer 2"); // Select
    setMarqueByTransparency(); // Set
    selectLayers("Layer 3"); // Select
    makeMask(); // Make
    copyLayer("Layer 3", "Layer 4"); // Layer Via Copy
    selectLayersFromTo("Layer 4","Layer 2"); // Select
    mergeSelectedLayers(); // Merge Layers
    renameLayer(null, LINKA); // Set
    setMarqueByTransparency(); // Set
    refineEdge(); // Refine Edge
    copyLayer(LINKA, "LinkaProMe"); // Layer Via Copy
    renameLayer("LinkaProMe", LINKA_PRO_VYBARVOVANI); // Set
    setVisibilityByLayersName(false, LINKA);
    selectLayers("Layer 1"); // Select
    setMarqueByTransparency(); // Set
    switchSwatch(); // Exchange
    fillWithFGColor(); // Fill
    renameLayer("Layer 1", BILA); // Set
    newLayer(BARVA); // Make
    selectLayers(BACKGROUND); // Select
    SquareSelection(0, 0, 3918, 330); // Set
    copyLayer(BACKGROUND, DIRY); // Layer Via Copy
    moveLayerTo(6); // Move
    setVisibilityByLayersName(false, BACKGROUND);
    setVisibilityByLayersName(false, BILA);
    selectLayers(BACKGROUND); // Select
    copyLayer(BACKGROUND, LINKA_TEXTURE); // Layer Via Copy
    moveLayerTo(5); // Move
    CreateClippingMask(); // Create Clipping Mask
    ShowLayer(true); // Show
    HueSaturationLightness(0, -100, -20); // Hue/Saturation
    LayerBlendStyle(); // Set
    newLayer(LINKA_BARVA); // Make
    CreateClippingMask(); // Create Clipping Mask
    SelectAllLayers(); // Select All Layers
    MakeGroupFromSelection(); // Make
    renameLayer(null, VRSTVY); // Set
    newLayer(STIN); // Make
    eSTINBlending();
    newLayer(SVETLO); // Make
    eLIGHTBlending();
    selectLayers(LINKA);
    setMarqueByTransparency();
    invertMarquee();
    selectLayers(LINKA_TEXTURE);
    deleteSelectedPixels();
    deselectMarque();
    selectLayers(BARVA); // Select

    //rovnani!
    RulerHorizontal(idealPoints.left.y); //přídá pravítko
    JachRulerVrtc(idealPoints.left.x); //přídá pravítko
    JachRulerVrtc(idealPoints.right.x); //přídá pravítko
    selectLayers(DIRY); //Výběr děr
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom); // Marquee na levou díru
    JachDiraColorRange(); // Marquee výběr kontury díry
    ExpandMarquee(4, false)
    StrokeAroundSelection(4);
    deselectMarque(); //Zrušení marquee
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom); // Marquee na levou díru
    colorRangePinkHoles();

    //Zde se může odehrát kontrola správnosti výběru díry

    // VÝPOČET STŘEDU LEVÉ DÍRY
    var scannedPoints = {
        left: {},
        right: {}
    };
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    //todo: Mel bych tady vybrat ostre tu ruzovou barvu a z ni delat stred - ted ho delam moc brzo

    deselectMarque(); //Zrušení marquee
    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom); //Marquee na pravou díru
    JachDiraColorRange(); // Marquee výběr kontury díry

    ExpandMarquee(4, false)
    StrokeAroundSelection(4);
    deselectMarque(); //Zrušení marquee
    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom); //Marquee na pravou díru
    colorRangePinkHoles();
    
    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    deselectMarque(); //Zrušení marquee

    //Tady se musí vybrat group VRSTVY a znovu se ukázat
    selectLayers(VRSTVY);


    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    JachRotateAroundPosition(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    moveLayerPixels(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    jachHorizontalTransform(percentScale, idealPoints.left.x, idealPoints.left.y);

    selectLayers(DIRY);
    modifyLayersLock(true);
    selectLayers(LINKA_PRO_VYBARVOVANI);
    modifyLayersLock(true);
    selectLayers(LINKA_BARVA);
    modifyLayersLock(false);
    selectLayers(LINKA);
    modifyLayersLock(true);
    selectLayers(BILA);
    modifyLayersLock(true);
    selectLayers(BARVA);
    createLayerComp("vojta-kyblik", "pro vylevani apod");

    selectLayers(SVETLO);      // Select
    opacityToPercent(30, SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, SVETLO);      // Set
    selectLayers(STIN);      // Select
    opacityToPercent(30, STIN);      // Set
    setColorOverlay(0, 0, 0, 100, SVETLO);      // Set
    setVisibilityByLayersName(false, LINKA_PRO_VYBARVOVANI);      // Hide
    setVisibilityByLayersName(true, LINKA);      // Hide
    selectLayers(BARVA);      // Select
    createLayerComp("pavel-upravy", "pro bezne dodelavky");      // Make

    selectLayers(SVETLO);      // Select
    opacityToPercent(80, SVETLO);      // Set
    setColorOverlay(0, 0, 255, 100, SVETLO);      // Set
    selectLayers(STIN);      // Select
    setColorOverlay(255, 0, 0, 100, STIN);      // Set
    opacityToPercent(60, STIN);      // Set    // Hide
    setVisibilityByLayersName(false, LINKA_BARVA);      // Hide
    setVisibilityByLayersName(false, BARVA);      // Hide
    createLayerComp("pavel-stinovani", "pro shadower");      // Make
    setVisibilityByLayersName(false, SVETLO);
    setVisibilityByLayersName(false, STIN);
    createLayerComp("stinovana-faze", "aktualne stinovana faze");      // Make
    setVisibilityByLayersName(true, SVETLO);
    setVisibilityByLayersName(true, STIN);
    setVisibilityByLayersName(true, LINKA_BARVA)      // Show
    setVisibilityByLayersName(true, BARVA)      // Show
    selectLayers(SVETLO);      // Select
    opacityToPercent(30, SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, SVETLO);      // Set
    selectLayers(STIN);      // Select
    opacityToPercent(30, STIN);      // Set
    setColorOverlay(0, 0, 0, 100, STIN);      // Set
    selectLayers(BARVA);      // Select
    createLayerComp("jachym-final", "pro after effects!");
    createRedOutlineForDespecle(VRSTVY);
    setVisibilityByLayersName(false, [SVETLO, STIN]);
    createLayerComp("jachym-despecle", "pro despeckle!");
    setVisibilityByLayersName(true, [SVETLO, STIN]);
    hideRedOutlineForDespecle(VRSTVY);
    setVisibilityByLayersName(false, [SVETLO, STIN]);
    createLayerComp("jachym-imagej", "pro imageJ!");
    setVisibilityByLayersName(true, [SVETLO, STIN]);
    // //ted vybrat zaklad pro vojtu
    applyLayerComp("vojta-kyblik");      // Apply
    selectLayers(BARVA);

    app.activeDocument.info.author = "Zpracovano";

    transformSettings = "";
    transformSettings = angle + "\r" + scannedPoints.left.x + "\r" + scannedPoints.left.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealPoints.left.x + "\r" + idealPoints.left.y
    app.activeDocument.info.keywords = [transformSettings];
}