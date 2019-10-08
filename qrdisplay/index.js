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
        checkGroupExists(qs['id']);
    } else {
        document.getElementById('qrGroup').style.display = "none";
        document.getElementById('enterQR').style.display = "flex";
    }
}

function enterID() {
    var groupId = document.getElementById('groupID').value;
    window.location.href = '?id=' +groupId
}

function checkGroupExists(groupid) {
    fetch(`https://cache.imthebestcoder.ml/teamDoesExist?id=${groupid}`)
        .then(
            function (response) {
                if (response.status !== 200) {
                    alert('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                // Examine the text in the response
                response.json().then(function (data) {
                    console.log(data);
                    if (data && data.success ) {
                        document.getElementById('groupName').textContent = data.teamName;
                        document.getElementById('qrGroup').style.display = "block";
                        document.getElementById('enterQR').style.display = "none";
                        QRCode.toCanvas(document.getElementById('canvas'), groupid, { width: window.innerWidth/4}, function (error) {
                            if (error) console.error(error)
                        });
                    } else {
                        document.getElementById('qrGroup').style.display = "none";
                        document.getElementById('enterQR').style.display = "flex";
                    }
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert('Looks like there was a problem' + err);
        });
}