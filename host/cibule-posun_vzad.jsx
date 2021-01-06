#include "./jachym-library.jsx"
function main(){
    
app.notifiersEnabled = true;
app.notifiers.removeAll();
var eventFile = new File(app.path + "/Presets/Scripts/checkforclosingstinovani.jsx")
app.notifiers.add("Cls ", eventFile);
    
if (app.documents.length > 1){
    alert("Prosím, zavřete či uložte všechny otevřené dokumenty");
    while (app.documents.length > 0) {  
       app.activeDocument.close(SaveOptions.PROMPTTOSAVECHANGES);  
    }
}
if ( app.documents.length == 0) {
        var currentFolder;
var folderNotSet = "není vybraná složka";
var Soubory_Sh = new Array;
var Soubory_HP = new Array;
var folderFile;
var firstFile = false;

var w = new Window("dialog", "Seskupování stínů", undefined, {
    resizeable: true
});
w.alignChildren = "left";
panel_ShadowFiles = w.add("panel", undefined, "Série fází pro stínování", {
    borderStyle: 'white'
});
panel_ShadowFiles.alignChildren = "left";
panel_ShadowFiles.alignment = ["fill", "fill"];
list_ShadowFiles = panel_ShadowFiles.add("listbox", undefined, []);
list_ShadowFiles.alignment = ["fill", "fill"];
list_ShadowFiles.minimumSize = [250, 250];
group_LoadShadow = w.add("group", undefined);
group_LoadShadow.alignment = ["fill", "bottom"];

bt_LoadShadowFilesBridge = group_LoadShadow.add("button", undefined, "Načti fáze z Bridge");
bt_LoadShadowFilesBridge.alignment = ["fill", "bottom"];
statictext = group_LoadShadow.add("statictext", undefined, "nebo");
statictext.alignment = ["fill", "bottom"];
bt_LoadShadowFiles = group_LoadShadow.add("button", undefined, "Vyber fáze ručně...");
bt_LoadShadowFiles.alignment = ["fill", "bottom"];
/*
panel_StaticFiles = w.add("panel", undefined, "Statické helper fáze", {
    borderStyle: 'white'
})
panel_StaticFiles.alignChildren = "left";
panel_StaticFiles.alignment = ["fill", "bottom"];
list_StaticFiles = panel_StaticFiles.add("listbox", undefined, []);
list_StaticFiles.alignment = ["fill", "bottom"];
list_StaticFiles.minimumSize = [250, 100];
group_LoadHelper = w.add("group", undefined);
group_LoadHelper.alignment = ["fill", "bottom"];

bt_LoadStaticFilesBridge = group_LoadHelper.add("button", undefined, "Načti fáze z Bridge");
group_LoadHelper.add("statictext", undefined, "nebo");
bt_LoadStaticFiles = group_LoadHelper.add("button", undefined, "Vyber fáze ručně...");
*/
group_LoadAndSave = w.add("group", undefined);
group_LoadAndSave.alignment = ["fill", "bottom"];
bt_zapsatDoPSDs = group_LoadAndSave.add("button", undefined, "Zapsat do .PSDs");
bt_zapsatDoPSDs.alignment = ["fill", "bottom"];
bt_zapsatDoPSDs.enabled = true;
statictext_CurrentFolder = w.add("statictext", undefined, folderNotSet);
statictext_CurrentFolder.alignment = ["fill", "bottom"];

function filterpsd(inputList) {
    var inputList_nonfiltered = new Array;
    inputList_nonfiltered = inputList;

    var inputList_filtered = new Array;
    var length = inputList_nonfiltered.length;

    for (i = 0; i < length; i++) {
        if (inputList_nonfiltered[i].toString().search(".psd") > 0 || inputList_nonfiltered[i].toString().search(".PSD") > 0) {
            inputList_filtered[inputList_filtered.length] = inputList_nonfiltered[i];
        }
    }
    return inputList_filtered;
}

function Depath(inputList) {
    var inputList_nonfiltered = new Array;
    inputList_nonfiltered = inputList;

    var inputList_filtered = new Array;
    var length = inputList_nonfiltered.length;
    var tempFile;

    for (i = 0; i < length; i++) {
        tempFile = inputList_nonfiltered[i].toString();
        inputList_filtered[i] = tempFile.substring(tempFile.lastIndexOf("/", ) + 1, tempFile.length);
    }
    return inputList_filtered;
}

bt_LoadShadowFiles.onClick = function() {
    Soubory_Sh = filterpsd(openDialog());
    ClearList(list_ShadowFiles);
    if (Soubory_Sh.length > 0) {
        currentFolder = Soubory_Sh[0].path + "/";
    } else {
        currentFolder = folderNotSet;
    };
    Soubory_Sh = Depath(Soubory_Sh);
    FillList(Soubory_Sh, list_ShadowFiles);
    statictext_CurrentFolder.text = currentFolder;
}

bt_LoadShadowFilesBridge.onClick = function() {
    Soubory_Sh = filterpsd(GetFilesFromBridge());
    ClearList(list_ShadowFiles);
    if (Soubory_Sh.length > 0) {
        currentFolder = Soubory_Sh[0].path + "/";
    } else {
        currentFolder = folderNotSet;
    };
    Soubory_Sh = Depath(Soubory_Sh);
    FillList(Soubory_Sh, list_ShadowFiles);
    statictext_CurrentFolder.text = currentFolder;
}
/*
bt_LoadStaticFiles.onClick = function() {
    Soubory_HP = filterpsd(openDialog());
    ClearList(list_StaticFiles);
    Soubory_HP = Depath(Soubory_HP);
    FillList(Soubory_HP, list_StaticFiles);
}

bt_LoadStaticFilesBridge.onClick = function() {
    Soubory_HP = filterpsd(GetFilesFromBridge());
    ClearList(list_StaticFiles);
    Soubory_HP = Depath(Soubory_HP);
    FillList(Soubory_HP, list_StaticFiles);
}
*/
bt_zapsatDoPSDs.onClick = function() {
    if (CheckIfAnyPalleteIsVisible() == true) {
        app.togglePalettes();
    };
    var length = Soubory_Sh.length;
    for (i = 0; i < length; i++) {
        var docRef = open(File(currentFolder.toString() + Soubory_Sh[i].toString()));
        var docRefPath = app.activeDocument.fullName;
        docRef.info.caption = "";
        docRef.info.copyrightNotice = "";
        var tempShadow;
        if (i == 0) {
            firstFile = app.activeDocument.fullName;
            tempShadow = "start"
        } else {
            tempShadow = Soubory_Sh[i - 1]
        }
        tempShadow = tempShadow + "\r";
        tempShadow = tempShadow + Soubory_Sh[i];
        tempShadow = tempShadow + "\r";
        if (i == (length-1)) {
            tempShadow = tempShadow + "end"
        } else {
            tempShadow =tempShadow + Soubory_Sh[i + 1]
        }
        docRef.info.caption = tempShadow;
 
        for (q = 0; q < Soubory_HP.length; q++) {
            var tempHelper = docRef.info.copyrightNotice;
            var tempHelper = tempHelper + Soubory_HP[q];
            var tempHelper = tempHelper + "\r";
            docRef.info.copyrightNotice = tempHelper;
        }
        docRef.close(SaveOptions.SAVECHANGES);
    }
    app.togglePalettes();
    w.close();
}
function ClearList(targetListBox) { //Funkce pro vyčištění listboxu - odzadu postupně odebere všechny položky
    var list = targetListBox;
    var u = targetListBox.items.length;
    for (i = u - 1; i >= 0; i--) {
        list.remove(list.items[i])
    }
}

function FillList(fileArry, targetListBox) { //Funkce pro naplnění listboxu - odzadu postupně odebere všechny položky
    var list = targetListBox;
    var u = fileArry.length;

    for (i = 0; i < u; i++) {

        list.add("item", fileArry[i]);
    };
};

w.onResizing = w.onResize = function() {
    this.layout.resize();
}

w.onShow = function() {
    w.minimumSize = w.size;
}

w.show();
        }
if (firstFile) {
    alert(firstFile);
open(File(firstFile))
}
if(app.documents.length == 0){
    return
    }

var docRef = app.activeDocument, curFilePath, curFileName, layerName, onionLayers, nextFile, prevFile, currentFile, noCopiedShadow = false;
   if (CheckIfAnyPalleteIsVisible() == true) {
        app.togglePalettes();
    };
if(docRef.name == "stinovani"){
    SelectLayer("eSTINY");
    layerName = app.activeDocument.layers[1].name;
    curFilePath = layerName.substring(0, layerName.lastIndexOf("/")+1);
    curFileName = layerName.substring(layerName.lastIndexOf("/")+1, layerName.length)
    docRef = open(File(layerName));
    onionLayers = parseXMPInfo(docRef.info.caption);
    nextFile = onionLayers[2];
    currentFile = onionLayers[1];
    prevFile = onionLayers[0];
    LayerVisibility("BARVA", false);
    SelectLayer("eSTIN");
    DeleteLayer();
    app.activeDocument = app.documents[0];
    DuplicateLayerIntoDocument("eSTIN", app.documents[1].name)
    docRef.close(SaveOptions.SAVECHANGES);
    if (prevFile == "start") {
        app.activeDocument = app.documents[0];
        SelectLayer("eSTINY");
        layerName = app.activeDocument.layers[1].name;
        curFilePath = layerName.substring(0, layerName.lastIndexOf("/")+1);
        curFileName = layerName.substring(layerName.lastIndexOf("/")+1, layerName.length)
        DeleteLayer();
        docRef = open(File(layerName));
        WriteLastFileToDisk("~/Desktop/", "temp_stinovac.txt", layerName);
        LayerVisibility("eSTIN", true);
        SelectLayer("eSTIN");
        DuplicateLayerIntoDocument("eSTINY", app.documents[0].name)
        LayerVisibility("eSTIN", false);
        LayerVisibility("BARVA", false);
        app.activeDocument = app.documents[0];
        SelectLayer("eSTINY");
        docRef.close(SaveOptions.SAVECHANGES);
    } else {
        app.activeDocument = app.documents[0];
        SelectLayer(curFilePath + currentFile);
        DeleteLayer();
        SelectLayer(curFilePath + prevFile);
        OpacityToPercent(100)
        layerName = app.activeDocument.layers[1].name;
        SelectLayer("eSTINY");
        DeleteLayer();
        docRef = open(File(layerName));
        WriteLastFileToDisk("~/Desktop/", "temp_stinovac.txt", layerName);
        SelectLayer("eSTIN");
        ShowLayer(true);
        DuplicateLayerIntoDocument("eSTINY", app.documents[0].name);
        LayerVisibility("eSTIN", false);
        onionLayers = parseXMPInfo(docRef.info.caption);
        nextFile = onionLayers[2];
        currentFile = onionLayers[1];
        prevFile = onionLayers[0];         
        LayerVisibility("BARVA", false);
        docRef.close(SaveOptions.SAVECHANGES);
        app.activeDocument = app.documents[0];
        SelectLayer("eSTINY");
	try {SelectLayer("Background")} catch(e) {SelectLayer("Pozadí")};
        if(prevFile == "start"){ 
            } else {
        PlacePSD(curFilePath + prevFile);
        RenameLayer(curFilePath + prevFile);
        WriteLastFileToDisk("~/Desktop/", "temp_stinovac.txt", curFilePath + currentFile);
        OpacityToPercent(40);
            }
        SelectLayer("eSTINY");
    }
} else {
    curFilePath = docRef.path + "/";
    onionLayers = parseXMPInfo(docRef.info.caption);
    nextFile = onionLayers[2];
    currentFile = onionLayers[1];
    prevFile = onionLayers[0];
    if (onionLayers.length !=3) {
       while (app.documents.length > 0) {
        alert("Fáze nemá napárované sousedy. \nProsím, stiskněte znovu klávesu F8 \na vyberte fáze k stínování");
       app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);  
    }app.togglePalettes();
        return
        }
    CreateNewDocument("stinovani", 3918, 2480, 300);
    if(prevFile != "start") {
        PlacePSD(curFilePath + prevFile);
        RenameLayer(curFilePath + prevFile);
        OpacityToPercent(40);
    }
    PlacePSD(curFilePath + currentFile);
    RenameLayer(curFilePath + currentFile);
    WriteLastFileToDisk("~/Desktop/", "temp_stinovac.txt", curFilePath + currentFile);
    app.activeDocument = app.documents[0];
    SelectLayer("eSTIN");
    LayerVisibility("eSTIN", true);
    DuplicateLayerIntoDocument("eSTINY", app.documents[1].name); //such as ("eSTIN",hele.psd); Places above currently selected layer
    LayerVisibility("eSTIN", false);
    LayerVisibility("BARVA", false);
    docRef.close(SaveOptions.SAVECHANGES);
    }
app.togglePalettes();
}
main();
//app.activeDocument.suspendHistory("stinovac","main()");


function WriteLastFileToDisk(path, name, nameOfLastPSD) {
    var myFile =  path + name;
    var lastFile = new File(myFile);
    lastFile.open('w');
    lastFile.writeln(nameOfLastPSD);
    lastFile.close();
    }