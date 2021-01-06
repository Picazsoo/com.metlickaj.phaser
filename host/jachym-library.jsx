cTID = function(s) { return app.charIDToTypeID(s); };
sTID = function(s) { return app.stringIDToTypeID(s); };

  // Set
  function SetFGColorToRed() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Clr '), cTID('FrgC'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('H   '), cTID('#Ang'), 124.2333984375);
    desc2.putDouble(cTID('Strt'), 100);
    desc2.putDouble(cTID('Brgh'), 100);
    desc1.putObject(cTID('T   '), cTID('HSBC'), desc2);
    desc1.putString(cTID('Srce'), "photoshopPicker");
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function CreateNewDocument(filename, resW, resH, ppi) {
    var width;
    var height;
    var dpi;
    dpi = ppi;
    width = (resW/dpi)*72;
    height = (resH/dpi)*72;
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    desc2.putString(cTID('Nm  '), filename);
    desc2.putClass(cTID('Md  '), sTID("RGBColorMode"));
    desc2.putUnitDouble(cTID('Wdth'), cTID('#Rlt'), width);
    desc2.putUnitDouble(cTID('Hght'), cTID('#Rlt'), height);
    desc2.putUnitDouble(cTID('Rslt'), cTID('#Rsl'), ppi);
    desc2.putDouble(sTID("pixelScaleFactor"), 1);
    desc2.putEnumerated(cTID('Fl  '), cTID('Fl  '), cTID('Wht '));
    desc2.putInteger(cTID('Dpth'), 8);
    desc2.putString(sTID("profile"), "sRGB IEC61966-2.1");
    desc1.putObject(cTID('Nw  '), cTID('Dcmn'), desc2);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

  function LayerVisibility(layername, visible) {
    var LyrVis;
    if (visible == true) {LyrVis = 'Shw '} else {LyrVis = 'Hd  '}
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), layername);
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    executeAction(cTID(LyrVis), desc1, DialogModes.NO);
  };

  function hideLayer(layername) {
    LayerVisibility(layerName, false);
  };

  function showLayer(layername) {
    LayerVisibility(layerName, true);
  };

  // Set
  function SelectAllPixels() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(cTID('T   '), cTID('Ordn'), cTID('Al  '));
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };
  // Cut
  function CutSelected() {
      
    executeAction(cTID('cut '), undefined, DialogModes.NO);
  };
  // Paste
  function PasteInPlace() {  
    var desc1 = new ActionDescriptor();
    desc1.putBoolean(sTID("inPlace"), true);
    desc1.putEnumerated(cTID('AntA'), cTID('Annt'), cTID('Anno'));
    executeAction(cTID('past'), desc1, DialogModes.NO);
  };

  // Set
  function FillWithFGColor() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Clr '), cTID('FrgC'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('H   '), cTID('#Ang'), 0);
    desc2.putDouble(cTID('Strt'), 100);
    desc2.putDouble(cTID('Brgh'), 100);
    desc1.putObject(cTID('T   '), cTID('HSBC'), desc2);
    desc1.putString(cTID('Srce'), "photoshopPicker");
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function Close() {
    executeAction(cTID('Cls '), undefined, DialogModes.NO);
  };

  // Fill entire layer with fg color
  function FillEntireLayerWithFGColor() {
    var desc1 = new ActionDescriptor();
    desc1.putEnumerated(cTID('Usng'), cTID('FlCn'), cTID('FrgC'));
    desc1.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc1.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    executeAction(cTID('Fl  '), desc1, DialogModes.NO);
  };


function parseXMPInfo(xmpString){
    var stringToParse = xmpString.toString();
    var documentArray = new Array;
    documentArray = stringToParse.split("\r");
    return documentArray;
    }

