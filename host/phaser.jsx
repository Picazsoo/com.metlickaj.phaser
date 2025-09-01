//@include "../../common_library/photoshop_library.jsx"

var photoshopSaveOptions = new PhotoshopSaveOptions;
photoshopSaveOptions.alphaChannels = true;
photoshopSaveOptions.annotations = true;
photoshopSaveOptions.embedColorProfile = true;
photoshopSaveOptions.layers = true;
photoshopSaveOptions.spotColors = true;

var pngSaveOptions = new PNGSaveOptions;
pngSaveOptions.compression = 0;
pngSaveOptions.interlaced = false;

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
    LINKA_BARVA_PAVEL: "LINKA-barva-pro-Pavla",
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

var lc = {
    VOJTA_KYBLIK: {name: "vojta-kyblik", desc: "pro vylevani apod"},
    PAVEL_UPRAVY: {name: "pavel-upravy", desc: "pro bezne dodelavky"},
    PAVEL_STINOVANI: {name: "pavel-stinovani", desc: "pro shadower"},
    STINOVANA_FAZE: {name: "stinovana-faze", desc: "aktualne stinovana faze"},
    JACHYM_FINAL: {name: "jachym-final", desc: "pro after effects!"},
    JACHYM_DESPECKLE: {name: "jachym-despecle", desc: "pro despeckle!"},
    JACHYM_IMAGEJ: {name: "jachym-imagej", desc: "pro imageJ!"}
}

function getLc() {
    return JSON.lave(lc);
}

//Color ranges settings for color range method
var rn = {
    LINKA: {
        fuzziness: 172,
        min: {luminance: 12.25, a: 0, b: 0},
        max: {luminance: 12.25, a: 0, b: 0}
    },
    WHITE_BACKGROUND: {
        fuzziness: 35,
        min: {luminance: 97.28, a: -3.13, b: 0.59},
        max: {luminance: 99.96, a: 0.61, b: 7.07}
    },
    PINK_OUTLINES: {
        fuzziness: 39,
        min: {luminance: 58.47, a: 87.95, b: -36.21},
        max: {luminance: 58.47, a: 87.95, b: -36.21}
    },
    HOLE_OLD_SCANNER: {
        fuzziness: 0,
        min: {luminance: 63.97, a: -59.22, b: 0.32},
        max: {luminance: 85.8, a: -15.69, b: 12.7}
    },
    HOLE_NEW_SCANNER: {
        fuzziness: 70,
        min: {luminance: 92.23, a: -29.87, b: -1.63},
        max: {luminance: 93.96, a: -27.04, b: 0.69}
    },
    SHADOW_MANUAL_OLD: {
        fuzziness: 95,
        min: {luminance: 35.28, a: 54.38, b: -18.04},
        max: {luminance: 66.13, a: 81.52, b: 48.93}
    },
    FAHRPLANY_BLACK_AND_ORANGE_EDGE: {
        fuzziness: 19,
        min: {luminance: 9.12, a: 0, b: 0},
        max: {luminance: 89.8, a: 38.07, b: 70.8}
    },
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
        var filePath = file.fsName.toString();
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
            processTIFtoStraightenedPSD(transformSettings);
            var docRefPathPSD = docRefPath.substring(0, docRefPath.lastIndexOf(".")) + ".psd";
            docRef.saveAs(new File(docRefPathPSD), photoshopSaveOptions);
            docRef.close(SaveOptions.DONOTSAVECHANGES);
        });
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
        showPalettes();
    }

}

