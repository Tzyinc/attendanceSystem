require('dotenv').config()

var cors = require('cors')
var express = require('express');
var app = express();
const path = require('path');
const { google } = require('googleapis');

var corsOptions = {
    origin: 'https://regist.imthebestcoder.ml',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const TOKEN_PATH = path.join(__dirname, 'token.json');
const credentials = {
    "installed": {
        "client_id": process.env.CLIENT_ID,
        "project_id": "quickstart-1566546576544",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": process.env.CLIENT_SECRET,
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
};
const SHEET_ID = process.env.SHEET_ID;
const COLUMNS = process.env.COLUMNS;
const ATT_COLUMNS = process.env.ATT_COLUMNS;

let ssCache = [[]];
let attCache = [[]]

readSpreadSheet(SHEET_ID, COLUMNS, ATT_COLUMNS);
setInterval(function () {
    readSpreadSheet(SHEET_ID, COLUMNS, ATT_COLUMNS);
}, 60 * 1000); 

function getOAuth2Client() {
    const token = require(TOKEN_PATH);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

function getValueGivenRowCol(row, col, instanceOfCol = 0) {
    let headers = ssCache[0];
    let indexes = getAllIndexes(headers, col);
    let team = ssCache.find(arr => arr[0] === row);
    return team[indexes[instanceOfCol]];
}

function getAllIndexes(arr, val) {
    let indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function readSpreadSheet(spreadsheetId, spreadSheetRange, attendanceSpreadSheetRange) {
    const auth = getOAuth2Client();
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
        {
            spreadsheetId: spreadsheetId,
            range: spreadSheetRange,
        }
    ).then(res => {
        sheets.spreadsheets.values.get(
            {
                spreadsheetId: spreadsheetId,
                range: attendanceSpreadSheetRange,
            }
        ).then(res2 => {
            // console.log('one', res.data.values,'two', res2.data.values);
            if (res.data && res.data.values) {
                ssCache = res.data.values;
                for (team of ssCache) {
                    if (team[0] !== 'Submission ID') {
                        const id = team[0]
                        const teamMembers = Number(getValueGivenRowCol(id, 'No. of team members'));
                    }
                }
            }
            if (res2.data && res2.data.values) {
                attCache = res2.data.values
            } else {
                //write to googlesheet with col;
                const toWrite = ssCache.map(item => [item[0]]);
                (async () => {
                    const result = await updateSpreadSheet(spreadsheetId, attendanceSpreadSheetRange, {values: toWrite});
                })()
            }
        }).catch(err2 => {
            console.error(err2);
        });
    }).catch(err => {
        console.error(err);
    });
}

function updateSpreadSheet(spreadsheetId, spreadSheetRange, body) {
    const auth = getOAuth2Client();
    const sheets = google.sheets({ version: 'v4', auth });
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.update(
            {
                spreadsheetId: spreadsheetId,
                range: spreadSheetRange,
                resource: body,
                valueInputOption: 'USER_ENTERED'
            },
            (err, res) => {
                if (err) return reject(err);
                resolve(res);
            }
        );
    });
}

async function updateAttendance(id, member) {
    const memberCols = ['B', 'C', 'D', 'E'];
    const rowIndex = attCache.findIndex(item => item[0] === id) + 1;
    if (rowIndex > 0) {
        await updateSpreadSheet(SHEET_ID, `attendance!${memberCols[member]}${rowIndex}`, {values: [[1]]});
        return {success: true};
    }
    return {success: false};
}

function getDetails(id, member) {
    const fname = getValueGivenRowCol(id, 'First name', member);
    const lname = getValueGivenRowCol(id, 'Last name', member);
    const shirtSize = getValueGivenRowCol(id, 'Shirt size', member);
    const teamName = getValueGivenRowCol(id, 'Team name');
    const numMembers = getValueGivenRowCol(id, 'No. of team members');
    const cat = getValueGivenRowCol(id, 'Competition category');
    
    return {
        group: id,
        fname,
        lname,
        shirtSize,
        teamName,
        numMembers,
        cat
    };
}

app.get('/', cors(), function (req, res) {
    res.send({ submit: '/submitUserAttendance?id=&member=', get: '/getUserData?id=&member='});
});

app.get('/submitUserAttendance', cors(), function (req, res) {
    const query = req.query;
    if (query) {
        const id = query.id;
        const member = query.member;
        updateAttendance(id, member).then(success => {
            res.send(success);
        }).catch(e => {
            res.send({success: false, e})
        })
    } else {
        res.send({success: false})
    }
});

app.get('/allUserAttendance', cors(), function (req, res) {
    let total = 0;
    let attTaken = 0;
    let memberIndex = 0;
    for (let i = 0; i < ssCache.length; i++) {
        let row = ssCache[i];
        if (i === 0) {
            memberIndex = row.findIndex(item => item === 'No. of team members')
        } else {
            total += Number(row[memberIndex])
        }
    }
    for (let i = 0; i < attCache.length; i++) {
        let rowAttItems = attCache[i].filter(item => Number(item) === 1);
        // console.log(rowAttItems.count);
        attTaken += rowAttItems.length;
    }
    res.send({ total, attTaken, attCache})
});

app.get('/getUserData', cors(), function(req, res) {
    const query = req.query;
    const id = query.id;
    const member = query.member;
    let details = getDetails(id, member);
    res.send(details);
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})