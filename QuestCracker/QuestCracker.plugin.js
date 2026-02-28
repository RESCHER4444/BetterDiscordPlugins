/**
 * @name QuestCracker
 * @author RESCHER4444
 * @description Accept a quest and then activate the plugin.
 * @version 5
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/QuestCracker/QuestCracker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/QuestCracker/QuestCracker.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class QuestCracker {

start() {

console.log("[QuestCracker] Starting...");

delete window.$;

let wpRequire =
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

const supportedTasks = [
"WATCH_VIDEO",
"PLAY_ON_DESKTOP"
];

let quests=[...QuestsStore.quests.values()].filter(x=>
x.userStatus?.enrolledAt &&
!x.userStatus?.completedAt &&
supportedTasks.find(y =>
Object.keys(
(x.config.taskConfig??x.config.taskConfigV2).tasks
).includes(y))
);

if(!quests.length){
console.log("[QuestCracker] No quests.");
return;
}

console.log("[QuestCracker]",quests.length,"quest(s) found");

const isApp = typeof DiscordNative!=="undefined";

const doJob=()=>{

const quest=quests.pop();
if(!quest){
console.log("[QuestCracker] All quests finished.");
BdApi.Plugins.disable("QuestCracker");
return;
}

const taskConfig=
quest.config.taskConfig??
quest.config.taskConfigV2;

const taskName=
supportedTasks.find(x=>taskConfig.tasks[x]);

const secondsNeeded=
taskConfig.tasks[taskName].target;

let secondsDone=
quest.userStatus?.progress?.[taskName]?.value??0;

console.log("[QuestCracker] Running",taskName);

if(taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {

    const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
    let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

    (async () => {
        while (secondsDone < secondsNeeded) {
            const increment = 1; // 1 Sekunde pro Request
            const timestamp = Math.min(secondsNeeded, secondsDone + increment);

            try {
                await api.post({
                    url: `/quests/${quest.id}/video-progress`,
                    body: { timestamp }
                });
            } catch (error) {
                console.error("[QuestCracker] Video progress error:", error);
                // Pause bei Fehlern und erneut versuchen
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            secondsDone = timestamp;
            console.log(`[QuestCracker] ${secondsDone}/${secondsNeeded}`);
            await new Promise(r => setTimeout(r, 1000)); // 1 Sekunde Pause
        }

        console.log("[QuestCracker] Video quest completed!");
        doJob();
    })();

    return;
}

if(taskName==="PLAY_ON_DESKTOP"){

if(!isApp){
console.log("Desktop app required.");
doJob();
return;
}

api.get({
url:`/applications/public?application_ids=${quest.config.application.id}`
}).then(res=>{

const appData=res.body[0];

const exeName =
appData.executables?.find(x=>x.os==="win32")?.name
?? appData.name+".exe";

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

console.log("[QuestCracker] Game spoofed:",appData.name);

const fn=data=>{

let progress=
Math.floor(
data.userStatus.progress.PLAY_ON_DESKTOP.value
);

console.log(
`[QuestCracker] ${progress}/${secondsNeeded}`
);

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

console.log("[QuestCracker] Quest completed.");
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

doJob();
};

doJob();
}

stop(){
console.log("[QuestCracker] Stopped.");
}
};