function setZoom( zoom ) {
   cTID = function(s) { return app.charIDToTypeID(s); };
   var docRes = activeDocument.resolution;
   activeDocument.resizeImage( undefined, undefined, 72/(zoom/100), ResampleMethod.NONE );
   var desc = new ActionDescriptor();
   var ref = new ActionReference();
   ref.putEnumerated( cTID( "Mn  " ), cTID( "MnIt" ), cTID( 'PrnS' ) );
   desc.putReference( cTID( "null" ), ref );
   executeAction( cTID( "slct" ), desc, DialogModes.NO );
   activeDocument.resizeImage( undefined, undefined, docRes, ResampleMethod.NONE );
}  
  
    // Canvas Size
  function SetCanvasSize(Height) {
    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(cTID('Hght'), cTID('#Pxl'), Height);
    desc1.putEnumerated(cTID('Vrtc'), cTID('VrtL'), cTID('Cntr'));
    desc1.putEnumerated(sTID("canvasExtensionColorType"), sTID("canvasExtensionColorType"), cTID('BckC'));
    executeAction(sTID('canvasSize'), desc1, DialogModes.NO);
  };

  // Layer Via Copy
  function CopyLayer() {
    executeAction(sTID('copyToLayer'), undefined, DialogModes.NO);
  };

  // Desaturate
  function Desaturate() {
    executeAction(cTID('Dstt'), undefined, DialogModes.NO);
  };

  // Color Range
  function step4() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 172);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 12.25);
    desc2.putDouble(cTID('A   '), 0);
    desc2.putDouble(cTID('B   '), 0);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 12.25);
    desc3.putDouble(cTID('A   '), 0);
    desc3.putDouble(cTID('B   '), 0);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };

  // Make
  function NewLayer() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(cTID('Lyr '));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

  // Reset
  function ResetSwatches() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Clr '), cTID('Clrs'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Rset'), desc1, DialogModes.NO);
  };

  // Fill
  function FillColor() {
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Hrzn'), cTID('#Rlt'), 448.2);
    desc2.putUnitDouble(cTID('Vrtc'), cTID('#Rlt'), 178.38);
    desc1.putObject(cTID('From'), cTID('Pnt '), desc2);
    desc1.putInteger(cTID('Tlrn'), 32);
    desc1.putBoolean(cTID('AntA'), true);
    desc1.putEnumerated(cTID('Usng'), cTID('FlCn'), cTID('FrgC'));
    executeAction(cTID('Fl  '), desc1, DialogModes.NO);
  };

  // Select
  function SelectLayer(layerName) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), layerName);
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    executeAction(cTID('slct'), desc1, DialogModes.NO);
  };

  // Make
  function MakeMask() {
    var desc1 = new ActionDescriptor();
    desc1.putClass(cTID('Nw  '), cTID('Chnl'));
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Msk '));
    desc1.putReference(cTID('At  '), ref1);
    desc1.putEnumerated(cTID('Usng'), cTID('UsrM'), cTID('RvlS'));
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

  // Select
  function SelectLayerContinuous(layerName) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(cTID('Lyr '), layerName);
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(sTID("selectionModifier"), sTID("selectionModifierType"), sTID("addToSelectionContinuous"));
    desc1.putBoolean(cTID('MkVs'), false);
    executeAction(cTID('slct'), desc1, DialogModes.NO);
  };

  // Merge Layers
  function MergeSelectedLayers() {
    var desc1 = new ActionDescriptor();
    executeAction(sTID('mergeLayersNew'), desc1, DialogModes.NO);
  };

  // Delete
  function DeletePixels() {
    executeAction(cTID('Dlt '), undefined, DialogModes.NO);
  };

  // Prejmenuj vrstvu
  function RenameLayer(jmenoVrstvy) {
    var jmenoVrstvy;
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putString(cTID('Nm  '), jmenoVrstvy);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Refine Edge
  function RefineEdge() {
    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(sTID("refineEdgeBorderRadius"), cTID('#Pxl'), 0);
    desc1.putUnitDouble(sTID("refineEdgeBorderContrast"), cTID('#Prc'), 100);
    desc1.putInteger(sTID("refineEdgeSmooth"), 0);
    desc1.putUnitDouble(sTID("refineEdgeFeatherRadius"), cTID('#Pxl'), 0);
    desc1.putUnitDouble(sTID("refineEdgeChoke"), cTID('#Prc'), -50);
    desc1.putBoolean(sTID("refineEdgeAutoRadius"), false);
    desc1.putBoolean(sTID("refineEdgeDecontaminate"), false);
    desc1.putEnumerated(sTID("refineEdgeOutput"), sTID("refineEdgeOutput"), sTID("selectionOutputToSelection"));
    executeAction(sTID('refineSelectionEdge'), desc1, DialogModes.NO);
  };

  // lock /unlockSelected Layers 
  function ModifyLayersLock(ifLockPassTrue) {
    var jachTask;
    if (ifLockPassTrue == true){
    jachTask = "protectAll"} else { jachTask = "protectNone"}
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putBoolean(sTID(jachTask), true);
    desc1.putObject(sTID("layerLocking"), sTID("layerLocking"), desc2);
    executeAction(sTID('applyLocking'), desc1, DialogModes.NO);
  };


  // Exchange
  function SwitchSwatch() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Clr '), cTID('Clrs'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Exch'), desc1, DialogModes.NO);
  };

  // Fill
  function FillWithFGColor() {
    var desc1 = new ActionDescriptor();
    desc1.putEnumerated(cTID('Usng'), cTID('FlCn'), cTID('FrgC'));
    desc1.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc1.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    executeAction(cTID('Fl  '), desc1, DialogModes.NO);
  };

  // Move
  function MoveLayerTo(index) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var ref2 = new ActionReference();
    ref2.putIndex(cTID('Lyr '), index);
    desc1.putReference(cTID('T   '), ref2);
    desc1.putBoolean(cTID('Adjs'), false);
    desc1.putInteger(cTID('Vrsn'), 5);
    executeAction(cTID('move'), desc1, DialogModes.NO);
  };

  // Create Clipping Mask
  function CreateClippingMask() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('groupEvent'), desc1, DialogModes.NO);
  };

 function CopySelection(enabled, withDialog) {
    executeAction(cTID('copy'), undefined, DialogModes.NO);
  };

  // Show
  function ShowLayer(trueorfalse) {
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    list1.putReference(ref1);
    desc1.putList(cTID('null'), list1);
    if(trueorfalse == true){
    executeAction(cTID('Shw '), desc1, DialogModes.NO);
    }
    if(trueorfalse == false){
    executeAction(cTID('Hd  '), desc1, DialogModes.NO);
    }
  };

  // Hue/Saturation
  function HueSaturationLightness(hue, saturation, lightness) {

    var desc1 = new ActionDescriptor();
    desc1.putEnumerated(sTID("presetKind"), sTID("presetKindType"), sTID("presetKindCustom"));
    desc1.putBoolean(cTID('Clrz'), false);
    var list1 = new ActionList();
    var desc2 = new ActionDescriptor();
    desc2.putInteger(cTID('H   '), hue);
    desc2.putInteger(cTID('Strt'), saturation);
    desc2.putInteger(cTID('Lght'), lightness);
    list1.putObject(cTID('Hst2'), desc2);
    desc1.putList(cTID('Adjs'), list1);
    executeAction(sTID('hueSaturation'), desc1, DialogModes.NO);
  };

  // Set
  function LayerBlendStyle() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    var list1 = new ActionList();
    var desc3 = new ActionDescriptor();
    var ref2 = new ActionReference();
    ref2.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Gry '));
    desc3.putReference(cTID('Chnl'), ref2);
    desc3.putInteger(cTID('SrcB'), 0);
    desc3.putInteger(cTID('Srcl'), 0);
    desc3.putInteger(cTID('SrcW'), 0);
    desc3.putInteger(cTID('Srcm'), 95);
    desc3.putInteger(cTID('DstB'), 0);
    desc3.putInteger(cTID('Dstl'), 0);
    desc3.putInteger(cTID('DstW'), 255);
    desc3.putInteger(cTID('Dstt'), 255);
    list1.putObject(cTID('Blnd'), desc3);
    desc2.putList(cTID('Blnd'), list1);
    var desc4 = new ActionDescriptor();
    desc4.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    desc2.putObject(cTID('Lefx'), cTID('Lefx'), desc4);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Select All Layers
  function SelectAllLayers() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('selectAllLayers'), desc1, DialogModes.NO);
  };

  // Make
  function MakeGroupFromSelection() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("layerSection"));
    desc1.putReference(cTID('null'), ref1);
    var ref2 = new ActionReference();
    ref2.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('From'), ref2);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

  // Set selection to square of choice
  function SquareSelection(leftPxl, topPxl, rghtPxl, btomPxl) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    var topPxl, leftPxl, btomPxl, rghtPxl;
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Top '), cTID('#Pxl'), topPxl);
    desc2.putUnitDouble(cTID('Left'), cTID('#Pxl'), leftPxl);
    desc2.putUnitDouble(cTID('Btom'), cTID('#Pxl'), btomPxl);
    desc2.putUnitDouble(cTID('Rght'), cTID('#Pxl'), rghtPxl);
    desc1.putObject(cTID('T   '), cTID('Rctn'), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Color Range - puvodni skener
  /*function JachDiraColorRange() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 0);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 63.97);
    desc2.putDouble(cTID('A   '), -59.22);
    desc2.putDouble(cTID('B   '), -0.32);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 85.8);
    desc3.putDouble(cTID('A   '), -15.69);
    desc3.putDouble(cTID('B   '), 12.7);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };
*/
  // Color Range - novy skener - elektricka paska
  function JachDiraColorRange() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 70);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 92.23);
    desc2.putDouble(cTID('A   '), -29.87);
    desc2.putDouble(cTID('B   '), -1.63);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 93.96);
    desc3.putDouble(cTID('A   '), -27.04);
    desc3.putDouble(cTID('B   '), 0.69);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };

