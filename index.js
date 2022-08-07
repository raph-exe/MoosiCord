const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const Discord = require('discord.js');
const DisTube = require('DisTube');

var mainWindow;
var BotClient = new Discord.Client({ intents: 32767 });
const distube = new DisTube.default(BotClient);
var isPlaying = false;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        frame: false
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');
});

ipcMain.on('message', (e,arg,arg2,arg3) => {
    if(arg === 'minimize') {
        mainWindow.minimize();
    }
    else if(arg === 'close') {
        app.quit();
    }
    else if (arg === 'offline') { 
        const msg = electron.dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Error',
            message: 'You are offline. Please connect to the internet to use MoosiCord.'
        }).then(() => { app.quit(); })
    }
    else if (arg === 'login') {
        BotClient.login(arg2).then(() => {
            e.reply('login','success',BotClient.user.username);
        }).catch(() => {
            const msg = electron.dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Error',
                message: 'Invalid token provided.'
            }).then(() => { e.reply('login','failure'); })
        })
    }
    else if(arg == 'play') {
        const channel = BotClient.channels.cache.get(arg2);
        if(!channel) {
            const msg = electron.dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Error',
                message: 'Invalid channel id provided.'
            })
            return;
        }
        if(isPlaying) {
            const msg = electron.dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Error',
                message: 'A song is already playing.'
            })
            return;
        }
        distube.playVoiceChannel(channel,arg3,{
            member: channel.guild.members.cache.get(BotClient.user.id),
            textChannel: channel.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').first()
        }).then(() => { isPlaying = true; }).catch(() => { isPlaying = false; })
        distube.on('playSong' , (chan,song) => {
            e.reply('playing',song.name);
        });
        distube.on('finishSong' , () => {
            isPlaying = false;
            e.reply('songend')
        })
    }
})

distube.on('error' , (chan,error) => {
    console.log(error);
});