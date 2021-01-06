#include "./jachym-library.jsxlib"

var currentFolder;
var folderNotSet = "není vybraná složka";
var Soubory_Sh = new Array;
var Soubory_HP = new Array;
var folderFile;
var transformSettings;

var w = new Window("dialog", "Animation Processor 0.8", undefined, {resizeable: true});
    w.alignChildren = "left";
    panel_PrepareFiles = w.add("panel", undefined, "Fáze pro processing",{borderStyle:'white'});
    panel_PrepareFiles.alignChildren = "left";
    panel_PrepareFiles.alignment = ["fill", "fill"];
    list_PrepareFiles = panel_PrepareFiles.add ("listbox", undefined, []);
    list_PrepareFiles.alignment = ["fill", "fill"];
    list_PrepareFiles.minimumSize = [250, 250];
    group_LoadPrepare = w.add("group", undefined);
    group_LoadPrepare.alignment = ["left", "bottom"];
    group_LoadPrepare.preferredSize.height = 30;
    bt_LoadPrepareFilesBridge = group_LoadPrepare.add("button", undefined, "Načti fáze z Bridge");
    group_LoadPrepare.add("statictext", undefined, "nebo");
    bt_LoadPrepareFiles = group_LoadPrepare.add("button", undefined, "Vyber fáze ručně...");
    bt_zapsatDoPSDs = group_LoadPrepare.add("button", undefined, "Zpracovat .tiff soubory do .psd");
    bt_zapsatDoPSDs.enabled = false;   
    statictext_CurrentFolder = w.add("statictext", undefined, folderNotSet);
    statictext_CurrentFolder.alignment = ["fill", "bottom"];

 function filterpsd(inputList){
     var inputList_nonfiltered = new Array;
     inputList_nonfiltered = inputList;
     var inputList_filtered = new Array;
     var length = inputList_nonfiltered.length;

     for (i = 0; i < length; i++){
         var filePathLength = inputList_nonfiltered[i].toString().length;
         if(inputList_nonfiltered[i].toString().substring(filePathLength - 4, filePathLength).search("tiff")  != -1 || inputList_nonfiltered[i].toString().substring(filePathLength - 4, filePathLength).search("TIFF") != -1){
             inputList_filtered[inputList_filtered.length] = inputList_nonfiltered[i];
         }
     }
      return inputList_filtered;
      }
  
  function Depath(inputList){
      var inputList_nonfiltered = new Array;
     inputList_nonfiltered = inputList;

     var inputList_filtered = new Array;
     var length = inputList_nonfiltered.length;
     var tempFile;

     for (i = 0; i < length; i++){
         tempFile = inputList_nonfiltered[i].toString();
         inputList_filtered[i] = tempFile.substring(tempFile.lastIndexOf ("/",)+1, tempFile.length);
         }
             return inputList_filtered;
     }

bt_LoadPrepareFiles.onClick = function() {
    Soubory_Sh = filterpsd(openDialog());
    ClearList(list_PrepareFiles);
    if(Soubory_Sh.length > 0){currentFolder = Soubory_Sh[0].path + "/"; bt_zapsatDoPSDs.enabled = true;  } else {currentFolder = folderNotSet; bt_zapsatDoPSDs.enabled = false; };
    Soubory_Sh = Depath(Soubory_Sh);
    FillList(Soubory_Sh, list_PrepareFiles);
    statictext_CurrentFolder.text = currentFolder + " - vybrano " + Soubory_Sh.length + " fazi k processingu";
    }

bt_LoadPrepareFilesBridge.onClick = function() {
    Soubory_Sh = filterpsd(GetFilesFromBridge());
    ClearList(list_PrepareFiles);
    if(Soubory_Sh.length > 0){currentFolder = Soubory_Sh[0].path + "/"; bt_zapsatDoPSDs.enabled = true;} else {currentFolder = folderNotSet; bt_zapsatDoPSDs.enabled = false; };
    Soubory_Sh = Depath(Soubory_Sh);
    FillList(Soubory_Sh, list_PrepareFiles);
    statictext_CurrentFolder.text = currentFolder + " - vybrano " + Soubory_Sh.length + " fazi k processingu";
    }