//Color Range barva tank...
  function colorRangeBarvaTank() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 103);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 51.42);
    desc2.putDouble(cTID('A   '), 49.38);
    desc2.putDouble(cTID('B   '), -13.93);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 69.91);
    desc3.putDouble(cTID('A   '), 80.36);
    desc3.putDouble(cTID('B   '), 38.72);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };

  // Zkopiruj vrstvu (kdyz selection, tak jen vybranou cast)
  function JachCopyToLayer() {
    executeAction(sTID('copyToLayer'), undefined, DialogModes.NO);
  };

  // Smazat vrstu
  function DeleteLayer() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Dlt '), desc1, DialogModes.NO);
  };

  // Set marque by transparency
  function MarchingAntsByTransparency() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    var ref2 = new ActionReference();
    ref2.putEnumerated(cTID('Chnl'), cTID('Chnl'), cTID('Trsp'));
    desc1.putReference(cTID('T   '), ref2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Deselect marque
  function JachNoMarchingAnts() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Chnl'), sTID("selection"));
    desc1.putReference(cTID('null'), ref1);
    desc1.putEnumerated(cTID('T   '), cTID('Ordn'), cTID('None'));
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

function JachRotateAroundPosition(_angle, x, y) {
  var _angle, x, y;
  var desc1 = new ActionDescriptor();
  var desc2 = new ActionDescriptor();
  var ref1 = new ActionReference();
  ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  desc1.putReference(charIDToTypeID('null'), ref1);
  desc1.putEnumerated(charIDToTypeID('FTcs'), charIDToTypeID('QCSt'), stringIDToTypeID("QCSIndependent"));
  desc2.putUnitDouble(charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), x);
  desc2.putUnitDouble(charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), y);
  desc1.putObject(charIDToTypeID('Pstn'), charIDToTypeID('Pnt '), desc2);
  desc1.putUnitDouble(charIDToTypeID('Angl'), charIDToTypeID('#Ang'), _angle);
  desc1.putEnumerated(charIDToTypeID('Intr'), charIDToTypeID('Intp'), charIDToTypeID('Bcbc'));
  executeAction(charIDToTypeID('Trnf'), desc1, DialogModes.NO);
}

