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
    pavel_upravy();



    // //ted dalsí layercomps
    // SelectLayer("eSVETLO");
    // OpacityToPercent(30);
    // setOverlay1();
    // SelectLayer("eSTIN");
    // setOverlay2();
    // OpacityToPercent(30);
    // hideLayer("LINKA pro vybarvovani");
    // showLayer("LINKA");
    // createLayerComp("pavel-upravy", "kocour");

    // //ted dalsi layercomp
    // SelectLayer("eSVETLO");
    // OpacityToPercent(80);
    // setOverlay3();
    // SelectLayer("eSTIN");
    // OpacityToPercent(60);
    // setOverlay4();
    // hideLayer("LINKA-barva");
    // hideLayer("BARVA");
    // createLayerComp("pavel-stinovani", "smradoch");

    // //ted dalsi layercomp
    // showLayer("LINKA-barva");
    // showLayer("BARVA");
    // SelectLayer("eSVETLO");
    // OpacityToPercent(30);
    // setOverlay5();
    // SelectLayer("eSTIN");
    // OpacityToPercent(30);
    // setOverlay6();
    // createLayerComp("jachym-final", "fsdfsd");

    // //ted vybrat zaklad pro vojtu
    // SelectLayer("BARVA");

    app.activeDocument.info.author = "Zpracovano";

    transformSettings = "";
    transformSettings = angle + "\r" + scannedPoints.left.x + "\r" + scannedPoints.left.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealPoints.left.x + "\r" + idealPoints.left.y
    app.activeDocument.info.keywords = [transformSettings];

}

cTID = function(s) { return app.charIDToTypeID(s); };
sTID = function(s) { return app.stringIDToTypeID(s); };

//
//==================== pavel-upravy ==============
//
function pavel_upravy() {
  // Select
  function step1(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSVETLO");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(16);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step2(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 30);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step3(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 255);
    desc4.putDouble(cTID('Grn '), 255);
    desc4.putDouble(cTID('Bl  '), 255);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Select
  function step4(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSTIN");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(15);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step5(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 30);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step6(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 0);
    desc4.putDouble(cTID('Grn '), 0);
    desc4.putDouble(cTID('Bl  '), 0);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Hide
  function step7(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "LINKA pro vybarvovani");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Hd  '), desc1, dialogMode);
  };

  // Show
  function step8(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "LINKA");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Shw '), desc1, dialogMode);
  };

  // Select
  function step9(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "BARVA");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(8);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Make
  function step10(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("compsClass"));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putBoolean(sTID("useVisibility"), true);
    desc2.putBoolean(sTID("usePosition"), true);
    desc2.putBoolean(sTID("useAppearance"), true);
    desc2.putBoolean(sTID("useChildLayerCompState"), false);
    desc2.putString(cTID('Ttl '), "pavel-upravy");
    desc1.putObject(cTID('Usng'), sTID("compsClass"), desc2);
    executeAction(cTID('Mk  '), desc1, dialogMode);
  };

  // Select
  function step11(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSVETLO");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(16);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step12(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 80);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step13(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 0);
    desc4.putDouble(cTID('Grn '), 6.01556408219039);
    desc4.putDouble(cTID('Bl  '), 255);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Select
  function step14(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSTIN");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(15);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step15(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 255);
    desc4.putDouble(cTID('Grn '), 0);
    desc4.putDouble(cTID('Bl  '), 0);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step16(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 60);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Hide
  function step17(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "LINKA-barva");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Hd  '), desc1, dialogMode);
  };

  // Hide
  function step18(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "BARVA");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Hd  '), desc1, dialogMode);
  };

  // Make
  function step19(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("compsClass"));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putBoolean(sTID("useVisibility"), true);
    desc2.putBoolean(sTID("usePosition"), true);
    desc2.putBoolean(sTID("useAppearance"), true);
    desc2.putBoolean(sTID("useChildLayerCompState"), false);
    desc2.putString(cTID('Ttl '), "pavel-stinovani");
    desc1.putObject(cTID('Usng'), sTID("compsClass"), desc2);
    executeAction(cTID('Mk  '), desc1, dialogMode);
  };

  // Show
  function step20(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "BARVA");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Shw '), desc1, dialogMode);
  };

  // Show
  function step21(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "LINKA-barva");
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID('Shw '), desc1, dialogMode);
  };

  // Select
  function step22(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSVETLO");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(16);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step23(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 30);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step24(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 255);
    desc4.putDouble(cTID('Grn '), 255);
    desc4.putDouble(cTID('Bl  '), 255);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Select
  function step25(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "eSTIN");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(15);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Set
  function step26(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 30);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Set
  function step27(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(cTID('enab'), true);
    desc3.putBoolean(sTID("present"), true);
    desc3.putBoolean(sTID("showInDialog"), true);
    desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc4 = new ActionDescriptor();
    desc4.putDouble(cTID('Rd  '), 0);
    desc4.putDouble(cTID('Grn '), 0);
    desc4.putDouble(cTID('Bl  '), 0);
    desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
    desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc2.putObject(cTID('SoFi'), cTID('SoFi'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
    executeAction(cTID('setd'), desc1, dialogMode);
  };

  // Select
  function step28(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), "BARVA");
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    var list1 = new ActionList();
    list1.putInteger(8);
    desc1.putList(cTID('LyrI'), list1);
    executeAction(cTID('slct'), desc1, dialogMode);
  };

  // Make
  function step29(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("compsClass"));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putBoolean(sTID("useVisibility"), true);
    desc2.putBoolean(sTID("usePosition"), true);
    desc2.putBoolean(sTID("useAppearance"), true);
    desc2.putBoolean(sTID("useChildLayerCompState"), false);
    desc2.putString(cTID('Ttl '), "jachym-final");
    desc1.putObject(cTID('Usng'), sTID("compsClass"), desc2);
    executeAction(cTID('Mk  '), desc1, dialogMode);
  };

  // Apply
  function step30(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(sTID("compsClass"), "vojta-kyblik");
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('applyComp'), desc1, dialogMode);
  };

  step1();      // Select
  step2();      // Set
  step3();      // Set
  step4();      // Select
  step5();      // Set
  step6();      // Set
  step7();      // Hide
  step8();      // Show
  step9();      // Select
  step10();      // Make
  step11();      // Select
  step12();      // Set
  step13();      // Set
  step14();      // Select
  step15();      // Set
  step16();      // Set
  step17();      // Hide
  step18();      // Hide
  step19();      // Make
  step20();      // Show
  step21();      // Show
  step22();      // Select
  step23();      // Set
  step24();      // Set
  step25();      // Select
  step26();      // Set
  step27();      // Set
  step28();      // Select
  step29();      // Make
  step30();      // Apply
};