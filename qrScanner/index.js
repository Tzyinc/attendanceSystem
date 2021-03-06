
let groupId;
let member;
let members;

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
const FIELDS = ['group', 'teamName', 'cat'];
function fetchData(ids) {

    let idInfo = ids.split('-');
    groupId = idInfo[0];
    fetch(`https://cache.imthebestcoder.ml/getTeamData?id=${groupId}`)
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
                    document.getElementById('applicantInfo').style.display = "flex";
                    let teamInfo = data.seatInfo;
                    members = data.seatInfo;
                    for (let field of FIELDS) {
                        if (data[field] === "" || !data[field]) {

                            document.getElementById('loading').style.display = 'none';
                            document.getElementById('applicantInfo').style.display = "none";
                            alert('user not found')
                        }
                        document.getElementById(field).innerText = data[field];
                    }

                    for (let index in teamInfo) {
                        let teammate = teamInfo[index];
                        // console.log(index);
                        let teamslot = document.getElementById(index);
                        teamslot.innerHTML = `
                            <div class="fields">
                                <span id="fields${index}" class="${teammate.att ? "strikeout" : ""}">
                                    <span>Name:&nbsp</span>
                                    <span class="details clickable">
                                        <span id="fname">${teammate.fname}</span>
                                        <span id="lname">${teammate.lname}</span>
                                        &nbsp
                                    </span>
                                    <span>(Seat:&nbsp</span>
                                    <span id="seatNo">${teammate.seatNo})</span>
                                </span>
                               &nbsp&nbsp
                                <button>
                                    Confirm
                                </button>
                            </div>
                        `

                    }
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
            alert('Looks like there was a problem' + err);
        });
}

function makeAttendance(id) {
    console.log(members, id);
    if (members[id].att === 0) {
        confirmRegistration(groupId, id);
    }
}

function confirmRegistration(groupId, member) {
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

                        document.getElementById(`fields${member}`).className = "fields strikeout";
                        // alert('success!');
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