function transformBackgrounds(filePaths) {
    try {
        hidePalettes();
        filePaths.forEach(function (filePath) {
            var docRef = open(File(filePath));
            var docRefPath = app.activeDocument.fullName.toString();
            var transformInformation = JSON.eval(app.activeDocument.info.keywords[0]);
            var xAxisShift = transformInformation.xAxisShift;
            var yAxisShift = transformInformation.yAxisShift;
            var angle = transformInformation.rotationAngle;
            var left = transformInformation.rotationPointCoords;
            var idealPoints = transformInformation.idealPoints;
            var horizontalPercentScale = transformInformation.horizontalPercentScale;
            selectLayers(lr.BACKGROUND)
            copyLayer(lr.BACKGROUND, lr.LAYER1)
            setVisibilityByLayersName(true, lr.LAYER1);
            modifyLayersLock(false);
            rotateAroundPoint(angle, left.x, left.y); //Otočení pro narovnání
            moveLayerPixels(xAxisShift, yAxisShift);
            horizontallyTransformAroundPoint(horizontalPercentScale, idealPoints.left.x, idealPoints.left.y);
            docRef.close(SaveOptions.SAVECHANGES);
        });
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
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

        selectLayers(lr.DIRY);
        var scannedPoints = {};
        colorRangeWithinBounds(rn.PINK_OUTLINES, leftMarquee);
        // VÝPOČET STŘEDU LEVÉ DÍRY
        scannedPoints.left = getCenterFromSelection(app.activeDocument.selection.bounds);

        colorRangeWithinBounds(rn.PINK_OUTLINES, rightMarquee);
        // VÝPOČET STŘEDU PRAVÉ DÍRY
        scannedPoints.right = getCenterFromSelection(app.activeDocument.selection.bounds);


        selectLayersFromTo(lr.SVETLO, lr.BILA);
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
        selectLayers(lr.BARVA);
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
        showPalettes();
    }
}

