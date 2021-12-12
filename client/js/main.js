/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

const $listOfFiles = $("#files-for-processing");

//idealni stredy der
let idealPointsCenters = {
    left: {
        x: 759.5,
        y: 136
    },
    right: {
        x: 3159,
        y: 136
    }
}

//Vybery pro detekci der
const defaultMarquees = {
    left: {
        left: 600,
        top: 40,
        right: 1000,
        bottom: 209
    },
    right: {
        left: 3000,
        top: 40,
        right: 3350,
        bottom: 209
    }
}

//Uzivatelem volene vybery pro detekci der

'use strict';
jsx.file('./host/phaser.jsx');
//theme manager to switch between dark mode and light mode
themeManager.init();

//node.js imports
const fs = require('fs');

function addFiles(returnJSONobj) {
    //console.log(returnJSONobj);
    let files = JSON.parse(returnJSONobj);
    $listOfFiles.empty();
    files = filterForValidTifs(files);
    files.sort();
    files.forEach(file => {
        let filePath = decodeURI(file.path);
        $listOfFiles.append(`<option value="${filePath}">${filePath}</option>`);
    });
    if(files.length) {
        $("#process-tiffs").attr("disabled", false);
    }
}

function filterForValidTifs(files) {
    return files.filter(file => {
        let fileNameUpperCase = file.fileName.toUpperCase();
        //this should cover both .TIFF and .TIF
        console.log(fileNameUpperCase + " : " + fileNameUpperCase.indexOf(".TIF"));
        return fileNameUpperCase.indexOf(".TIF") != -1
    });
}

function processTiffsToPSDs() {
    let marquees = defaultMarquees;
    let transformSettings = {
        "marquees": marquees,
        "idealPointsCenters": idealPointsCenters
    }

    let filePaths = [];
    $listOfFiles.find("option").each( function() {
        //extract filepath from each option element
        filePaths.push($(this).attr("value"));
    });
    console.log(filePaths);
    jsx.evalScript('batchProcessTiffsToPSDs(' + JSON.stringify(transformSettings) + ',' + JSON.stringify(filePaths) + ')', clearFiles);
}


function fixWellDefinedHoles() {
    let marquees = defaultMarquees;
    let transformSettings = {
        "marquees": marquees,
        "idealPointsCenters": idealPointsCenters
    }
    jsx.evalScript('fixWellDefinedHoles(' + JSON.stringify(transformSettings) + ')');
}

function clearFiles() {
    $listOfFiles.empty();
    $("#process-tiffs").attr("disabled", true);
}