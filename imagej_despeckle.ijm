var dir = getArgument();
var files = getFileList(dir);
for (i=0; i<files.length; i++) {
	if(filterDespecklePng(files[i])) {
		despeckleFile(files[i]);
	}
}
run("Quit");

function filterDespecklePng(name) {
    // is directory?
    if (endsWith(name,"/")) return false;

    // is png?
    if (!endsWith(name,".png")) return false;

    // does name contain both "Series002" and "ch01"
    // if (indexOf(name,"despecle.png")==-1) return false;

    return true;
}

function despeckleFile(file)  {
var fileWithDir = dir + "/" + file;
open(fileWithDir );
setMinAndMax(254, 255);
run("Apply LUT");
run("8-bit");
setThreshold(0, 254);
run("Convert to Mask");
run("Fill Holes");
run("Analyze Particles...", "size=70-Infinity pixel show=Masks include");
run("Invert");
run("RGB Color");
saveAs("PNG", fileWithDir);
close();
close();
}
