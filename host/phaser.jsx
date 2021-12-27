//@include "../../common_library/photoshop_library.jsx"

var transformSettings;

var saveOptions = new PhotoshopSaveOptions;
saveOptions.alphaChannels = true;
saveOptions.annotations = true;
saveOptions.embedColorProfile = true;
saveOptions.layers = true;
saveOptions.spotColors = true;

//Layer names used in project
var lr = {
    DIRY: "diry",
    LINKA_PRO_VYBARVOVANI: "LINKA pro vybarvovani",
    LINKA: "LINKA",
    BARVA: "BARVA",
    BILA: "BILA",
    SVETLO: "eSVETLO",
    STIN: "eSTIN",
    LINKA_BARVA: "LINKA-barva",
    LINKA_TEXTURE: "LINKA-texture",
    VRSTVY: "VRSTVY",
    BACKGROUND: "Background",
    LAYER1: "Layer 1",
    LAYER2: "Layer 2",
    LAYER3: "Layer 3",
    LAYER4: "Layer 4",
    LAYER5: "Layer 5"
}

//Color ranges settings for color range method
var rn = {
    LINKA: {
        fuzziness: 172,
        min: { luminance: 12.25, a: 0, b: 0 },
        max: { luminance: 12.25, a: 0, b: 0 }
    },
    WHITE_BACKGROUND: {
        fuzziness: 35,
        min: { luminance: 97.28, a: -3.13, b: 0.59 },
        max: { luminance: 99.96, a: 0.61, b: 7.07 }
    },
    PINK_OUTLINES: {
        fuzziness: 39, 
        min: { luminance: 58.47, a: 87.95, b: -36.21 },
        max: { luminance: 58.47, a: 87.95, b: -36.21 }
    },
    HOLE_OLD_SCANNER: {
        fuzziness: 0,
        min: { luminance: 63.97, a: -59.22, b: 0.32 },
        max: { luminance: 85.8, a: -15.69, b: 12.7 }
    },
    HOLE_NEW_SCANNER: {
        fuzziness: 70,
        min: { luminance: 92.23, a: -29.87, b: -1.63 },
        max: { luminance: 93.96, a: -27.04, b: 0.69 }
    },
    SHADOW_MANUAL_OLD: {
        fuzziness: 95,
        min: { luminance: 35.28, a: 54.38, b: -18.04 },
        max: { luminance: 66.13, a: 81.52, b: 48.93 }
    }
}

function loadFiles(source) {
    var files = [];
    if (source === 'bridge') {
        files = getFilesFromBridge();
    } else {
        files = openDialog();
    }
    var filesWithPaths = [];
    files.forEach(function (file) {
        var filePath = file.toString();
        filesWithPaths.push({
            fileName: filePath.substring(filePath.lastIndexOf("/") + 1),
            path: filePath
        });
    })
    return JSON.lave(filesWithPaths);
}

function batchProcessTiffsToPSDs(transformSettings, filePaths) {
    try {
        hidePalettes();
        filePaths.forEach(function (filePath) {
            var docRef = open(File(filePath));
            var docRefPath = app.activeDocument.fullName.toString();
            processTIFsToStraightenedPSDs(transformSettings);
            var docRefPathPSD = docRefPath.substring(0, docRefPath.lastIndexOf(".")) + ".psd";
            docRef.saveAs(new File(docRefPathPSD), saveOptions);
            docRef.close(SaveOptions.DONOTSAVECHANGES);
        });
        showPalettes();
    } catch (error) {
        alert(error);
        showPalettes();
    }

}

