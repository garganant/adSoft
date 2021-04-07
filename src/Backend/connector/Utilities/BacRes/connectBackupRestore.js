const electron = require("electron");
const { ipcRenderer, remote } = electron;
const { dialog } = electron.remote;
const customTitlebar = require("custom-electron-titlebar");
var path = require("path");

new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex("#444"),
  icon: "../../../../assets/images/Logo.ico"
});

var input = document.getElementById("pass");
input.addEventListener("keyup", checkCapsLock);
input.addEventListener("mousedown", checkCapsLock);
function restore() {
    document.getElementById("passl").hidden = false;
    document.getElementById("pass").hidden = false;
    document.getElementById("passBtn").style.visibility = "visible";
}
async function backup() {
    var btn = document.getElementById("backupBtn");
    btn.style.cursor = "wait";
    btn.disabled = true;
    btn.innerHTML = "...processing...";
    btn.className = "grey btn col push-s4";
    ipcRenderer.send("db:backup");
}
ipcRenderer.on("db:backed", async (event, arg) => {
    dialog.showMessageBox({ type: "info", message: arg });
    window.location.reload();
});
async function check() {
    var password = document.getElementById("pass").value;
    if (password == "RESTORE") {
        document.getElementById("warning").innerHTML = "";
        document.getElementById("passl").hidden = true;
        document.getElementById("pass").hidden = true;
        document.getElementById("passBtn").style.visibility = "hidden";
        var btn = document.getElementById("restoreBtn");
        btn.style.cursor = "wait";
        btn.disabled = true;
        btn.innerHTML = "...processing...";
        btn.className = "grey btn col push-s5";
        ipcRenderer.send("db:restore");
    } else {
        dialog.showMessageBox({ type: "error", message: "Incorrect password!" });
        var win = remote.getCurrentWindow();
        win.loadURL(path.resolve(__dirname + "../../../basePage.html"));
    }
}
ipcRenderer.on("db:restored", async (event, arg) => {
    dialog.showMessageBox({ type: "info", message: arg });
    window.location.reload();
});
function checkCapsLock(e) {
    var text = document.getElementById("warning");
    if (e.getModifierState("CapsLock")) text.innerHTML = "Warning! Caps lock is ON";
    else text.innerHTML = "";
}
function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}
document.addEventListener("keyup", reload);