function JachHorizontalTransform(_hortrans,x,y) {
    var x, y, _hortrans;
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    desc1.putReference(charIDToTypeID('null'), ref1);
    desc1.putEnumerated(charIDToTypeID('FTcs'), charIDToTypeID('QCSt'), stringIDToTypeID("QCSIndependent"));
    desc2.putUnitDouble(charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), x);
    desc2.putUnitDouble(charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), y);
    desc1.putObject(charIDToTypeID('Pstn'), charIDToTypeID('Pnt '), desc2);
    desc3.putUnitDouble(charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), 0);
    desc3.putUnitDouble(charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), 0);
    desc1.putObject(charIDToTypeID('Ofst'), charIDToTypeID('Ofst'), desc3);
    desc1.putUnitDouble(charIDToTypeID('Wdth'), charIDToTypeID('#Prc'), _hortrans);
    desc1.putEnumerated(charIDToTypeID('Intr'), charIDToTypeID('Intp'), charIDToTypeID('Bcbc'));
    executeAction(charIDToTypeID('Trnf'), desc1, DialogModes.NO);
}

function WriteGuides(guidesTXT) { //  "~/Desktop/temp_stinovac-guides.txt"
    var guidesAry = [];
    var numberOfGuides = app.activeDocument.guides.length;
    for(i = 0; i < numberOfGuides; i++){
        guidesAry.push(app.activeDocument.guides[i].direction + ", " + app.activeDocument.guides[i].coordinate);
    };
    
    var myFile =  guidesTXT;
    var textFile = new File(guidesTXT);
    textFile.open('w');
    for(a = 0; a < guidesAry.length; a++){
        textFile.writeln(guidesAry[a]);
        }
    textFile.close();
    }

