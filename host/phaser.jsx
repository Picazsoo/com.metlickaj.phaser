//@include "../../common_library/photoshop_library.jsx"

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

var color = {
    WHITE: rgbColorFactory(255, 255, 255),
    BLACK: rgbColorFactory(0, 0, 0),
    PINK_OUTLINES: rgbColorFactory(255, 0, 204),
    RED: rgbColorFactory(255, 0, 0),
    GREEN: rgbColorFactory(0, 255, 0),
    BLUE: rgbColorFactory(0, 0, 255)
};

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
    try {
        hidePalettes()
        var idealPointsCenters = transformSettings.idealPointsCenters;

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
        var scannedPoints = {};
        colorRangeWithinBounds(rn.PINK_OUTLINES, leftMarquee);
        // VÝPOČET STŘEDU LEVÉ DÍRY
        scannedPoints.left = getCenterFromSelection(app.activeDocument.selection.bounds);

        colorRangeWithinBounds(rn.PINK_OUTLINES, rightMarquee);
        // VÝPOČET STŘEDU PRAVÉ DÍRY
        scannedPoints.right = getCenterFromSelection(app.activeDocument.selection.bounds);


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
        showPalettes();
    } catch (error) {
        alert(error);
        showPalettes();
    }
}

function processTIFsToStraightenedPSDs(transformSettings) {
    //rotate if is in portrait mode
    clockwiseToLandscape();
    setCanvasSize(2480); // Canvas Size
    colorRange(rn.WHITE_BACKGROUND); // Reduce background complexity
    fillWithRGBColor(color.WHITE);
    deselectMarque();
    copyLayer(lr.BACKGROUND, lr.LAYER1); // Layer Via Copy
    desaturate(); // Desaturate
    colorRange(rn.LINKA); // Color Range
    copyLayer(lr.LAYER1, lr.LAYER2); // Layer Via Copy
    newLayer(lr.LAYER3); // Make
    fillWithRGBColor(color.BLACK);
    selectLayers(lr.LAYER2); // Select
    setMarqueByTransparency(); // Set
    selectLayers(lr.LAYER3); // Select
    makeMask(); // Make
    copyLayer(lr.LAYER3, lr.LAYER4); // Layer Via Copy
    selectLayersFromTo(lr.LAYER4, lr.LAYER2); // Select
    mergeSelectedLayers(); // Merge Layers
    renameCurrentLayerTo(lr.LINKA); // Set
    setMarqueByTransparency(); // Set
    refineEdge(); // Refine Edge
    copyLayer(lr.LINKA, lr.LINKA_PRO_VYBARVOVANI); // Layer Via Copy
    setVisibilityByLayersName(false, lr.LINKA);
    selectLayers(lr.LAYER1); // Select
    setMarqueByTransparency(); // Set
    fillWithRGBColor(color.WHITE); // Fill
    renameLayerFromTo(lr.LAYER1, lr.BILA); // Set
    newLayer(lr.BARVA); // Make
    selectLayers(lr.BACKGROUND); // Select
    squareMarquee([0, 0, 3918, 330]); // Set
    copyLayer(lr.BACKGROUND, lr.DIRY); // Layer Via Copy
    moveLayerTo(6); // Move
    setVisibilityByLayersName(false, [lr.BACKGROUND, lr.BILA]);
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
    renameCurrentLayerTo(lr.VRSTVY); // Set
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
    var idealPointsCenters = transformSettings.idealPointsCenters;
    var marquees = transformSettings.marquees;

    //Promenne - idealni stredy der a realne stredy der:
    var idealPoints = {
        left: idealPointsCenters.left,
        right: idealPointsCenters.right
    }

    addHorizontalRuler(idealPoints.left.y); //přídá pravítko
    addVerticalRuler(idealPoints.left.x); //přídá pravítko
    addVerticalRuler(idealPoints.right.x); //přídá pravítko
    selectLayers(lr.DIRY); //Výběr děr
    // Marquee na levou díru
    colorRangeWithinBounds(rn.HOLE_NEW_SCANNER, marquees.left); // Marquee výběr kontury díry
    expandMarquee(4, false)
    strokeAroundMarquee(4, color.PINK_OUTLINES);
    //Zrušení marquee
    // Marquee na levou díru
    colorRangeWithinBounds(rn.PINK_OUTLINES, marquees.left);

    //Zde se může odehrát kontrola správnosti výběru díry

    // VÝPOČET STŘEDU LEVÉ DÍRY
    var scannedPoints = {
        left: {},
        right: {}
    };
    scannedPoints.left = getCenterFromSelection(app.activeDocument.selection.bounds);

    //Zrušení marquee
    //Marquee na pravou díru
    // Marquee výběr kontury díry
    colorRangeWithinBounds(rn.HOLE_NEW_SCANNER, marquees.right);

    expandMarquee(4, false)
    strokeAroundMarquee(4, color.PINK_OUTLINES);
    //Zrušení marquee
    //Marquee na pravou díru
    colorRangeWithinBounds(rn.PINK_OUTLINES, marquees.right);

    // VÝPOČET STŘEDU PRAVÉ DÍRY
    scannedPoints.right = getCenterFromSelection(app.activeDocument.selection.bounds);

    deselectMarque(); //Zrušení marquee

    //Tady se musí vybrat group VRSTVY a znovu se ukázat
    selectLayers(lr.VRSTVY);


    var deltaX = scannedPoints.right.x - scannedPoints.left.x; //Výpočet obdélníku tvořeného dírami
    var deltaY = scannedPoints.right.y - scannedPoints.left.y;
    var scannedPrepona = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    var angle = -1 * Math.atan(deltaY / deltaX) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    rotateAroundPoint(angle, scannedPoints.left.x, scannedPoints.left.y); //Otočení pro narovnání

    //spocitam o kolik posunout pro napozicovani na idealni levy malybod
    var xAxisShift = idealPoints.left.x - scannedPoints.left.x;
    var yAxisShift = idealPoints.left.y - scannedPoints.left.y;
    moveLayerPixels(xAxisShift, yAxisShift);

    //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
    scannedPoints.right.x = scannedPoints.right.x + (scannedPrepona - deltaX) + xAxisShift;

    //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
    var horizontalPercentScale = (idealPoints.right.x - idealPoints.left.x) / (scannedPoints.right.x - idealPoints.left.x) * 100;
    horizontallyTransformAroundPoint(horizontalPercentScale, idealPoints.left.x, idealPoints.left.y);

    modifyLayersLock(true, [lr.DIRY, lr.LINKA_PRO_VYBARVOVANI, lr.LINKA, lr.BILA]);
    modifyLayersLock(false, lr.LINKA_BARVA);
    selectLayers(lr.BARVA);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("vojta-kyblik", "pro vylevani apod");

    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(color.WHITE, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(color.BLACK, 100, lr.STIN);      // Set
    setVisibilityByLayersName(false, lr.LINKA_PRO_VYBARVOVANI);      // Hide
    setVisibilityByLayersName(true, [lr.LINKA, lr.SVETLO, lr.STIN]);      // Hide
    selectLayers(lr.BARVA);      // Select
    createLayerComp("pavel-upravy", "pro bezne dodelavky");      // Make

    opacityToPercent(80, lr.SVETLO);      // Set
    setColorOverlay(color.BLUE, 100, lr.SVETLO);      // Set
    setColorOverlay(color.RED, 100, lr.STIN);      // Set
    opacityToPercent(60, lr.STIN);      // Set    // Hide
    setVisibilityByLayersName(false, [lr.BARVA, lr.LINKA_BARVA]);      // Hide
    createLayerComp("pavel-stinovani", "pro shadower");      // Make
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("stinovana-faze", "aktualne stinovana faze");      // Make
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN, lr.LINKA_BARVA, lr.BARVA]);
    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(color.WHITE, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(color.BLACK, 100, lr.STIN);      // Set
    selectLayers(lr.BARVA);      // Select
    createLayerComp("jachym-final", "pro after effects!");
    createOutlineForDespecle(color.RED, lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("jachym-despecle", "pro despeckle!");
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    hideOutlineForDespecle(lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp("jachym-imagej", "pro imageJ!");
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    // //ted vybrat zaklad pro vojtu
    applyLayerComp("vojta-kyblik");      // Apply
    selectLayers(lr.BARVA);

    app.activeDocument.info.author = "Zpracovano";
    var transformInformation = {};
    transformInformation.xAxisShift = xAxisShift;
    transformInformation.yAxisShift = yAxisShift;
    transformInformation.rotationAngle = angle;
    transformInformation.rotationPointCoords = scannedPoints.left;
    transformInformation.idealPoints = idealPoints;
    app.activeDocument.info.keywords = [JSON.lave(transformInformation)];
}

function getCenterFromSelection(selectionBounds) {
    var x_coords = (getNumberFromSelectionBound(selectionBounds[2]) + getNumberFromSelectionBound(selectionBounds[0])) / 2;
    var y_coords = (getNumberFromSelectionBound(selectionBounds[3]) + getNumberFromSelectionBound(selectionBounds[1])) / 2;
    return {
        x: x_coords,
        y: y_coords
    }
}

function getNumberFromSelectionBound(selectionBound) {
    return Number((selectionBound.toString().replace(" px", "")));
}