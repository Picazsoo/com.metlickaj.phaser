#include "./jachym-library.jsx"

var desktopPath = "~/Desktop/temp_stinovac.txt";
var posledniFile = new File(desktopPath);
var docRef;

if(posledniFile.exists && app.documents.length == 0){
    var content;
    posledniFile.open("r");
    content = posledniFile.readln();
    posledniFile.close();
    posledniFile.remove();
    docRef =  open(File(content));
    app.notifiers.removeAll();
    SelectLayer("eSTIN");
    ShowLayer(true);
    docRef.close(SaveOptions.SAVECHANGES);
    }