function CreateGuides (guidesTXT) { //   "~/Desktop/temp_stinovac-guides.txt"
var desktopPath = guidesTXT;
var txtFile = new File(desktopPath);
var guideAry = [];
if(txtFile.open("r")){
    while(!txtFile.eof) {
        guideAry.push(txtFile.readln());
        }
    txtFile.close();
    for(i = 0; i < guideAry.length; i++){
        parameters = guideAry[i].split(", ");
        parameters[1] = parameters[1].replace(" px", "");
        if(parameters[0] == "Direction.HORIZONTAL"){
            RulerHorizontal(parameters[1]);
            } else if (parameters[0] == "Direction.VERTICAL") {
             JachRulerVrtc(parameters[1])
            }
        }
    }
}

function JachMove(x,y) {
    var x, y;
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    desc1.putReference(charIDToTypeID('null'), ref1);
    desc2.putUnitDouble(charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), x);
    desc2.putUnitDouble(charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), y);
    desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('Ofst'), desc2);
    executeAction(charIDToTypeID('move'), desc1, DialogModes.NO);
};
//Vloz pravitko horizontalni
  function RulerHorizontal(y) {
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Pstn'), cTID('#Pxl'), y);
    desc2.putEnumerated(cTID('Ornt'), cTID('Ornt'), cTID('Hrzn'));
    desc1.putObject(cTID('Nw  '), cTID('Gd  '), desc2);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

//Vloz pravitko vertikalni
  function JachRulerVrtc(x) {
    var desc1 = new ActionDescriptor();
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Pstn'), cTID('#Pxl'), x);
    desc2.putEnumerated(cTID('Ornt'), cTID('Ornt'), cTID('Vrtc'));
    desc1.putObject(cTID('Nw  '), cTID('Gd  '), desc2);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

  function ExpandMarquee(pixelsDistance, atCanvasBounds) {
    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(cTID('By  '), cTID('#Pxl'), pixelsDistance);
    desc1.putBoolean(sTID("selectionModifyEffectAtCanvasBounds"), atCanvasBounds);
    executeAction(cTID('Expn'), desc1, DialogModes.NO);
  };
// Obkresli diru
  function StrokeAroundSelection(pixelWidth) {     
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Wdth'), pixelWidth);
    desc1.putEnumerated(cTID('Lctn'), cTID('StrL'), cTID('Otsd'));
    desc1.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    desc1.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('H   '), cTID('#Ang'), 311.995239257813);
    desc2.putDouble(cTID('Strt'), 100);
    desc2.putDouble(cTID('Brgh'), 100);
    desc1.putObject(cTID('Clr '), cTID('HSBC'), desc2);
    executeAction(cTID('Strk'), desc1, DialogModes.NO);
  };
//Pridej komentar
  function JachAddFileComment(komentarString) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Prpr'), cTID('FlIn'));
    ref1.putEnumerated(cTID('Dcmn'), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    var list1 = new ActionList();
    list1.putString(komentarString);
    desc2.putList(cTID('Kywd'), list1);
    desc1.putObject(cTID('T   '), cTID('FlIn'), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Crop to 3507*2480
  function JachCrop() {
    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(cTID('Wdth'), cTID('#Pxl'), 3507);
    desc1.putUnitDouble(cTID('Hght'), cTID('#Pxl'), 2480);
    desc1.putEnumerated(cTID('Hrzn'), cTID('HrzL'), cTID('Cntr'));
    desc1.putEnumerated(cTID('Vrtc'), cTID('VrtL'), cTID('Top '));
    executeAction(sTID('canvasSize'), desc1, DialogModes.NO);
  };

  // Nastav barvu popředí
  function SetFGColor(Red, Green, Blue) { //např. 0, 241, 192
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(cTID('Clr '), cTID('FrgC'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Rd  '), Red);
    desc2.putDouble(cTID('Grn '), Green);
    desc2.putDouble(cTID('Bl  '), Blue);
    desc1.putObject(cTID('T   '), sTID("RGBColor"), desc2);
    desc1.putString(cTID('Srce'), "eyeDropperSample");
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  // Vyber tužku
  function SelectPencil(enabled, withDialog) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(cTID('PcTl'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('slct'), desc1, DialogModes.NO);
  };

  // Nastav Rozměr štětce
  function SetBrushDiameter(diameterInPixels) { //např. 27
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Brsh'), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(sTID("masterDiameter"), cTID('#Pxl'), diameterInPixels);
    desc1.putObject(cTID('T   '), cTID('Brsh'), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function SelectAllLayersBesidesBackground() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('selectAllLayers'), desc1, DialogModes.NO);
  };

function FlattenImage() {
    executeAction(sTID('flattenImage'), undefined, DialogModes.NO);
};

  function eSTINBlending() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 60);
    var desc3 = new ActionDescriptor();
    desc3.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc4 = new ActionDescriptor();
    desc4.putBoolean(cTID('enab'), true);
    desc4.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    desc4.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    var desc5 = new ActionDescriptor();
    desc5.putDouble(cTID('Rd  '), 255);
    desc5.putDouble(cTID('Grn '), 0);
    desc5.putDouble(cTID('Bl  '), 0);
    desc4.putObject(cTID('Clr '), sTID("RGBColor"), desc5);
    desc3.putObject(cTID('SoFi'), cTID('SoFi'), desc4);
    desc2.putObject(cTID('Lefx'), cTID('Lefx'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function eLIGHTBlending() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), 80);
    var desc3 = new ActionDescriptor();
    desc3.putUnitDouble(cTID('Scl '), cTID('#Prc'), 416.666666666667);
    var desc4 = new ActionDescriptor();
    desc4.putBoolean(cTID('enab'), true);
    desc4.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
    desc4.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
    var desc5 = new ActionDescriptor();
    desc5.putDouble(cTID('Rd  '), 11.9844353199005);
    desc5.putDouble(cTID('Grn '), 0);
    desc5.putDouble(cTID('Bl  '), 255);
    desc4.putObject(cTID('Clr '), sTID("RGBColor"), desc5);
    desc3.putObject(cTID('SoFi'), cTID('SoFi'), desc4);
    desc2.putObject(cTID('Lefx'), cTID('Lefx'), desc3);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function ClearStyles() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('disableLayerStyle'), desc1, DialogModes.NO);
  };

  function CreateGroup() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(sTID("layerSection"));
    desc1.putReference(cTID('null'), ref1);
    executeAction(cTID('Mk  '), desc1, DialogModes.NO);
  };

function OpacityToPercent(percentage) { //such as 40
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Opct'), cTID('#Prc'), percentage);
    desc1.putObject(cTID('T   '), cTID('Lyr '), desc2);
    executeAction(cTID('setd'), desc1, DialogModes.NO);
  };

  function SelectRGBChannels() {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Chnl'), cTID('Chnl'), sTID("RGB"));
    desc1.putReference(cTID('null'), ref1);
    desc1.putBoolean(cTID('MkVs'), false);
    executeAction(cTID('slct'), desc1, DialogModes.NO);
  };

  //resize to width and keep aspect ratio
  function resizeToWidth(widthInPixels) {
    var desc1 = new ActionDescriptor();
    desc1.putUnitDouble(cTID('Wdth'), cTID('#Pxl'), widthInPixels);
    desc1.putBoolean(sTID("scaleStyles"), true);
    desc1.putBoolean(cTID('CnsP'), true);
    desc1.putEnumerated(cTID('Intr'), cTID('Intp'), sTID("automaticInterpolation"));
    executeAction(sTID('imageSize'), desc1, DialogModes.NO);
  };

 function PlacePSD(fileNameAndPath) { //such as "/e/90/90_ae/FAZE/01_FAZE_002.psd"
    var desc1 = new ActionDescriptor();
    desc1.putPath(cTID('null'), new File(fileNameAndPath));
    desc1.putBoolean(cTID('Lnkd'), true);
    desc1.putEnumerated(cTID('FTcs'), cTID('QCSt'), sTID("QCSAverage"));
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(cTID('Hrzn'), cTID('#Pxl'), 0);
    desc2.putUnitDouble(cTID('Vrtc'), cTID('#Pxl'), 0);
    desc1.putObject(cTID('Ofst'), cTID('Ofst'), desc2);
    executeAction(cTID('Plc '), desc1, DialogModes.NO);
  };

  function DuplicateLayerIntoDocument(layer, targetDocument) { //such as ("eSTIN",hele.psd); Places above currently selected layer
    var layerToDup = layer;
    var dupToDoc = targetDocument;
    var ref1 = new ActionReference();
    var desc1 = new ActionDescriptor();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    var ref2 = new ActionReference();
    ref2.putName(cTID('Dcmn'), targetDocument);
    desc1.putReference(cTID('T   '), ref2);
    desc1.putString(cTID('Nm  '), layer);
    desc1.putInteger(cTID('Vrsn'), 5);
    executeAction(cTID('Dplc'), desc1, DialogModes.NO);
  };

  function ColorRangeStin() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 95);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 35.28);
    desc2.putDouble(cTID('A   '), 54.38);
    desc2.putDouble(cTID('B   '), -18.04);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 66.13);
    desc3.putDouble(cTID('A   '), 81.52);
    desc3.putDouble(cTID('B   '), 48.93);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };

 function ReduceBGcomplexity() {
    var desc1 = new ActionDescriptor();
    desc1.putInteger(cTID('Fzns'), 35);
    var desc2 = new ActionDescriptor();
    desc2.putDouble(cTID('Lmnc'), 97.28);
    desc2.putDouble(cTID('A   '), -3.13);
    desc2.putDouble(cTID('B   '), 0.59);
    desc1.putObject(cTID('Mnm '), cTID('LbCl'), desc2);
    var desc3 = new ActionDescriptor();
    desc3.putDouble(cTID('Lmnc'), 99.96);
    desc3.putDouble(cTID('A   '), 0.61);
    desc3.putDouble(cTID('B   '), 7.07);
    desc1.putObject(cTID('Mxm '), cTID('LbCl'), desc3);
    desc1.putInteger(sTID("colorModel"), 0);
    executeAction(sTID('colorRange'), desc1, DialogModes.NO);
  };

  function InvertMarchingAnts() {
    executeAction(cTID('Invs'), undefined, DialogModes.NO);
  };



