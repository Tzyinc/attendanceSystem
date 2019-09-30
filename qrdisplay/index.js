function genQR() {
    var qs = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
    if (qs && qs['id']) {
        document.getElementById('qrGroup').style.display = "block";
        document.getElementById('enterQR').style.display = "none";
        QRCode.toCanvas(document.getElementById('canvas'), qs['id'], function (error) {
            if (error) console.error(error)
        });
    } else {
        document.getElementById('qrGroup').style.display = "none";
        document.getElementById('enterQR').style.display = "flex";
    }
}

function enterID() {
    var groupId = document.getElementById('groupID').value;
    window.location.href = '?id=' +groupId
}