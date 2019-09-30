
let groupId;
let member;

async function app() {
    let scanner = new Instascan.Scanner({ video: document.getElementById('webcam') });
    scanner.addListener('scan', function (content) {
        document.getElementById('loading').style.display = 'block';
        fetchData(content)
    });
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    });
}
const FIELDS = ['cat', 'fname', 'lname', 'group', 'teamName', 'numMembers', 'shirtSize'];
function fetchData(ids) {
    let idInfo = ids.split('-');
    groupId = idInfo[0];
    member = idInfo[1];
    fetch(`https://cache.imthebestcoder.ml/getUserData?id=${groupId}&member=${member}`)
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
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('applicantInfo').style.display = "block";
                    
                    for (let field of FIELDS) {
                        document.getElementById(field).innerText = data[field];
                    }
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert('Looks like there was a problem' + err);
        });
}

function confirmRegistration() {
    console.log(groupId,member);
    fetch(`https://cache.imthebestcoder.ml/submitUserAttendance?id=${groupId}&member=${member}`)
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
                    if (data && data.success) {

                        document.getElementById('applicantInfo').style.display = "none";
                        groupId = undefined;
                        member = undefined;
                        alert('success!');
                    } else {
                        alert('error: ' + data)
                    }
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert('Looks like there was a problem' + err);
        });
}

app();