function fixBrokenHoles(transformSettings) {
    hidePalettes()
    fixBadHoles(transformSettings);
    showPalettes()
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
    leftMarquee.right = Math.floor(app.activeDocument.width / 2);
    leftMarquee.bottom = 370;

    rightMarquee.top = 0;
    rightMarquee.left = Math.floor(app.activeDocument.width / 2);
    rightMarquee.right = app.activeDocument.width;
    rightMarquee.bottom = 370;

    selectLayers(DIRY);
    squareMarquee(leftMarquee);
    colorRange(rn.PINK_OUTLINES);

    var scannedPoints = {
        left: {},
        right: {}
    };
    // VÝPOČET STŘEDU LEVÉ DÍRY
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;
    deselectMarque(); //Zrušení marquee

    squareMarquee(rightMarquee);
    colorRange(rn.PINK_OUTLINES);
    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;



    selectLayersFromTo(SVETLO, BILA);
    modifyLayersLock(false);

    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    rotateAroundPoint(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    moveLayerPixels(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    horizontallyTransformAroundPoint(percentScale, idealPoints.left.x, idealPoints.left.y);

}

function processTIFsToStraightenedPSDs(transformSettings) {

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
    if (app.activeDocument.width.as("px") < app.activeDocument.height.as("px")) {
        rotateInDegrees(90);
    }
    setCanvasSize(2480); // Canvas Size
    resetSwatches();
    switchSwatch();
    colorRange(rn.WHITE_BACKGROUND); // Reduce background complexity
    fillWithFGColor();
    deselectMarque();
    copyLayer(lr.BACKGROUND, lr.LAYER1); // Layer Via Copy
    desaturate(); // Desaturate
    colorRange(rn.LINKA); // Color Range
    copyLayer(lr.LAYER1, lr.LAYER2); // Layer Via Copy
    newLayer(lr.LAYER3); // Make
    resetSwatches(); // Reset
    fillColor(); // Fill
    selectLayers(lr.LAYER2); // Select
    setMarqueByTransparency(); // Set
    selectLayers(lr.LAYER3); // Select
    makeMask(); // Make
    copyLayer(lr.LAYER3, lr.LAYER4); // Layer Via Copy
    selectLayersFromTo(lr.LAYER4, lr.LAYER2); // Select
    mergeSelectedLayers(); // Merge Layers
    renameLayerFromTo(null, lr.LINKA); // Set
    setMarqueByTransparency(); // Set
    refineEdge(); // Refine Edge
    copyLayer(lr.LINKA, lr.LINKA_PRO_VYBARVOVANI); // Layer Via Copy
    //renameLayerFromTo(lr.LAYER5, lr.LINKA_PRO_VYBARVOVANI); // Set
    setVisibilityByLayersName(false, lr.LINKA);
    selectLayers(lr.LAYER1); // Select
    setMarqueByTransparency(); // Set
    switchSwatch(); // Exchange
    fillWithFGColor(); // Fill
    renameLayerFromTo(lr.LAYER1, lr.BILA); // Set
    newLayer(lr.BARVA); // Make
    selectLayers(lr.BACKGROUND); // Select
    squareMarquee([0, 0, 3918, 330]); // Set
    copyLayer(lr.BACKGROUND, lr.DIRY); // Layer Via Copy
    moveLayerTo(6); // Move
    setVisibilityByLayersName(false, lr.BACKGROUND);
    setVisibilityByLayersName(false, lr.BILA);
    selectLayers(lr.BACKGROUND); // Select
    copyLayer(lr.BACKGROUND, lr.LINKA_TEXTURE); // Layer Via Copy
    moveLayerTo(5); // Move
    createClippingMask(); // Create Clipping Mask
    setVisibilityByLayersName(true, lr.LINKA_TEXTURE);
    hueSaturationLightness(0, -100, -20); // Hue/Saturation
    LayerBlendStyle(); // Set
    newLayer(lr.LINKA_BARVA); // Make
    createClippingMask(); // Create Clipping Mask
    SelectAllLayers(); // Select All Layers
    makeGroupFromSelection(); // Make
    renameLayerFromTo(null, lr.VRSTVY); // Set
    newLayer(lr.STIN); // Make
    eSTINBlending();
    newLayer(lr.SVETLO); // Make
    eLIGHTBlending();
    selectLayers(lr.LINKA);
    setMarqueByTransparency();
    invertMarquee();
    selectLayers(lr.LINKA_TEXTURE);
    deleteSelectedPixels();
    deselectMarque();
    selectLayers(lr.BARVA); // Select

    //rovnani!
    addHorizontalRuler(idealPoints.left.y); //přídá pravítko
    addVerticalRuler(idealPoints.left.x); //přídá pravítko
    addVerticalRuler(idealPoints.right.x); //přídá pravítko
    selectLayers(lr.DIRY); //Výběr děr
    squareMarquee(leftMarquee); // Marquee na levou díru
    colorRange(rn.HOLE_NEW_SCANNER); // Marquee výběr kontury díry
    expandMarquee(4, false)
    strokeAroundMarquee(4);
    deselectMarque(); //Zrušení marquee
    squareMarquee(leftMarquee); // Marquee na levou díru
    colorRange(rn.PINK_OUTLINES);

    //Zde se může odehrát kontrola správnosti výběru díry

    // VÝPOČET STŘEDU LEVÉ DÍRY
    var scannedPoints = {
        left: {},
        right: {}
    };
    scannedPoints.left.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.left.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    deselectMarque(); //Zrušení marquee
    squareMarquee(rightMarquee); //Marquee na pravou díru
    colorRange(rn.HOLE_NEW_SCANNER); // Marquee výběr kontury díry

    expandMarquee(4, false)
    strokeAroundMarquee(4);
    deselectMarque(); //Zrušení marquee
    squareMarquee(rightMarquee); //Marquee na pravou díru
    colorRange(rn.PINK_OUTLINES);

    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
    scannedPoints.right.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;


    deselectMarque(); //Zrušení marquee

    //Tady se musí vybrat group VRSTVY a znovu se ukázat
    selectLayers(lr.VRSTVY);


    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    rotateAroundPoint(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var posunX = idealPoints.left.x - scannedPoints.left.x;
    var posunY = idealPoints.left.y - scannedPoints.left.y;
    moveLayerPixels(posunX, posunY);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + posunX;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var percentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    horizontallyTransformAroundPoint(percentScale, idealPoints.left.x, idealPoints.left.y);

    modifyLayersLock(true, [lr.DIRY, lr.LINKA_PRO_VYBARVOVANI, lr.LINKA, lr.BILA]);
    modifyLayersLock(false, lr.LINKA_BARVA);
    selectLayers(lr.BARVA);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("vojta-kyblik", "pro vylevani apod");

    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(0, 0, 0, 100, lr.SVETLO);      // Set
    setVisibilityByLayersName(false, lr.LINKA_PRO_VYBARVOVANI);      // Hide
    setVisibilityByLayersName(true, [lr.LINKA, lr.SVETLO, lr.STIN]);      // Hide
    selectLayers(lr.BARVA);      // Select
    createLayerComp("pavel-upravy", "pro bezne dodelavky");      // Make

    opacityToPercent(80, lr.SVETLO);      // Set
    setColorOverlay(0, 0, 255, 100, lr.SVETLO);      // Set
    setColorOverlay(255, 0, 0, 100, lr.STIN);      // Set
    opacityToPercent(60, lr.STIN);      // Set    // Hide
    setVisibilityByLayersName(false, [lr.BARVA, lr.LINKA_BARVA]);      // Hide
    createLayerComp("pavel-stinovani", "pro shadower");      // Make
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("stinovana-faze", "aktualne stinovana faze");      // Make
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN, lr.LINKA_BARVA, lr.BARVA]);
    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(255, 255, 255, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(0, 0, 0, 100, lr.STIN);      // Set
    selectLayers(lr.BARVA);      // Select
    createLayerComp("jachym-final", "pro after effects!");
    createRedOutlineForDespecle(lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("jachym-despecle", "pro despeckle!");
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    hideRedOutlineForDespecle(lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("jachym-imagej", "pro imageJ!");
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    // //ted vybrat zaklad pro vojtu
    applyLayerComp("vojta-kyblik");      // Apply
    selectLayers(lr.BARVA);

    app.activeDocument.info.author = "Zpracovano";

    transformSettings = "";
    transformSettings = angle + "\r" + scannedPoints.left.x + "\r" + scannedPoints.left.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealPoints.left.x + "\r" + idealPoints.left.y
    app.activeDocument.info.keywords = [transformSettings];
}