; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Phaser"
#define MyAppVersion "2.0"
#define MyAppPublisher "Jachym's photoshop utils"
#define MyAppURL "http://metlicka.eu"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{918D5CE6-05AD-4D57-A67C-7EE5E400282C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={userappdata}\Adobe\CEP\extensions\com.metlickaj.phaser
DisableDirPage=yes
DefaultGroupName=animace-phaser
AllowNoIcons=yes
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
OutputDir=C:\Users\krisn\Desktop
OutputBaseFilename=phaserSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "czech"; MessagesFile: "compiler:Languages\Czech.isl"

[InstallDelete]
Type: filesandordirs; Name: "{userappdata}\Adobe\CEP\extensions\com.metlickaj.phaser\*"

[Files]
Source: ".\client\*"; DestDir: "{app}\client"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\CSXS\*"; DestDir: "{app}\CSXS"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\host\*"; DestDir: "{app}\host"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"

