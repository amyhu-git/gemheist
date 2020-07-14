var express = require('express'); //need to use express package
var expressBasicAuth = require('express-basic-auth');
var bodyParser = require('body-parser');
var app = express(); //create server
const { uuid } = require('uuidv4')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) //optional but useful for url encoded data


let users = { //username and password for login/authentication
    'amy': 'winner',
    'huanming': 'password',
    'zoe': 'cheese'
}

//declare universal variable which is an object for storing information of every game
var games = {}

app.get('/players', function(req, res, next) { //send registered users to check username
    res.status(200).json(users)
})

app.post('/register/:PLAYER', function(req, res, next) {  //register new users with name and password
    let player = req.params.PLAYER.toLowerCase();
    let password = req.body.content
    users[player] = password
    res.status(200).send(`Player ${player} has been added`); //inform client of success
    console.log(users);
})

app.post('/startnewgame',function(req,res,next){ //creating game and adding to overall  games object 
	let playinfo = req.body.username  //taking info sent by client
	let width = req.body.width
	let height = req.body.height
	let gameid = uuid();
	games[gameid] = {	turn:playinfo, 
						clicklist:[], 
						scorearray:[["bar1","bar6","bar7","bar12"],["bar2","bar7","bar8","bar13"],
									["bar3","bar8","bar9","bar14"],["bar4","bar9","bar10","bar15"],
									["bar5","bar10","bar11","bar16"],["bar12","bar17","bar18","bar23"],
									["bar13","bar18","bar19","bar24"],["bar14","bar19","bar20","bar25"],
									["bar15","bar20","bar21","bar26"],["bar16","bar21","bar22","bar27"],
									["bar23","bar28","bar29","bar34"],["bar24","bar29","bar30","bar35"],
									["bar25","bar30","bar31","bar36"],["bar26","bar31","bar32","bar37"],
									["bar27","bar32","bar33","bar38"],["bar34","bar39","bar40","bar45"],
									["bar35","bar40","bar41","bar46"],["bar36","bar41","bar42","bar47"],
									["bar37","bar42","bar43","bar48"],["bar38","bar43","bar44","bar49"],
									["bar45","bar50","bar51","bar56"],["bar46","bar51","bar52","bar57"],
									["bar47","bar52","bar53","bar58"],["bar48","bar53","bar54","bar59"],
									["bar49","bar54","bar55","bar60"]], 
						win:null,
						user1:playinfo,
						quit:null,
						lose:null,
						finished:false,
						width:width,
						height:height,
						draw1:null,
						draw2:null
					}
	games[gameid][playinfo]=0;
	res.status(200).json({gameid:gameid})
	console.log(games[gameid])
})

app.post('/updatetext',function(req,res,next){  //send game status if requested 
	let gameid = req.body.gameid
	let gameinfo = games[gameid]
	res.status(200).json(gameinfo)	
})

app.post('/click', function(req,res,next){ //update clicked alarms array
	let id = req.body.id
	let gameid = req.body.gameid
	games[gameid].clicklist.push(id)
	res.status(200).end()
})

app.post('/changeturn',function(req,res,next){ //update turn-taking
	let gameid = req.body.gameid
	let turn = req.body.turn
	games[gameid].turn=turn
	res.status(200).end()
})

app.post('/postscorearray',function(req,res,next){ //update score for game and user 
	let gameid = req.body.gameid
	let id = req.body.id
	let username = req.body.username
	let score = req.body.score
	games[gameid].scorearray[id]=username
	games[gameid][username]=score
	res.status(200).end()
})

app.post('/winner',function(req,res,next){ //define winner for game 
	let winner = req.body.winner
	let loser = req.body.loser
	let gameid = req.body.gameid
	games[gameid].win=winner
	games[gameid].lose=loser
	games[gameid].finished=true
	console.log(games[gameid])
	res.status(200).end()
})
app.post('/draw',function(req,res,next){ //define draw outcome for game 
	let gameid = req.body.gameid
	games[gameid].draw1=games[gameid].user1
	games[gameid].draw2=games[gameid].user2
	games[gameid].finished=true
	res.status(200).end()
})

app.post('/register/:PLAYER', function(req, res, next) {  
    let player = req.params.PLAYER.toLowerCase();
    let password = req.body.content
    users[player] = password
    res.status(200).send(`Player ${player} has been added`);
    console.log(users);
})

app.get('/getgameid',function(req,res,next){  //send all games
	res.status(200).json(games)
})

app.get('/score/:USERNAME', function(req, res, next) { // update statistics
    let username = req.params.USERNAME.toLowerCase()
	let win = 0
	let lose = 0
	let draw = 0
	if(Object.keys(games)!=0){
		let keys = Object.keys(games)
		for(i=0;i<keys.length;i++){
			let id = keys[i]
			if (games[id].win==username) {
				win = win + 1
			}else if (games[id].lose==username){
				lose = lose + 1
			}else if (games[id].draw1==username || games[id].draw2==username){
				draw = draw + 1
			}
		}
	}
	res.status(200).json({win:win,lose:lose,draw:draw})
})



//when client click to join a game we will add his/her information to that game object
app.post('/joingame',function(req,res,next){
	let opponent = req.body.username
	let gameid = req.body.gameid
	games[gameid].user2 = opponent
	games[gameid][opponent]=0;
	res.status(200).json({width:games[gameid].width,height:games[gameid].height})
})


app.post('/checkturn',function(req,res,next){ //send status of game for turn-taking
	let gameid = req.body.gameid
	res.status(200).json(games[gameid])
})

app.post('/register/:PLAYER', function(req, res, next) {
    let player = req.params.PLAYER.toLowerCase();
    let password = req.body.content
    users[player] = password
    res.status(200).send(`Player ${player} has been added`);
    console.log(users);
})

app.post('/quitgame',function(req,res,next){ //update game info when quit game occurs
	let username = req.body.username
	let gameid = req.body.gameid
	let winner = req.body.winner
	games[gameid].quit=username
	games[gameid].lose=username
	games[gameid].win=winner
	games[gameid].finished=true;
	console.log(games[gameid])
	res.status(200).end()
})

app.post('/waitquit',function(req,res,next){ //end game if quit game occurs before player2 joined
	let gameid = req.body.gameid
	games[gameid].finished=true
	res.status(200).end()
})


let authorise = expressBasicAuth({ //login authorisation 
    users: users,
    unauthorizedResponse: (req) => ((req.auth) ? 'Credentials rejected' : 'No credentials provided')
})

app.use('/login', authorise, function(req, res, next) { //display greeting message if login successful
    res.status(200).json({ msg: 'Hello ' + req.auth.user.toUpperCase() });
})

app.use('/public_info', function(req, res, next) { //defined public info displayed at all times
    let msg = "WELCOME! <br> Let's Play GemHeist!";
    res.status(200).json({ msg: msg });
});

app.use(express.static('content')); //where to find files

app.listen(3000, () => { console.log("listenting at 3000") }); //listening to port