function processFahrplans(transformSettings, filePaths) {
    var topLeftEdgeMarquee = {
        top: 900,
        left: 100,
        right: 350,
        bottom: 905
    };
    var bottomLeftEdgeMarquee = {
        top: 2500,
        left: 100,
        right: 350,
        bottom: 2505
    };

    var leftTopEdgeMarquee = {
        top: 60,
        left: 85,
        right: 115,
        bottom: 500
    };

    var bottomExtendingLaneLengthDetector = {
        top: 380,
        left: 85,
        right: 115,
        bottom: 3550
    };

    var bottomExtendingLaneDetectionField = {
        top: 3400,
        left: 85,
        right: 1300,
        bottom: 3780
    };


    filePaths.forEach(function (filePath) {
        var documentIds = loadPdfAsFiles(filePath);
        //alert("opened documents: " + documents);
        documentIds.forEach(function (documentId) {
            activateDocumentById(documentId);
            copyLayer(lr.BACKGROUND, lr.LAYER1); // Layer Via Copy
            deleteLayer(lr.BACKGROUND);
            selectLayers(lr.LAYER1)
            colorRangeWithinBounds(rn.LINKA, topLeftEdgeMarquee);
            var topLeftLinePos = getCenterFromSelection();
            //alert("levy horni okraj je: " + topLeftLinePos.left);
            colorRangeWithinBounds(rn.LINKA, bottomLeftEdgeMarquee);
            var bottomLeftLinePos = getCenterFromSelection();
            //alert("levy dolni okraj je: " + bottomLeftLinePos.left);
            deselectMarque();

            var protilehla = topLeftLinePos.left - bottomLeftLinePos.left; //Výpočet obdélníku tvořeného dírami
            var prilehla = bottomLeftLinePos.top - topLeftLinePos.top;
            var angle = -1 * Math.atan(protilehla / prilehla) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
            //alert("angle je: " + angle);
            rotateAroundPoint(angle, topLeftLinePos.x, topLeftLinePos.y); //Otočení pro narovnání
            moveLayerPixels(-1 * topLeftLinePos.left + 100, 0);

            colorRangeWithinBounds(rn.LINKA, leftTopEdgeMarquee);
            var leftTopLinePos = getCenterFromSelection();
            deselectMarque();

            //chci na bod 400
            moveLayerPixels(0, 400 - leftTopLinePos.top);

            //chci detekovat, jak je dokument dlouhý a podle toho opravit jeho rozměry (tj. detekovat spodní hranu prodloužené tabulky a nějak znormalizovat)
            colorRangeWithinBounds(rn.LINKA, bottomExtendingLaneLengthDetector);
            var extendingLaneLength = getCenterFromSelection().height;
            deselectMarque();
            var percentScale = 3100 / extendingLaneLength * 100;
            //alert("scale is : " + percentScale);
            transformAroundPoint(percentScale, percentScale, 100, 400);



            //chci detekovat prodloužení dokumentu (pro čísla 51-52; resp 101-102) a zjistit velikost a z toho typ dokumentu
            colorRangeWithinBounds(rn.LINKA, bottomExtendingLaneDetectionField);
            var extendingLaneWidth = getCenterFromSelection().width;
            var rightTopEdgeMarquee;
            var idealCornersForPerspectiveTransform;
            var actualCornersForPerspectiveTransform = {
                topLeft: {},
                bottomLeft: {},
                topRight: {},
                bottomRight: {}
            }
            if (extendingLaneWidth <= 570) {
                //alert("Tohle je 4x25");
                rightTopEdgeMarquee = {
                    top: 300,
                    left: 1700,
                    right: 1730,
                    bottom: 555
                }
                idealCornersForPerspectiveTransform = {
                    topLeft: {
                        x: 102,
                        y: 397
                    },
                    bottomLeft: {
                        x: 102,
                        y: 3499
                    },
                    topRight: {
                        x: 1150,
                        y: 397
                    },
                    bottomRight: {
                        x: 1138,
                        y: 3512
                    }
                }
            } else {
                //alert("Tohle je 2x50");
                rightTopEdgeMarquee = {
                    top: 300,
                    left: 1130,
                    right: 1170,
                    bottom: 555
                }
                idealCornersForPerspectiveTransform = {
                    topLeft: {
                        x: 102,
                        y: 397,
                        widthTolerance: 25, //to each side
                        heightTolerance: 50, //to each side
                    },
                    bottomLeft: {
                        x: 102,
                        y: 3499,
                        widthTolerance: 25, //to each side
                        heightTolerance: 50, //to each side
                    },
                    topRight: {
                        x: 1150,
                        y: 397,
                        widthTolerance: 25, //to each side
                        heightTolerance: 50, //to each side
                    },
                    bottomRight: {
                        x: 1138,
                        y: 3512,
                        widthTolerance: 25, //to each side
                        heightTolerance: 50, //to each side
                    }
                }
            }
            //Calculate top left corner
            var positionalData = getPositionalData(idealCornersForPerspectiveTransform.topLeft);
            actualCornersForPerspectiveTransform.topLeft.x = positionalData.left;
            actualCornersForPerspectiveTransform.topLeft.y = positionalData.top;
            //Calculate top right corner
            positionalData = getPositionalData(idealCornersForPerspectiveTransform.topRight);
            actualCornersForPerspectiveTransform.topRight.x = positionalData.left;
            actualCornersForPerspectiveTransform.topRight.y = positionalData.top;
            //Calculate bottom left corner
            positionalData = getPositionalData(idealCornersForPerspectiveTransform.bottomLeft);
            actualCornersForPerspectiveTransform.bottomLeft.x = positionalData.left;
            actualCornersForPerspectiveTransform.bottomLeft.y = positionalData.bottom;
            //Calculate bottom right corner
            positionalData = getPositionalData(idealCornersForPerspectiveTransform.bottomRight);
            actualCornersForPerspectiveTransform.bottomRight.x = positionalData.left;
            actualCornersForPerspectiveTransform.bottomRight.y = positionalData.bottom;
            selectAllPixels();
            copySelection();
        })
    });
}

function getPositionalData(squareBounds) {
    //var bottomExtendingLaneDetectionField = {
    //    top: 3400,
    //    left: 85,
    //    right: 1300,
    //    bottom: 3780
    //};

    //topRight: {
    //    x: 1150,
    //        y: 397,
    //        widthTolerance: 25, //to each side
    //        heightTolerance: 50, //to each side
    //},

    if (squareBounds.top === undefined) {
        var backup = squareBounds;
        squareBounds = {};
        squareBounds.top = backup.x - backup.heightTolerance;
        squareBounds.bottom = backup.x + backup.heightTolerance;
        squareBounds.left = backup.y - backup.widthTolerance;
        squareBounds.right = backup.y + backup.widthTolerance;
    }
    deselectMarque();
    colorRangeWithinBounds(rn.LINKA, squareBounds);
    var positionalData = getCenterFromSelection();
    deselectMarque();
    return positionalData;
}