function CheckIfAnyPalleteIsVisible(){
var isVisible = false;
var palletesToCheck = ["Nástroje", "Vrstvy", "Vzorník", "Color", "Informace", "Kanály", "Akce", "Knihovny", "Cesty", "Stopa", "Tools", "Layers", "Swatches", "Color", "Info", "Channels", "Actions", "Libraries", "Paths", "Brush"]
var ref = new ActionReference();
ref.putEnumerated( charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
var applicationDesc = executeActionGet(ref);
var panelList = applicationDesc.getList(stringIDToTypeID('panelList'));
for (var m = 0; m < panelList.count; m++) {
   var thisPanelDesc = panelList.getObjectValue(m);
        for(i = 0; i < palletesToCheck.length; i++){
            if (thisPanelDesc.getString(stringIDToTypeID("name")) == palletesToCheck[i] && isVisible == false) {
                //alert(thisPanelDesc.getString(stringIDToTypeID("name")) + " je " + thisPanelDesc.getBoolean(stringIDToTypeID("visible")));
                isVisible = thisPanelDesc.getBoolean(stringIDToTypeID("visible"));
            }
        }
    }   
return isVisible;
};

function GetFilesFromBridge() {
	var fileList;
	if ( BridgeTalk.isRunning( "bridge" ) ) {
		var bt = new BridgeTalk();
		bt.target = "bridge";
		bt.body = "var theFiles = photoshop.getBridgeFileListForAutomateCommand();theFiles.toSource();";
		bt.onResult = function( inBT ) { fileList = eval( inBT.body ); }
		bt.onError = function( inBT ) { fileList = new Array(); }
		bt.send();
		bt.pump();
		$.sleep( 100 );
		var timeOutAt = ( new Date() ).getTime() + 5000;
		var currentTime = ( new Date() ).getTime();
		while ( ( currentTime < timeOutAt ) && ( undefined == fileList ) ) {
			bt.pump();
			$.sleep( 100 );
			currentTime = ( new Date() ).getTime();
		}
	}
	if ( undefined == fileList ) {
		fileList = new Array();
	}
	return fileList; 
}