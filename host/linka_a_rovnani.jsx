//@include "./jachym-library.jsx"
//@include "./json.jsx"

var transformSettings;

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

function ProcessTIFsToStraightenedPSDs(transformSettings) {

    var idealPointsCenters = transformSettings.idealPointsCenters;
    var marquees = transformSettings.marquees;

    //Promenne - idealni stredy der a realne stredy der:
    var idealPoints = {
        left: idealPointsCenters.left,
        right: idealPointsCenters.right
    }
    var idealLeftPoint = idealPointsCenters.left;
    var idealRightPoint = idealPointsCenters.right;

    var scannedLeftPoint = {};
    var scannedRightPoint = {};

    var leftMarquee = marquees.left;
    var rightMarquee = marquees.right;

    //==================== VOJTA - LINKA 2018 - oba rozmery (07.03.2019) ==============

    //rotate if is in portrait mode
    if(app.activeDocument.width.as("px") < app.activeDocument.height.as("px")) {
        rotateInDegrees(90);
    }
    SetCanvasSize(2480); // Canvas Size
    ResetSwatches();
    SwitchSwatch();
    ReduceBGcomplexity();
    FillWithFGColor();
    JachNoMarchingAnts();
    CopyLayer(); // Layer Via Copy
    Desaturate(); // Desaturate
    step4(); // Color Range
    CopyLayer(); // Layer Via Copy
    NewLayer(); // Make
    ResetSwatches(); // Reset
    FillColor(); // Fill
    SelectLayer("Layer 2"); // Select
    MarchingAntsByTransparency(); // Set
    SelectLayer("Layer 3"); // Select
    MakeMask(); // Make
    CopyLayer(); // Layer Via Copy
    SelectLayerContinuous("Layer 3"); // Select
    SelectLayerContinuous("Layer 2"); // Select
    MergeSelectedLayers(); // Merge Layers
    RenameLayer("LINKA"); // Set
    MarchingAntsByTransparency(); // Set
    RefineEdge(); // Refine Edge
    CopyLayer(); // Layer Via Copy
    RenameLayer("LINKA pro vybarvovani"); // Set
    SelectLayer("LINKA"); // Select
    ShowLayer(false); // Hide
    SelectLayer("Layer 1"); // Select
    MarchingAntsByTransparency(); // Set
    SwitchSwatch(); // Exchange
    FillWithFGColor(); // Fill
    RenameLayer("BILA"); // Set
    NewLayer(); // Make
    RenameLayer("BARVA"); // Set
    SelectLayer("Background"); // Select
    SquareSelection(0, 0, 3918, 330); // Set
    CopyLayer(); // Layer Via Copy
    RenameLayer("diry"); // Set
    MoveLayerTo(6); // Move
    SelectLayer("Background"); // Select
    ShowLayer(false); // Hide
    SelectLayer("BILA"); // Select
    ShowLayer(false); // Hide
    SelectLayer("Background"); // Select
    CopyLayer(); // Layer Via Copy
    MoveLayerTo(5); // Move
    CreateClippingMask(); // Create Clipping Mask
    ShowLayer(true); // Show
    HueSaturationLightness(0, -100, -20); // Hue/Saturation
    LayerBlendStyle(); // Set
    RenameLayer("LINKA-texture"); // Set 
    NewLayer(); // Make
    CreateClippingMask(); // Create Clipping Mask
    RenameLayer("LINKA-barva"); // Set
    SelectAllLayers(); // Select All Layers
    MakeGroupFromSelection(); // Make
    RenameLayer("VRSTVY"); // Set
    NewLayer(); // Make
    RenameLayer("eSTIN"); // Set
    eSTINBlending();
    NewLayer(); // Make
    RenameLayer("eSVETLO"); // Set
    eLIGHTBlending();
    SelectLayer("LINKA");
    MarchingAntsByTransparency();
    InvertMarchingAnts();
    SelectLayer("LINKA-texture");
    DeletePixels();
    JachNoMarchingAnts();
    SelectLayer("BARVA"); // Select

    //rovnani!
    RulerHorizontal(idealPoints.left.y); //přídá pravítko
    JachRulerVrtc(idealPoints.left.x); //přídá pravítko
    JachRulerVrtc(idealPoints.right.x); //přídá pravítko
    SelectLayer("diry"); //Výběr děr
    SquareSelection(leftMarquee.left, leftMarquee.top, leftMarquee.right, leftMarquee.bottom); // Marquee na levou díru
    JachDiraColorRange(); // Marquee výběr kontury díry

    //Zde se může odehrát kontrola správnosti výběru díry

    // VÝPOČET STŘEDU LEVÉ DÍRY
    var scannedPoints = {
        left: {},
        right: {}
    };
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;

    ExpandMarquee(4, false)
    StrokeAroundSelection(4);

    JachNoMarchingAnts(); //Zrušení marquee
    SquareSelection(rightMarquee.left, rightMarquee.top, rightMarquee.right, rightMarquee.bottom); //Marquee na pravou díru
    JachDiraColorRange(); // Marquee výběr kontury díry

    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;

    ExpandMarquee(4, false)
    StrokeAroundSelection(4);

    JachNoMarchingAnts(); //Zrušení marquee

    //Tady se musí vybrat group "VRSTVY" a znovu se ukázat
    SelectLayer("VRSTVY");


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

    SelectLayer("diry");
    ModifyLayersLock(true);
    SelectLayer("LINKA pro vybarvovani");
    ModifyLayersLock(true);
    SelectLayer("LINKA-barva");
    ModifyLayersLock(false);
    SelectLayer("LINKA");
    ModifyLayersLock(true);
    SelectLayer("BILA");
    ModifyLayersLock(true);
    SelectLayer("BARVA");
    createLayerComp("vojta-kyblik", "pro vylevani apod");

    SelectLayer("eSVETLO");      // Select
    OpacityToPercent(30);      // Set
    setColorOverlay(255, 255, 255, 100);      // Set
    SelectLayer("eSTIN");      // Select
    OpacityToPercent(30);      // Set
    setColorOverlay(0, 0, 0, 100);      // Set
    setVisibilityByLayerName(false, "LINKA pro vybarvovani");      // Hide
    setVisibilityByLayerName(true, "LINKA");      // Hide
    SelectLayer("BARVA");      // Select
    createLayerComp("pavel-upravy", "pro bezne dodelavky");      // Make

    SelectLayer("eSVETLO");      // Select
    OpacityToPercent(80);      // Set
    setColorOverlay(0, 0, 255, 100);      // Set
    SelectLayer("eSTIN");      // Select
    setColorOverlay(255, 0, 0, 100);      // Set
    OpacityToPercent(60);      // Set    // Hide
    setVisibilityByLayerName(false, "LINKA-barva");      // Hide
    setVisibilityByLayerName(false, "BARVA");      // Hide
    createLayerComp("pavel-stinovani", "pro shadower");      // Make

    setVisibilityByLayerName(false, "eSVETLO");
    setVisibilityByLayerName(false, "eSTIN");
    createLayerComp("stinovana-faze", "aktualne stinovana faze");      // Make

    setVisibilityByLayerName(true, "eSVETLO");
    setVisibilityByLayerName(true, "eSTIN");
    setVisibilityByLayerName(true, "LINKA-barva")      // Show
    setVisibilityByLayerName(true, "BARVA")      // Show
    SelectLayer("eSVETLO");      // Select
    OpacityToPercent(30);      // Set
    setColorOverlay(255, 255, 255, 100);      // Set
    SelectLayer("eSTIN");      // Select
    OpacityToPercent(30);      // Set
    setColorOverlay(0, 0, 0, 100);      // Set
    SelectLayer("BARVA");      // Select
    createLayerComp("jachym-final", "pro after effects!");

    // //ted vybrat zaklad pro vojtu
    applyLayerComp("vojta-kyblik");      // Apply
    SelectLayer("BARVA");

    app.activeDocument.info.author = "Zpracovano";

    transformSettings = "";
    transformSettings = angle + "\r" + scannedPoints.left.x + "\r" + scannedPoints.left.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealPoints.left.x + "\r" + idealPoints.left.y
    app.activeDocument.info.keywords = [transformSettings];
}