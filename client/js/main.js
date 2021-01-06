/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

////

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
let userSetMarquees = undefined;

'use strict';
jsx.file('./host/linka_a_rovnani.jsx');
//theme manager to switch between dark mode and light mode
themeManager.init();

//node.js imports
const fs = require('fs');

function addFiles(returnJSONobj) {
    //console.log(returnJSONobj);
    let files = JSON.parse(returnJSONobj);
    $("#files-for-processing").empty();
    files = filterForValidTifs(files);
    files.sort();
    files.forEach(file => {
        $("#files-for-processing").append(`<option value="${file.path}">${file.path}</option>`);
    });
}

function filterForValidTifs(files) {
    return files.filter(file => {
        let fileNameUpperCase = file.fileName.toUpperCase();
        //this should cover both .TIFF and .TIF
        console.log(fileNameUpperCase + " : " + fileNameUpperCase.indexOf(".TIF"));
        return fileNameUpperCase.indexOf(".TIF") != -1
    });
}