function activateDocumentById(documentId) {
    var openedDocumentsCount = app.documents.length;
    //alert("items opened are " + openedDocumentsCount);
    for (var i = 0; i < app.documents.length; i++) {
        if (app.documents[i].id == documentId) {
            app.activeDocument = app.documents[i];
            break;
        }
    }
}

function processPdfPage() {
    copyLayer(lr.BACKGROUND, lr.LAYER1); // Layer Via Copy
    colorRangeWithinBounds(rn.LINKA, topMarquee);
    var topLeftLinePos = getCenterFromSelection();
    //alert("levy horni okraj je: " + topLeftLinePos.left);
    colorRangeWithinBounds(rn.LINKA, bottomMarquee);
    var bottomLeftLinePos = getCenterFromSelection();
    //alert("levy dolni okraj je: " + bottomLeftLinePos.left);
    deselectMarque();

    var protilehla = topLeftLinePos.left - bottomLeftLinePos.left; //Výpočet obdélníku tvořeného dírami
    var prilehla = bottomLeftLinePos.top - topLeftLinePos.top;
    var angle = -1 * Math.atan(protilehla / prilehla) * 180 / Math.PI; //Výpočet úhlu pro narovnání skew
    //alert("angle je: " + angle);
    rotateAroundPoint(angle, topLeftLinePos.x, topLeftLinePos.y); //Otočení pro narovnání
}

function loadPdfAsFiles(filePath) {
    var pageLength = 1;
    var openedDocuments = app.documents.length * 1;
    var endOfPdfReached = false;
    var documentIds = [];
    while (!endOfPdfReached) {
        try {
            var pdfName = filePath.substring(filePath.lastIndexOf("\\") + 1);
            //alert("file name is " + pdfName)
            openedDocuments = app.documents.length * 1;
            var desc1 = new ActionDescriptor();
            var desc2 = new ActionDescriptor();
            desc2.putString(cTID('Nm  '), pdfName);
            desc2.putEnumerated(cTID('Crop'), sTID("cropTo"), sTID("boundingBox"));
            desc2.putUnitDouble(cTID('Rslt'), cTID('#Rsl'), 300);
            desc2.putEnumerated(cTID('Md  '), cTID('ClrS'), sTID("RGBColor"));
            desc2.putInteger(cTID('Dpth'), 8);
            desc2.putBoolean(cTID('AntA'), true);
            desc2.putUnitDouble(cTID('Wdth'), cTID('#Pxl'), 2479);
            desc2.putUnitDouble(cTID('Hght'), cTID('#Pxl'), 3917);
            desc2.putBoolean(cTID('CnsP'), false);
            desc2.putBoolean(sTID("suppressWarnings"), false);
            desc2.putBoolean(cTID('Rvrs'), false);
            desc2.putEnumerated(sTID("selection"), sTID("pdfSelection"), cTID('page'));
            desc2.putInteger(cTID('PgNm'), pageLength);
            desc1.putObject(cTID('As  '), sTID("PDFGenericFormat"), desc2);
            desc1.putPath(cTID('null'), new File(filePath));
            desc1.putInteger(cTID('DocI'), 247);
            executeAction(cTID('Opn '), desc1, DialogModes.NO);
            if (app.documents.length == openedDocuments) {
                //alert("cannot open page #" + pageLength);
                endOfPdfReached = true;
                break;
            }
            documentIds.push(app.activeDocument.id)
            //alert("opened page #" + pageLength);
            pageLength++
        } catch (error) {
            alert("cannot open page #" + pageLength);
            endOfPdfReached = true;
        }
    }
    return documentIds;
}

