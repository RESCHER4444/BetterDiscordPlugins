/**
 * @name QuestCracker
 * @author RESCHER4444
 * @description Accept a quest and then activate the plugin.
 * @version 6.1
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/QuestCracker/QuestCracker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/QuestCracker/QuestCracker.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class QuestCracker {

log(...m){console.log("[QuestCracker]",...m)}

start(){

this.log("Starting...");

delete window.$;

const wpRequire =
webpackChunkdiscord_app.push([[Symbol()],{},r=>r]);
webpackChunkdiscord_app.pop();

const find = f =>
Object.values(wpRequire.c)
.find(x=>f(x?.exports))?.exports;

const RunningGameStore =
find(x=>x?.Ay?.getRunningGames)?.Ay;

const QuestsStore =
find(x=>x?.A?.__proto__?.getQuest)?.A;

const FluxDispatcher =
find(x=>x?.h?.__proto__?.flushWaitQueue)?.h;

const api =
find(x=>x?.Bo?.get)?.Bo;

const supportedTasks=[
"WATCH_VIDEO",
"WATCH_VIDEO_ON_MOBILE",
"PLAY_ON_DESKTOP"
];

let allQuests=[];

if(QuestsStore?.quests?.values)
    allQuests=[...QuestsStore.quests.values()];
else if(typeof QuestsStore?.getAllQuests==="function")
    allQuests=Object.values(QuestsStore.getAllQuests());
else{
    for(const k in QuestsStore){
        const q=QuestsStore[k];
        if(q?.config?.application) allQuests.push(q);
    }
}

let quests=allQuests.filter(q=>{

    const taskConfig=
    q.config?.taskConfig??
    q.config?.taskConfigV2;

    if(!taskConfig?.tasks) return false;

    return(
        q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        supportedTasks.some(t=>
            Object.keys(taskConfig.tasks).includes(t)
        )
    );
});

if(!quests.length){
    this.log("No quests.");
    return;
}

this.log(quests.length,"quest(s) found");

const isApp=typeof DiscordNative!=="undefined";

const doJob=()=>{

const quest=quests.pop();

if(!quest){
    this.log("All quests finished.");
    BdApi.Plugins.disable("QuestCracker");
    return;
}

const taskConfig=
quest.config.taskConfig??
quest.config.taskConfigV2;

const taskName=
supportedTasks.find(t=>taskConfig.tasks[t]);

const secondsNeeded=
taskConfig.tasks[taskName].target;

let secondsDone=
quest.userStatus?.progress?.[taskName]?.value??0;

this.log("Running",taskName);

if(
taskName==="WATCH_VIDEO"||
taskName==="WATCH_VIDEO_ON_MOBILE"
){

(async()=>{

this.log("Video spoof started");

while(secondsDone<secondsNeeded){

const increment=
Math.floor(Math.random()*3)+1;

const timestamp=Math.min(
secondsNeeded,
secondsDone+increment
);

try{

await api.post({
url:`/quests/${quest.id}/video-progress`,
body:{
timestamp,
source:
taskName==="WATCH_VIDEO_ON_MOBILE"
?"mobile"
:"desktop"
}
});

}catch(e){

this.log("Retry tick...");
await new Promise(r=>setTimeout(r,2000));
continue;
}

secondsDone=timestamp;

this.log(`${secondsDone}/${secondsNeeded}`);

const delay=
taskName==="WATCH_VIDEO_ON_MOBILE"
?2500+Math.random()*1500
:1000;

await new Promise(r=>setTimeout(r,delay));
}

this.log("Video quest completed.");
doJob();

})();

return;
}

if(taskName==="PLAY_ON_DESKTOP"){

if(!isApp){
this.log("Desktop app required.");
doJob();
return;
}

api.get({
url:`/applications/public?application_ids=${quest.config.application.id}`
}).then(res=>{

const appData=res.body[0];

const exeName=
appData.executables?.find(x=>x.os==="win32")?.name
??appData.name+".exe";

const pid=Math.floor(Math.random()*30000)+1000;

const fakeGame={
cmdLine:`C:\\Program Files\\${appData.name}\\${exeName}`,
exeName,
exePath:`c:/program files/${appData.name}/${exeName}`,
hidden:false,
isLauncher:false,
id:quest.config.application.id,
name:appData.name,
pid,
pidPath:[pid],
processName:appData.name,
start:Date.now()
};

const realGames=RunningGameStore.getRunningGames();
const realGetRunningGames=RunningGameStore.getRunningGames;
const realGetGameForPID=RunningGameStore.getGameForPID;

RunningGameStore.getRunningGames=()=>[fakeGame];
RunningGameStore.getGameForPID=p=>fakeGame;

FluxDispatcher.dispatch({
type:"RUNNING_GAMES_CHANGE",
removed:realGames,
added:[fakeGame],
games:[fakeGame]
});

this.log("Game spoofed:",appData.name);

const fn=data=>{

const progress=Math.floor(
data.userStatus.progress.PLAY_ON_DESKTOP.value
);

this.log(`${progress}/${secondsNeeded}`);

if(progress>=secondsNeeded){

RunningGameStore.getRunningGames=realGetRunningGames;
RunningGameStore.getGameForPID=realGetGameForPID;

FluxDispatcher.dispatch({
type:"RUNNING_GAMES_CHANGE",
removed:[fakeGame],
added:[],
games:[]
});

FluxDispatcher.unsubscribe(
"QUESTS_SEND_HEARTBEAT_SUCCESS",
fn
);

this.log("Quest completed.");
doJob();
}
};

FluxDispatcher.subscribe(
"QUESTS_SEND_HEARTBEAT_SUCCESS",
fn
);

});

return;
}

};

doJob();
}

stop(){
console.log("[QuestCracker] Stopped.");
}

};
