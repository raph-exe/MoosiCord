const { ipcRenderer } = require('electron');

if(!navigator.onLine) {
    ipcRenderer.send('message','offline');
}

const minApp = () => {
    ipcRenderer.send('message','minimize');
}

const closeApp = () => {
    ipcRenderer.send('message','close');
}

const attemptLogin = () => {
    ipcRenderer.send('message','login',document.getElementById('username').value);
    ipcRenderer.on('login', (e,arg,arg2) => {
        if(arg === 'success') {
            document.getElementsByClassName('token')[0].remove();
            document.getElementById('startbtn').remove();
            const chanid = document.createElement('input');
            chanid.type = 'text';
            chanid.placeholder = 'Channel ID';
            chanid.id = "username"
            chanid.className = "chanid";
            const songname = document.createElement('input');
            songname.type = 'text';
            songname.placeholder = 'Song Name';
            songname.id = "username";
            songname.className = "songname";
            const playbtn = document.createElement('button');
            playbtn.id = "playbtn";
            playbtn.className = "playbtn";
            playbtn.innerHTML = 'Play';
            document.getElementsByClassName('login-block')[0].appendChild(chanid);
            document.getElementsByClassName('login-block')[0].appendChild(songname);
            document.getElementsByClassName('login-block')[0].appendChild(playbtn);
            document.getElementById('statustxt').innerText = "Status: Running on " + arg2;
            document.getElementById('playbtn').addEventListener('click', () => {
                ipcRenderer.send('message','play',document.getElementsByClassName('chanid')[0].value,document.getElementsByClassName('songname')[0].value);
                document.getElementsByClassName('chanid')[0].value = '';
                document.getElementsByClassName('songname')[0].value = '';
                ipcRenderer.on('playing', (e,arg11,arg22) => {
                    document.getElementById('statustxt').innerText = "Status: Playing '" + arg11 + "'";
                });
                ipcRenderer.on('songend', (e,arg11,arg22) => {
                    document.getElementById('statustxt').innerText = "Status: Running on " + arg2;
                })
            });
        } else if(arg === 'failure') {
            document.getElementById('username').value = '';
        }
    })
}