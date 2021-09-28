//HTML elements
let clientId = null;
let gameId = null;
let playerColor = null;
let url = "wss://radialv1.herokuapp.com/";
let ws = new WebSocket(url);
const tileMap = [];
const menuContainer = document.getElementById('menu');
const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const txtGameId = document.getElementById("txtGameId");
const divPlayers = document.getElementById("divPlayers");
const divBoard = document.getElementById("divBoard");
const chatBox = document.getElementById('chatBox')
const nickname = document.getElementById('nickname');


//wiring events
btnJoin.addEventListener("click", e => {

    if (gameId === null)
        gameId = txtGameId.value;

    const payLoad = {
        "method": "join",
        "clientId": clientId,
        "gameId": gameId,
        "nickname": nickname.value || null
    }

    ws.send(JSON.stringify(payLoad));

})

btnCreate.addEventListener("click", e => {

    const payLoad = {
        "method": "create",
        "clientId": clientId
    }

    ws.send(JSON.stringify(payLoad));

})

ws.onerror = (e) => console.log(e);

ws.onmessage = message => {
    //message.data
    const response = JSON.parse(message.data);
    //connect
    if (response.method === "connect") {
        clientId = response.clientId;
        console.log("Client id Set successfully " + clientId)
    }

    //create
    if (response.method === "create") {
        gameId = response.game.id;
        navigator.clipboard.writeText(gameId);
        console.log("game successfully created with id " + response.game.id + " with " + response.game.balls + " balls")
    }


    //update
    if (response.method === "update") {
        //{1: "red", 1}
        if (!response.game.state) return;
        for (const b of Object.keys(response.game.state)) {
            const color = response.game.state[b];
            const ballObject = document.getElementById("ball" + b);
            ballObject.style.backgroundColor = color
        }

    }

    //join
    if (response.method === "join") {
        menuContainer.style.display = 'none';
        const game = response.game;

        while (divPlayers.firstChild)
            divPlayers.removeChild(divPlayers.firstChild)

        game.clients.forEach(c => {
            console.log(c.nickname);
            const d = document.createElement("div");
            d.style.width = "200px";
            d.style.background = c.color
            d.textContent = `${c.nickname || c.clientId} >> ${c.point}`;
            divPlayers.appendChild(d);

            if (c.clientId === clientId) playerColor = c.color;
        })


        while (divBoard.firstChild)
            divBoard.removeChild(divBoard.firstChild)

        for (let i = 0; i < game.balls; i++) {

            const b = document.createElement("button");
            b.id = "ball" + (i + 1);
            b.tag = i + 1
            b.className = 'game-tile'
            b.textContent = i + 1
            b.addEventListener("click", () => {
                b.style.background = playerColor
                const payLoad = {
                    "method": "play",
                    "clientId": clientId,
                    "gameId": gameId,
                    "ballId": b.tag,
                    "color": playerColor,
                    "point": i + 1
                    
                }
                ws.send(JSON.stringify(payLoad))
            })
            divBoard.appendChild(b);
        }

    }

    if (response.method === "e") {
        console.log('got score update')
        menuContainer.style.display = 'none';
        const game = response.game;

        while (divPlayers.firstChild)
            divPlayers.removeChild(divPlayers.firstChild)

        game.clients.forEach(c => {
            console.log(c.nickname);
            const d = document.createElement("div");
            d.style.width = "200px";
            d.style.background = c.color
            d.textContent = `${c.nickname || c.clientId} >> ${c.point}`;
            divPlayers.appendChild(d);

            if (c.clientId === clientId) playerColor = c.color;
        })
    }
}