function processTIFtoStraightenedPSD(transformSettings) {
    //app.activeDocument.layerComps.removeAll();
    //rotate if is in portrait mode
    clockwiseToLandscape();
    setCanvasSize(2480); // Canvas Size
    colorRange(rn.WHITE_BACKGROUND)
    fillWithRGBColor(color.WHITE); // Reduce background complexity
    deselectMarque();

    copyLayer(lr.BACKGROUND, lr.LAYER1); // Layer Via Copy
    desaturate(); // Desaturate
    colorRange(rn.LINKA); // Color Range
    copyLayer(lr.LAYER1, lr.LAYER2); // Layer Via Copy
    deleteLayer(lr.LAYER1);
    copyLayer(lr.LAYER2, lr.LAYER3); // Layer Via Copy
    copyLayer(lr.LAYER3, lr.LAYER4); // Layer Via Copy
    setColorOverlay(color.BLACK, 100, lr.LAYER3, lr.LAYER4);
    selectLayers([lr.LAYER4, lr.LAYER3, lr.LAYER2]); // Select
    mergeSelectedLayers(); // Merge Layers
    renameCurrentLayerTo(lr.LINKA); // Set
    setVisibilityByLayersName(false, lr.LINKA);
    setMarqueByTransparency(lr.LINKA); // Set
    refineEdge(lr.LINKA); // Refine Edge
    copyLayer(lr.LINKA, lr.LINKA_PRO_VYBARVOVANI); // Layer Via Copy

    copyLayer(lr.BACKGROUND, lr.BILA); // Layer Via Copy
    fillWithRGBColor(color.WHITE); // Fill

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
    newLayer(lr.LINKA_BARVA_PAVEL); // Make
    createClippingMask(); // Create Clipping Mask
    selectLayers([lr.DIRY, lr.LINKA_PRO_VYBARVOVANI, lr.LINKA_BARVA, lr.LINKA_BARVA_PAVEL, lr.LINKA_TEXTURE, lr.LINKA, lr.BARVA, lr.BILA]); // Select All Layers
    makeGroupFromSelection(lr.VRSTVY); // Make

    newLayer(lr.STIN); // Make
    eSTINBlending();

    newLayer(lr.SVETLO); // Make
    eLIGHTBlending();

    setMarqueByTransparency(lr.LINKA);
    invertMarquee();
    selectLayers(lr.LINKA_TEXTURE);
    deleteSelectedPixels();
    deselectMarque();

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
    modifyLayersLock(false, lr.LINKA_BARVA_PAVEL);
    selectLayers(lr.BARVA);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp(lc.VOJTA_KYBLIK);

    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(color.WHITE, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(color.BLACK, 100, lr.STIN);      // Set
    setVisibilityByLayersName(false, lr.LINKA_PRO_VYBARVOVANI);      // Hide
    setVisibilityByLayersName(true, [lr.LINKA, lr.SVETLO, lr.STIN]);      // Hide
    selectLayers(lr.BARVA);      // Select
    createLayerComp(lc.PAVEL_UPRAVY);      // Make

    opacityToPercent(80, lr.SVETLO);      // Set
    setColorOverlay(color.BLUE, 100, lr.SVETLO);      // Set
    setColorOverlay(color.RED, 100, lr.STIN);      // Set
    opacityToPercent(60, lr.STIN);      // Set    // Hide
    setVisibilityByLayersName(false, [lr.BARVA, lr.LINKA_BARVA, lr.LINKA_BARVA_PAVEL]);      // Hide
    createLayerComp(lc.PAVEL_STINOVANI);      // Make
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp(lc.STINOVANA_FAZE);      // Make
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN, lr.LINKA_BARVA, lr.LINKA_BARVA_PAVEL, lr.BARVA]);
    opacityToPercent(30, lr.SVETLO);      // Set
    setColorOverlay(color.WHITE, 100, lr.SVETLO);      // Set
    opacityToPercent(30, lr.STIN);      // Set
    setColorOverlay(color.BLACK, 100, lr.STIN);      // Set
    selectLayers(lr.BARVA);      // Select
    createLayerComp(lc.JACHYM_FINAL);
    createOutlineForDespecle(color.RED, lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp(lc.JACHYM_DESPECKLE);
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    hideOutlineForDespecle(lr.VRSTVY);
    setVisibilityByLayersName(false, [lr.SVETLO, lr.STIN]);
    createLayerComp(lc.JACHYM_IMAGEJ);
    setVisibilityByLayersName(true, [lr.SVETLO, lr.STIN]);
    // //ted vybrat zaklad pro vojtu
    applyLayerComp(lc.VOJTA_KYBLIK.name);      // Apply
    selectLayers(lr.BARVA);

    app.activeDocument.info.author = "Zpracovano";
    var transformInformation = {};
    transformInformation.xAxisShift = xAxisShift;
    transformInformation.yAxisShift = yAxisShift;
    transformInformation.rotationAngle = angle;
    transformInformation.rotationPointCoords = scannedPoints.left;
    transformInformation.idealPoints = idealPoints;
    transformInformation.horizontalPercentScale = horizontalPercentScale;
    app.activeDocument.info.keywords = [JSON.lave(transformInformation)];
}

