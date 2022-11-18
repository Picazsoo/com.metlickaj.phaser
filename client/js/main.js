/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

const csInterface = new CSInterface();
const extensionRootPath = csInterface.getSystemPath(SystemPath.EXTENSION);


const $listOfFiles = $("#files-for-processing");
let currentWorkingFolder;

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

function addFiles(returnJSONobj, fileTypeRegex) {
    //console.log(returnJSONobj);
    let files = JSON.parse(returnJSONobj);
    $listOfFiles.empty();
    files = filterForValidFileType(files, fileTypeRegex);
    files.sort();
    files.forEach(file => {
        let filePath = decodeURI(file.path);
        $listOfFiles.append(`<option value="${filePath}">${filePath}</option>`);
    });
    if (files.length) {
        $("#process-tiffs").attr("disabled", false);
        $("#process-psds").attr("disabled", false);
    }
}

function filterForValidFileType(files, fileTypeRegex) {
    return files.filter(file => {
        /.*/[Symbol.match]
        let fileNameUpperCase = file.fileName.toUpperCase();
        //this should cover both .TIFF and .TIF
        //console.log(fileNameUpperCase + " : " + fileNameUpperCase.indexOf(".TIF"));
        return fileTypeRegex.test(fileNameUpperCase);
    });
}

function processTiffsToPSDs() {
    let marquees = defaultMarquees;
    let transformSettings = {
        "marquees": marquees,
        "idealPointsCenters": idealPointsCenters
    }

    let filePaths = [];
    $listOfFiles.find("option").each(function () {
        //extract filepath from each option element
        filePaths.push($(this).attr("value"));
    });
    //console.log(filePaths);
    jsx.evalScript('batchProcessTiffsToPSDs(' + JSON.stringify(transformSettings) + ',' + JSON.stringify(filePaths) + ')', clearFiles);
}

function processPSDsToImageJPNGs() {
    let filePaths = [];
    $listOfFiles.find("option").each(function () {
        //extract filepath from each option element
        filePaths.push($(this).attr("value"));
    });
    currentWorkingFolder = filePaths[0].substring(0, filePaths[0].lastIndexOf("\\"));
    //console.log(filePaths);
    jsx.evalScript(`batchProcessPsdToImageJPng(${JSON.stringify(filePaths)})`, () => processDespecklePNGs(filePaths));
}

function despecklePSDsWithImageJPNGs() {
    let filePaths = [];
    $listOfFiles.find("option").each(function () {
        //extract filepath from each option element
        filePaths.push($(this).attr("value"));
    });
    currentWorkingFolder = filePaths[0].substring(0, filePaths[0].lastIndexOf("\\"));
    //console.log(filePaths);
    jsx.evalScript(`batchApplyPngMaskToPsd(${JSON.stringify(filePaths)})`);
}


function processDespecklePNGs(filePaths) {
    let exec = require('child_process').execSync;
    let pathToMacro = extensionRootPath + "/" + "imagej_despeckle.ijm";
    let commandToExec = `imagej -macro "${pathToWinFormat(pathToMacro)}" "${pathToWinFormat(currentWorkingFolder)}"`;
    console.log(commandToExec);
    exec(commandToExec,
        (error, stdout, stderr) => {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
        });
    currentWorkingFolder = undefined;
    // clearFiles();
}

function pathToWinFormat(forwardSlashPath) {
    let newPath = forwardSlashPath.replace(/\//g, "\\");
    return newPath;
}

function fixBrokenHoles() {
    let marquees = defaultMarquees;
    let transformSettings = {
        "marquees": marquees,
        "idealPointsCenters": idealPointsCenters
    }
    jsx.evalScript('fixBrokenHoles(' + JSON.stringify(transformSettings) + ')');
}

function clearFiles() {
    $listOfFiles.empty();
    $("#process-tiffs").attr("disabled", true);
    $("#process-psds").attr("disabled", true);
}