bt_zapsatDoPSDs.onClick = function(){
    w.close();
    if(CheckIfAnyPalleteIsVisible() == true){
        app.togglePalettes();
        }
    var length = Soubory_Sh.length;
    statictext_CurrentFolder.text = "Zpracovano 0 fazi z " + length;
    for(i = 0; i < length; i++){
        var docRef = open(File(currentFolder.toString() + Soubory_Sh[i].toString()));
        var docRefPath = app.activeDocument.fullName;
        var docRefPathPSD;
        var progressTexticek
        ProcessTIFsToStraightenedPSDs();
        docRefPathPSD = docRefPath.toString().replace(".tiff", ".psd");
        docRef.saveAs(new File(docRefPathPSD), PhotoshopSaveOptions);
        docRef.close(SaveOptions.DONOTSAVECHANGES);
        progressTexticek = "zpracovano " + (i+1) + " fazi z " + length;
        statictext_CurrentFolder.text = progressTexticek;
        }
     app.togglePalettes();
    }



function ProcessTIFsToStraightenedPSDs() {


//Promenne - idealni stredy der a realne stredy der:
var deltaX, deltaY, angle, posunX, posunY, scannedPrepona, percentScale;
var idealLeftPoint = {x: 759.5, y: 136};
var idealRightPoint = {x: 3159, y: 136};

var scannedLeftPoint = {};
var scannedRightPoint = {};

var leftMarquee = {left: 600, top: 40, right: 1000, bottom: 209};
var rightMarquee = {left: 3000, top: 40, right: 3350, bottom: 209};

//==================== VOJTA - LINKA 2018 - oba rozmery (07.03.2019) ==============

  SetCanvasSize(2480);      // Canvas Size
  ResetSwatches();
  SwitchSwatch();
  ReduceBGcomplexity();
  FillWithFGColor();
  JachNoMarchingAnts();
  CopyLayer();      // Layer Via Copy
  Desaturate();      // Desaturate
  step4();      // Color Range
  CopyLayer();      // Layer Via Copy
  NewLayer();      // Make
  ResetSwatches();      // Reset
  FillColor();      // Fill
  SelectLayer("Layer 2");      // Select
  MarchingAntsByTransparency();      // Set
  SelectLayer("Layer 3");      // Select
  MakeMask();      // Make
  CopyLayer();      // Layer Via Copy
  SelectLayerContinuous("Layer 3");      // Select
  SelectLayerContinuous("Layer 2");      // Select
  MergeSelectedLayers();      // Merge Layers
  RenameLayer("LINKA");      // Set
  MarchingAntsByTransparency();      // Set
  RefineEdge();      // Refine Edge
  CopyLayer();      // Layer Via Copy
  RenameLayer("LINKA pro vybarvovani");      // Set
  SelectLayer("LINKA");      // Select
  ShowLayer(false);      // Hide
  SelectLayer("Layer 1");      // Select
  MarchingAntsByTransparency();      // Set
  SwitchSwatch();      // Exchange
  FillWithFGColor();      // Fill
  RenameLayer("BILA");      // Set
  NewLayer();      // Make
  RenameLayer("BARVA");      // Set
  SelectLayer("Background");      // Select
  SquareSelection(0, 0 ,3918 ,330);      // Set
  CopyLayer();      // Layer Via Copy
  RenameLayer("diry");      // Set
  MoveLayerTo(6);      // Move
  SelectLayer("Background");      // Select
  ShowLayer(false);      // Hide
  SelectLayer("BILA");      // Select
  ShowLayer(false);      // Hide
  SelectLayer("Background");      // Select
  CopyLayer();      // Layer Via Copy
  MoveLayerTo(5);      // Move
  CreateClippingMask();      // Create Clipping Mask
  ShowLayer(true);      // Show
  HueSaturationLightness(0, -100, -20);      // Hue/Saturation
  LayerBlendStyle();      // Set
  RenameLayer("LINKA-texture");      // Set 
  NewLayer();      // Make
  CreateClippingMask();      // Create Clipping Mask
  RenameLayer("LINKA-barva");      // Set
  SelectAllLayers();      // Select All Layers
  MakeGroupFromSelection();      // Make
  RenameLayer("VRSTVY");      // Set
  NewLayer();      // Make
  RenameLayer("eSTIN");      // Set
  eSTINBlending();
  NewLayer();     // Make
  RenameLayer("eSVETLO");     // Set
  eLIGHTBlending();
  SelectLayer("LINKA");
  MarchingAntsByTransparency(); 
  InvertMarchingAnts();
  SelectLayer("LINKA-texture");
  DeletePixels();
  JachNoMarchingAnts();
  SelectLayer("BARVA");      // Select
  
  //rovnani!
  RulerHorizontal(idealLeftPoint.y); //přídá pravítko
  JachRulerVrtc(idealLeftPoint.x); //přídá pravítko
  JachRulerVrtc(idealRightPoint.x); //přídá pravítko
  SelectLayer("diry"); //Výběr děr
  SquareSelection(leftMarquee.left,leftMarquee.top,leftMarquee.right,leftMarquee.bottom);      // Marquee na levou díru
  JachDiraColorRange();      // Marquee výběr kontury díry
  
  //Zde se může odehrát kontrola správnosti výběru díry
 
  // VÝPOČET STŘEDU LEVÉ DÍRY
  scannedLeftPoint.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
  scannedLeftPoint.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;
  
  ExpandMarquee(4, false)
  StrokeAroundSelection(4);

  JachNoMarchingAnts();   //Zrušení marquee
  SquareSelection(rightMarquee.left,rightMarquee.top,rightMarquee.right,rightMarquee.bottom);        //Marquee na pravou díru
  JachDiraColorRange();      // Marquee výběr kontury díry

  // VÝPOČET STŘEDU PRAVÉ DÍRY
  scannedRightPoint.x = (Number((app.activeDocument.selection.bounds[2].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[0].toString().replace(" px", "")))) / 2;
  scannedRightPoint.y = (Number((app.activeDocument.selection.bounds[3].toString().replace(" px", ""))) + Number((app.activeDocument.selection.bounds[1].toString().replace(" px", "")))) / 2;
  
  ExpandMarquee(4, false)
  StrokeAroundSelection(4);
  
  JachNoMarchingAnts(); //Zrušení marquee
  
  //Tady se musí vybrat group "VRSTVY" a znovu se ukázat
  SelectLayer("VRSTVY");
 

  deltaX = scannedRightPoint.x - scannedLeftPoint.x; //Výpočet obdélníku tvořeného dírami
  deltaY = scannedRightPoint.y - scannedLeftPoint.y;
  scannedPrepona = Math.sqrt((deltaX*deltaX)+(deltaY*deltaY));
  angle = -1 * Math.atan(deltaY/deltaX) * 180/Math.PI; //Výpočet úhlu pro narovnání skew
  JachRotateAroundPosition(angle, scannedLeftPoint.x, scannedLeftPoint.y); //Otočení pro narovnání
  
  //spocitam o kolik posunout pro napozicovani na idealni levy malybod
  posunX = idealLeftPoint.x - scannedLeftPoint.x;
  posunY = idealLeftPoint.y - scannedLeftPoint.y;
  JachMove(posunX, posunY);
  
  //Spocitam novou polohu naskenovaneho praveho bodu po rotaci a posunu
  scannedRightPoint.x = scannedRightPoint.x + (scannedPrepona - deltaX) + posunX;
  
  //spocitam o kolik roztahnout obraz (se stredem roztazeni na malem bode)
  percentScale = (idealRightPoint.x - idealLeftPoint.x)/(scannedRightPoint.x - idealLeftPoint.x)*100;
  JachHorizontalTransform(percentScale,idealLeftPoint.x,idealLeftPoint.y);
  
  SelectLayer("diry");
  ModifyLayersLock(true);
  SelectLayer("LINKA pro vybarvovani");
  ModifyLayersLock(true);
  SelectLayer("LINKA-barva");
  ModifyLayersLock(true);
  SelectLayer("LINKA");
  ModifyLayersLock(true);
  SelectLayer("BILA");
  ModifyLayersLock(true);
  SelectLayer("BARVA");
  app.activeDocument.info.author = "Zpracovano";
  
  transformSettings = "";
  transformSettings = angle + "\r" + scannedLeftPoint.x + "\r" + scannedLeftPoint.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealLeftPoint.x + "\r" + idealLeftPoint.y
  app.activeDocument.info.keywords = [transformSettings];

}




//Kriticke funkce pro file management a UI

ClearList = function(targetListBox) { //Funkce pro vyčištění listboxu - odzadu postupně odebere všechny položky
    var list = targetListBox;
    var u = targetListBox.items.length;
    for(i = u -1; i >= 0; i-- ){
        list.remove(list.items[i])
        }
    }

FillList = function(fileArry, targetListBox){ //Funkce pro naplnění listboxu - odzadu postupně odebere všechny položky
    var list = targetListBox;
    var u = fileArry.length;

    for(i = 0; i < u; i++){

        list.add("item", fileArry[i]);
        };    
    };

// Konec funkci
w.onResizing = w.onResize = function(){this.layout.resize();}

w.onShow = function (){
    w.minimumSize = w.size;
    }

w.show();