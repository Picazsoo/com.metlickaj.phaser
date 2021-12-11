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
    if (CheckIfAnyPalleteIsVisible() == true) {
        app.togglePalettes();
    }
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
    app.togglePalettes();
}

function fixWellDefinedHoles(transformSettings) {
    if (CheckIfAnyPalleteIsVisible() == true) {
        app.togglePalettes();
    }
    var saveOptions = new PhotoshopSaveOptions;
    saveOptions.alphaChannels = true;
    saveOptions.annotations = true;
    saveOptions.embedColorProfile = true;
    saveOptions.layers = true;
    saveOptions.spotColors = true;
    var docRef = app.activeDocument;
    fixBadHoles(transformSettings);
    //docRef.close(SaveOptions.SAVECHANGES);
    app.togglePalettes();
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

    selectLayer(DIRY);
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom);
    colorRangePinkHoles();

    var scannedPoints = {
        left: {},
        right: {}
    };
    // VÝPOČET STŘEDU LEVÉ DÍRY
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;
    JachNoMarchingAnts(); //Zrušení marquee

    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom);
    colorRangePinkHoles();
    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    
    selectLayer(SVETLO); // Select
    selectLayerContinuous(BILA);
    modifyLayersLock(false);

    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    JachRotateAroundPosition(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    JachMove(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    JachHorizontalTransform(percentScale, idealPoints.left.x, idealPoints.left.y);

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
    JachNoMarchingAnts();
    copyLayer(null, "Layer 1"); // Layer Via Copy
    desaturate(); // Desaturate
    step4(); // Color Range
    copyLayer(); // Layer Via Copy
    newLayer(); // Make
    resetSwatches(); // Reset
    fillColor(); // Fill
    selectLayer("Layer 2"); // Select
    MarchingAntsByTransparency(); // Set
    selectLayer("Layer 3"); // Select
    makeMask(); // Make
    copyLayer(); // Layer Via Copy
    selectLayerContinuous("Layer 3"); // Select
    selectLayerContinuous("Layer 2"); // Select
    mergeSelectedLayers(); // Merge Layers
    renameLayer(LINKA); // Set
    MarchingAntsByTransparency(); // Set
    refineEdge(); // Refine Edge
    copyLayer(); // Layer Via Copy
    renameLayer(LINKA_PRO_VYBARVOVANI); // Set
    selectLayer(LINKA); // Select
    ShowLayer(false); // Hide
    selectLayer("Layer 1"); // Select
    MarchingAntsByTransparency(); // Set
    switchSwatch(); // Exchange
    fillWithFGColor(); // Fill
    renameLayer(BILA); // Set
    newLayer(); // Make
    renameLayer(BARVA); // Set
    selectLayer(BACKGROUND); // Select
    SquareSelection(0, 0, 3918, 330); // Set
    copyLayer(); // Layer Via Copy
    renameLayer(DIRY); // Set
    moveLayerTo(6); // Move
    selectLayer(BACKGROUND); // Select
    ShowLayer(false); // Hide
    selectLayer(BILA); // Select
    ShowLayer(false); // Hide
    selectLayer(BACKGROUND); // Select
    copyLayer(); // Layer Via Copy
    moveLayerTo(5); // Move
    CreateClippingMask(); // Create Clipping Mask
    ShowLayer(true); // Show
    HueSaturationLightness(0, -100, -20); // Hue/Saturation
    LayerBlendStyle(); // Set
    renameLayer(LINKA_TEXTURE); // Set 
    newLayer(); // Make
    CreateClippingMask(); // Create Clipping Mask
    renameLayer(LINKA_BARVA); // Set
    SelectAllLayers(); // Select All Layers
    MakeGroupFromSelection(); // Make
    renameLayer(VRSTVY); // Set
    newLayer(); // Make
    renameLayer(STIN); // Set
    eSTINBlending();
    newLayer(); // Make
    renameLayer(SVETLO); // Set
    eLIGHTBlending();
    selectLayer(LINKA);
    MarchingAntsByTransparency();
    InvertMarchingAnts();
    selectLayer(LINKA_TEXTURE);
    deletePixels();
    JachNoMarchingAnts();
    selectLayer(BARVA); // Select

    //rovnani!
    RulerHorizontal(idealPoints.left.y); //přídá pravítko
    JachRulerVrtc(idealPoints.left.x); //přídá pravítko
    JachRulerVrtc(idealPoints.right.x); //přídá pravítko
    selectLayer(DIRY); //Výběr děr
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom); // Marquee na levou díru
    JachDiraColorRange(); // Marquee výběr kontury díry
    ExpandMarquee(4, false)
    StrokeAroundSelection(4);
    JachNoMarchingAnts(); //Zrušení marquee
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

    JachNoMarchingAnts(); //Zrušení marquee
    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom); //Marquee na pravou díru
    JachDiraColorRange(); // Marquee výběr kontury díry

    ExpandMarquee(4, false)
    StrokeAroundSelection(4);
    JachNoMarchingAnts(); //Zrušení marquee
    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom); //Marquee na pravou díru
    colorRangePinkHoles();
    
    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    JachNoMarchingAnts(); //Zrušení marquee

    //Tady se musí vybrat group VRSTVY a znovu se ukázat
    selectLayer(VRSTVY);


    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    JachRotateAroundPosition(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    JachMove(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    JachHorizontalTransform(percentScale, idealPoints.left.x, idealPoints.left.y);

    selectLayer(DIRY);
    modifyLayersLock(true);
    selectLayer(LINKA_PRO_VYBARVOVANI);
    modifyLayersLock(true);
    selectLayer(LINKA_BARVA);
    modifyLayersLock(false);
    selectLayer(LINKA);
    modifyLayersLock(true);
    selectLayer(BILA);
    modifyLayersLock(true);
    selectLayer(BARVA);
    createLayerComp("vojta-kyblik", "pro vylevani apod");

    selectLayer(SVETLO);      // Select
    OpacityToPercent(30, SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, SVETLO);      // Set
    selectLayer(STIN);      // Select
    OpacityToPercent(30, STIN);      // Set
    setColorOverlay(0, 0, 0, 100, SVETLO);      // Set
    setVisibilityByLayerName(false, LINKA_PRO_VYBARVOVANI);      // Hide
    setVisibilityByLayerName(true, LINKA);      // Hide
    selectLayer(BARVA);      // Select
    createLayerComp("pavel-upravy", "pro bezne dodelavky");      // Make

    selectLayer(SVETLO);      // Select
    opacityToPercent(80, SVETLO);      // Set
    setColorOverlay(0, 0, 255, 100, SVETLO);      // Set
    selectLayer(STIN);      // Select
    setColorOverlay(255, 0, 0, 100, STIN);      // Set
    opacityToPercent(60, STIN);      // Set    // Hide
    setVisibilityByLayerName(false, LINKA_BARVA);      // Hide
    setVisibilityByLayerName(false, BARVA);      // Hide
    createLayerComp("pavel-stinovani", "pro shadower");      // Make
    setVisibilityByLayerName(false, SVETLO);
    setVisibilityByLayerName(false, STIN);
    createLayerComp("stinovana-faze", "aktualne stinovana faze");      // Make
    setVisibilityByLayerName(true, SVETLO);
    setVisibilityByLayerName(true, STIN);
    setVisibilityByLayerName(true, LINKA_BARVA)      // Show
    setVisibilityByLayerName(true, BARVA)      // Show
    selectLayer(SVETLO);      // Select
    OpacityToPercent(30, SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, SVETLO);      // Set
    selectLayer(STIN);      // Select
    OpacityToPercent(30, STIN);      // Set
    setColorOverlay(0, 0, 0, 100, STIN);      // Set
    selectLayer(BARVA);      // Select
    createLayerComp("jachym-final", "pro after effects!");
    createRedOutlineForDespecle(VRSTVY);
    createLayerComp("jachym-despecle", "pro despeckle!");
    hideRedOutlineForDespecle(VRSTVY);
    setVisibilityByLayerName(false, STIN);      // Hide
    setVisibilityByLayerName(false, SVETLO);      // Hide
    createLayerComp("jachym-imagej", "pro imageJ!");
    setVisibilityByLayerName(true, STIN);      // Hide
    setVisibilityByLayerName(true, SVETLO);      // Hide
    // //ted vybrat zaklad pro vojtu
    applyLayerComp("vojta-kyblik");      // Apply
    selectLayer(BARVA);

    app.activeDocument.info.author = "Zpracovano";

    transformSettings = "";
    transformSettings = angle + "\r" + scannedPoints.left.x + "\r" + scannedPoints.left.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealPoints.left.x + "\r" + idealPoints.left.y
    app.activeDocument.info.keywords = [transformSettings];
}