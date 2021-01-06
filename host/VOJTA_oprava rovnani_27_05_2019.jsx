#include "./jachym-library.jsxlib"

var transformSettings;
var readyForRepair = true;
var docRef = app.activeDocument;
try {var BGRepair =  app.activeDocument.layers.getByName("Background - oprava děr");}
catch (e) {readyForRepair = false};
if(readyForRepair == true){
    if(CheckIfAnyPalleteIsVisible() == true){
        app.togglePalettes();
    };
    ProcessTIFsToStraightenedPSDs();
    app.togglePalettes();    };
    else {
        if(!Window.confirm("Opravdu chcete opravit pozicování děr?",true,"Oprava fáze")){alert("Operace zrušena")}
            else {
                 if(CheckIfAnyPalleteIsVisible() == true){ app.togglePalettes() };
                //SelectLayer("BILA")
                //SelectLayerContinuous("eSVETLO");
                SelectAllLayersBesidesBackground();
                ModifyLayersLock(false);
                DeleteLayer();
                CopyLayer();      // Layer Via Copy
                RenameLayer("Background - oprava děr");
                SelectLayer("Background");      // Select
                ShowLayer(false)
                SelectLayer("Background - oprava děr");
                ResetSwatches();
                SetFGColor(0, 241, 192);
                SelectPencil();
                SetBrushDiameter(27);
                app.togglePalettes();
                alert("Nyní prosím opravte tužkou pravou a levou díru.\rZamalujte přebytečnou zelenou barvu v okolí děr a opravte i díry samotné.\rPak spusťte klávesou F10 skript znovu.\rPokud nejste s výsledkem spokojeni, stiskněte znovu F10 a celý proces zopakujte.");
                };
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
  CopyLayer();      // Layer Via Copy
  RenameLayer("Layer 1")
  Desaturate()      // Desaturate
  step4();      // Color Range
  CopyLayer();// Layer Via Copy
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
  SelectLayer("Background - oprava děr");      // Select
  SquareSelection(0, 0 ,3918 ,330);      // Set
  CopyLayer();      // Layer Via Copy
  RenameLayer("diry");      // Set
  MoveLayerTo(7);      // Move
  SelectLayer("Background - oprava děr");      // Select
  ShowLayer(false);      // Hide
  SelectLayer("BILA");      // Select
  ShowLayer(false);      // Hide
  SelectLayer("Background - oprava děr");      // Select
  CopyLayer();      // Layer Via Copy
  MoveLayerTo(6);      // Move
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
  SelectLayer("Background - oprava děr");
  DeleteLayer();
  SelectLayer("BARVA");
  
  transformSettings = "";
  transformSettings = angle + "\r" + scannedLeftPoint.x + "\r" + scannedLeftPoint.y + "\r" + posunX + "\r" + posunY + "\r" + percentScale + "\r" + idealLeftPoint.x + "\r" + idealLeftPoint.y
  app.activeDocument.info.keywords = [transformSettings];
}