function batchProcessPsdToImageJPng(filePaths) {
    try {
        hidePalettes();
        filePaths.forEach(function (filePath) {
            var docRef = open(File(filePath));
            var docRefPath = app.activeDocument.fullName.toString();
            processPSDtoImageJPNG();
            var docRefPathPNG = docRefPath.substring(0, docRefPath.lastIndexOf(".")) + "despec" + ".png";
            docRef.saveAs(new File(docRefPathPNG), pngSaveOptions, true, Extension.LOWERCASE);
            docRef.close(SaveOptions.DONOTSAVECHANGES);
        });
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
        showPalettes();
    }
}

function batchApplyPngMaskToPsd(filePaths) {
    try {
        hidePalettes();
        filePaths.forEach(function (filePath) {
            var docRef = open(File(filePath));
            var docRefPath = app.activeDocument.fullName.toString();
            var docRefPathPNG = docRefPath.substring(0, docRefPath.lastIndexOf(".")) + "despec" + ".png";
            applyPngMaskToPsd(docRefPathPNG);
            docRef.close(SaveOptions.SAVECHANGES);
            File(docRefPathPNG).remove(); // removes the png used for mask
        });
        selectEraser();
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
        showPalettes();
    }
}

function batchApplyLayerCompToPsds(filePathsAndLayerComp) {
    try {
        hidePalettes();
        filePathsAndLayerComp.filePaths.forEach(function (filePath) {
            var docRef = open(File(filePath));
            applyLayerComp(filePathsAndLayerComp.layerCompName);
            docRef.close(SaveOptions.SAVECHANGES);
        });
        showPalettes();
    } catch (error) {
        alert(error.line.toString() + "\r" + error.toString())
        showPalettes();
    }
}

function processPSDtoImageJPNG() {
    applyLayerComp(lc.JACHYM_IMAGEJ.name);
}

function applyPngMaskToPsd(pngMaskPath) {
    selectLayers(lr.LINKA);
    modifyLayersLock(false);
    var maskRef = open(File(pngMaskPath));
    selectAllPixels();
    copySelection();
    maskRef.close(SaveOptions.DONOTSAVECHANGES);
    makeEmptyMask();
    selectCurrentChannelAsVisible(true);
    pasteInPlace();
    selectCurrentChannelAsVisible(false);
    SelectRGBChannels();
    deselectMarque();
    applyLayerComp(lc.JACHYM_DESPECKLE.name);
}


function getCenterFromSelection(selectionBounds) {
    if (selectionBounds == null || selectionBounds == undefined) {
        selectionBounds = app.activeDocument.selection.bounds;
    }
    var width = selectionBounds[2] - selectionBounds[0];
    var height = selectionBounds[3] - selectionBounds[1];
    var x_coords = (selectionBounds[2].as("px") + selectionBounds[0].as("px")) / 2;
    var y_coords = (selectionBounds[3].as("px") + selectionBounds[1].as("px")) / 2;
    return {
        x: x_coords,
        y: y_coords,
        width: width.as("px"),
        height: height.as("px"),
        left: selectionBounds[0].as("px"),
        top: selectionBounds[1].as("px"),
        right: selectionBounds[2].as("px"),
        bottom: selectionBounds[3].as("px")
    }
}