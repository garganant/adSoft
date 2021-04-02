const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../assets/images/Logo.ico',
    shadow: true
});

var curr = new Date(), exp = new Date(2022, 02, 20);
if (curr > exp)
    document.getElementById('warning').hidden = false

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload()
}

document.addEventListener('keyup', reload);
