// declare some universal variables
var username
var gameid
var game
var opponent
var width
var height
var scoree = 0

// declare a universal object storing css style for making game boards
var cssobject = {oddcss3:'84px 76px 84px',
evencss3:'16px 60px 16px 60px 16px 60px 16px',
oddcss4 : '84px 76px 76px 84px',
evencss4 : '16px 60px 16px 60px 16px 60px 16px 60px 16px',
oddcss5 : '84px 76px 76px 76px 84px',
evencss5 : '16px 60px 16px 60px 16px 60px 16px 60px 16px 60px 16px'}

// declare a universal object storing alarm ids
var overallbarid = [['bar1','bar2','bar3','bar4','bar5'],
				['bar6','gem1','bar7','gem2','bar8','gem3','bar9','gem4','bar10','gem5','bar11'],
				['bar12','bar13','bar14','bar15','bar16'],
				['bar17','gem6','bar18','gem7','bar19','gem8','bar20','gem9','bar21','gem10','bar22'],
				['bar23','bar24','bar25','bar26','bar27'],
				['bar28','gem11','bar29','gem12','bar30','gem13','bar31','gem14','bar32','gem15','bar33'],
				['bar34','bar35','bar36','bar37','bar38'],
				['bar39','gem16','bar40','gem17','bar41','gem18','bar42','gem19','bar43','gem20','bar44'],
				['bar45','bar46','bar47','bar48','bar49'],
				['bar50','gem21','bar51','gem22','bar52','gem23','bar53','gem24','bar54','gem25','bar55'],
				['bar56','bar57','bar58','bar59','bar60']
]



let user_key; //variable to identify current logged in user
function checkLogin(response) { //dealing auhtorisation error
	if (response.status == 401) { //hide private info and display error 
		document.getElementById('private_msg').innerHTML = '';
		document.getElementById('private').style.display = 'none';
		document.getElementById('login').style.display = 'display';
		document.getElementById('public_msg').innerHTML = 'Invalid username or password';
		return null;
	} else { //valid login
		return response.json();
	};
};

// declare a login function
function login() {
    username = document.getElementById('username').value
    user_key = btoa(document.getElementById('username').value + ':' + document.getElementById('pass').value);
    document.getElementById('username').value = ''; //empty username and password textbox
    document.getElementById('pass').value = '';
    greeting();
};

// delcare a register function
async function addUser() { //register new user with unique name 
    username = document.getElementById('username').value;
    let password = document.getElementById('pass').value;
    const res = await fetch('/players'); //get all the taken usernames
    const data = await res.json();
    let taken_usernames = Object.keys(data);
    if (taken_usernames.includes(username)) { //prevent same usernames
        alert('Username already exists');
        document.getElementById('public_msg').innerHTML = 'Choose another username!';
    } else {
        fetch(`/register/${username}`, { //post if username is unique
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: password })
            })
            .then(res => res.text())
            .then(txt => alert(txt))
			.catch(err=>{console.log(err)})
		login();
    }
}

function greeting() { //info display upon succesful login
	fetch('/login', {
			method: 'GET',
			headers: { 'Authorization': 'Basic ' + user_key },
		})
		.then(res => checkLogin(res)) //check authorisation (status == 200) 
		.then(jsn => {
			if (jsn && jsn.msg) { //display private info
				document.getElementById('private').style.display = 'block';
				document.getElementById('private_msg').innerHTML = jsn.msg;
				document.getElementById('login').style.display = 'none';
				public();
				getgameid();
				displayRecord(); //display new/updated all-time record
			}
		})
		.catch(err=>{console.log(err)})
}

function public() { //public welcome message if res.status == 200
	return fetch('/public_info')
		.then(res => checkLogin(res))
		.then(jsn => {
			if (jsn != null && jsn.msg) {
				document.getElementById('public_msg').innerHTML = jsn.msg;
			}
		})
}

// decalre a logout function
function logout() {
	user_key = null;
	document.getElementById('private_msg').innerHTML = '';
	document.getElementById('private').style.display = 'none';
	alert("You have been logged out!")
	document.getElementById('public_msg').innerHTML = 'See you next time!'
	document.getElementById('login').style.display = 'block';
	$('#player-record').empty();
}

//display player's statistics
function displayRecord() {
    let display = document.getElementById('player-record');
    if (username == null) {
        return null
    } else {
        fetch(`/score/${username}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => {
                display.innerText = `[${data.win} Wins, ${data.lose} Loses, ${data.draw} Draws]`
            })
			.catch(err => {console.log(err)})
    }
}

// declare a function for adding games which can be joined
function getgameid(){
	if(gameid==null){
	fetch('/getgameid',{method:'GET'}) //get all available games
		.then(response=>response.json())
		.then(data=>{
			//fetch data contain information of all games
			if(Object.keys(data).length!=0){
				let keys = Object.keys(data)  //obtain gameid of all games
				for(i=0;i<keys.length;i++){
					let id = keys[i] //gameid of each game
					if(data[id].finished==true){ //remove game if finished
						let name = 'p'+id
						$('#'+name).remove()
					}
					//check if there are already 2 players in a game
					if(data[id].finished==false&&Object.keys(data[id]).length<14){
						let checkele = document.getElementById('p'+id)
						if(checkele==null){ //display game if not yet displayed
						let joinbutton = $('<button></button>') //create button with onclick function
											.attr('id',id)
											.attr('onclick','joindoublegame(this.id)')
											.text('Join')
						let p = $('<p></p>') //create paragraph with game info
								.attr('id','p'+id)
								.text(id+' ')
								.append(joinbutton) //append button
						$('#joinreplay').append(p)   //append to body
						}
					}
				}
			}
		})
	}
	setTimeout(getgameid,1000) //function only executed after 1s 
}

// delcare a windowonload function
window.onload = () => { //button events 
	document.getElementById('login_button').onclick = login;
	document.getElementById('logout_button').onclick = logout;
	document.getElementById('private').style.display = 'none';  //default setting: hiding private info
	public();  //display public info
}

//declare a function for updating all the things needed while playing games
var updatefunction 
updatefunction = function(){ //displaying players' turns and scores 
	if(gameid!=null){
		$.ajax({
			url:'/updatetext',
			async:false,
			type:'POST',
			dataType:'json',
			data:JSON.stringify({gameid:gameid}),
			contentType:'application/json',
			success:function(gameinfo){
				if(Object.keys(gameinfo).length==15){ //gameinfo complete 
					game=gameinfo //set value of global variable 'game' to gameid 
					let turn = gameinfo.turn;  //info for each game
					let scorearray = gameinfo.scorearray;
					let clickedbars = gameinfo.clicklist;
					let user1 = gameinfo.user1;
					let user2 = gameinfo.user2;
					let winner = gameinfo.win
					let quit = gameinfo.quit
					let draw1 = gameinfo.draw1
					let draw2 = gameinfo.draw2
					if(user1==username){ //define opponent based on logged in username
						opponent=user2
					}else{
						opponent=user1
					}
					let opponentscore = gameinfo[opponent]; //define opponent score
					for(j=1;j<26;j++){
							if(scorearray[j-1]==user1||scorearray[j-1]==user2){  //display name if gem is collected 
								let gemid = 'image'+j;
								let name = scorearray[j-1];
								document.getElementById(gemid).style.display= "none";
								document.getElementById('text'+j).innerHTML=name;
							}
					}
					if(clickedbars.length!=0){ //clicked bars turn 'disappear' (turn white)
						for(i=0;i<clickedbars.length;i++){
							$("#"+clickedbars[i]).attr("onclick",null)
							document.getElementById(clickedbars[i]).style.backgroundColor= "white";
						}
					}
					if(turn == username){ //change command if player's turn
						$('#waitstatus').text("It's your turn now");
					}else{
						$('#waitstatus').text("It's not your turn, please wait...");
					}
					$('#showopscore').text(opponent+'(opponent): '+'Score '+opponentscore);
					if(winner==opponent){ //losing 
						gameid=null //end game by setting global variables gameid & game to null again
						game=null
						opponent=null
						scoree = 0
						setTimeout(function(){
							alert('You lose with a score of one!') //alert result to player 
							displayRecord();
							document.getElementById('private').style.display = 'block'; //display menu
							document.getElementById('game_interface').style.display = 'none'; //hide gameboard
						},1000)
					}
					if(winner==username){ //winning 
						gameid=null
						game=null
						opponent=null
						scoree = 0
						setTimeout(function(){
							alert('You win with a score of one!') //alert result to player
							displayRecord();
							document.getElementById('private').style.display = 'block';
							document.getElementById('game_interface').style.display = 'none';
						},1000)
					}
					if(draw1==username||draw2==username){ //draw 
						gameid=null //end game
						game=null
						opponent=null
						scoree = 0
						setTimeout(function(){
							alert('You have a draw') //alert result to player 
							displayRecord();
							document.getElementById('private').style.display = 'block';
							document.getElementById('game_interface').style.display = 'none';
						},1000)
					}
				}
			},
			error: function(){console.log('error');},  //error if no action 
		})
	}
	setTimeout(updatefunction,1000) //function only executed after 1s
}

// declare a function for dealing with quiting games
function quitgame(){ //quitting games 
		if(game!=null&&Object.keys(game).length==15){ //game started & second player present
			alert('You lose with a score of 1')  //alert result to player
			fetch('/quitgame',{
				method:'POST',
				headers:{'Content-Type':'application/json'},
				body:JSON.stringify({gameid:gameid,username:username,winner:opponent})
			})
			.catch(err => { //respond to error
                console.log(err);
                alert('Error processing Quit Request')
            })
			displayRecord();
		}else{
			fetch('/waitquit',{ //without second player - game will be terminated without result
				method:'POST',
				headers:{'Content-Type':'application/json'},
				body:JSON.stringify({gameid:gameid})
			})
			.catch(err => { //respond to error
                console.log(err, 'game cannot be quitted');
            })
		}
	document.getElementById('private').style.display = 'block'; //display menu and remove board 
	document.getElementById('game_interface').style.display = 'none';
	gameid=null //end game
	game=null
	opponent=null
	scoree = 0
}

function start() { //when player clicks 'start new game'
    $('#waitstatus').text("Waiting a player to join your game..."); //display game status 
    $('#showopscore').text(' ');
    $('#showscore').text(username + '(me): ' + "Score 0");
    $('.grid-container').empty(); //display custom grid based on width and height
    $('.grid-container').removeAttr("style")
    width = document.getElementById('grid-width').value
    width = parseInt(width)
    height = document.getElementById('grid-height').value
    height = parseInt(height)
        //dimensions defined in global var 'cssobject' 
    customGrid(width, height)
    fetch('/startnewgame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, width: width, height: height })
        })
        .then(response => response.json())
        .then(data => {
            gameid = data.gameid
        })
        .catch(err => { //respond to errors 
            console.log(err);
            alert('ERROR: Failed to define game board')
        })
    document.getElementById('private').style.display = 'none';
    document.getElementById('game_interface').style.display = 'block';
    updatefunction(); //displaying players' turns and scores 
}

//declare a function for joining a game
//here we can also get the game id of the joiner
function joindoublegame(id) { //function executed onclick 'Join' button
    $('#waitstatus').text("It's not your turn now. Please wait..."); //user who started game begins
    $('#showopscore').text(' ');
    $('#showscore').text(username + '(me): ' + "Score 0"); //display of score
    $('.grid-container').removeAttr("style")
    $('.grid-container').empty()
    gameid = id
    fetch('/joingame', { //update game info on joined player 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, gameid: gameid })
        })
        .then(res => res.json())
        .then(data => { //display custom grid selected by user1
            width = data.width;
            height = data.height
            customGrid(width, height)
        })
        .catch(err => { //respond to errors 
            console.log(err);
            alert('ERROR in joining the game!')
        })
    document.getElementById('private').style.display = 'none';
    document.getElementById('game_interface').style.display = 'block';
    updatefunction(); //display players' turn and scores
}

function customGrid(width, height) { //function to create customGrid 
    for (i = 0; i < height + 1; i++) {
        let conindex = i * 2 + 1 //bar display for odd index 
        let oddconid = 'grid-container' + conindex
        let oddcss = 'oddcss' + width
        $('#' + oddconid).css('display', 'grid')
        $('#' + oddconid).css('grid-template-columns', cssobject[oddcss])
        $('#' + oddconid).css('grid-template-rows', 16)
        for (j = 0; j < width; j++) {
            let barindex = overallbarid[conindex - 1][j]
                //console.log(barindex)
            let bar = $('<div/>', { class: "bar", id: barindex, onClick: "disappear(this.id)" }) //add responsive bar function 
            $('#' + oddconid).append(bar) //append bar to body
        }
    }
    for (i = 1; i < height + 1; i++) {
        let conindex = i * 2
        let evenconid = 'grid-container' + conindex //bar display for even index
        let evencss = 'evencss' + width
        $('#' + evenconid).css('display', 'grid')
        $('#' + evenconid).css('grid-template-columns', cssobject[evencss])
        $('#' + evenconid).css('grid-template-rows', 60)
        for (j = 0; j < width + 1; j++) {
            let barindex = overallbarid[conindex - 1][j * 2]
            let bar = $('<div/>', { class: "bar", id: barindex, onClick: "disappear(this.id)" })
            $('#' + evenconid).append(bar) //append bar to body 
            if (j * 2 + 1 < width * 2 + 1) {
                let gemindex = overallbarid[conindex - 1][j * 2 + 1]
                let img = $('<img/>', { class: 'image', id: "image" + gemindex.slice(3), src: "blueGem.png" }) //add gem
                let p = $('<p/>', { class: 'text', id: 'text' + gemindex.slice(3) }) //create text space
                let gem = $('<div/>', { class: "gem", id: gemindex })
                gem.append(img)
                gem.append(p)
                $('#' + evenconid).append(gem) //append to body
            }
        }
    }
}


//declare an onclick functionc for making alarms and gems disappear
function disappear(barid){
		if(game!=null&&Object.keys(game).length==15&&game.turn==username){ //active game 
			let gamee = game
			let gameidd = gameid
			let opponentt = opponent
			document.getElementById(barid).style.backgroundColor= "white"  //hide bar based on id 
			gamee.clicklist.push(barid) //add bar to clicked-bar list
			fetch('/click',{   //update click list on server
				method:'POST',
				headers:{'Content-Type': 'application/json'},
				body:JSON.stringify({id:barid,gameid:gameidd})
				})
				.catch(err => { //respond to errors 
					console.log(err);
					alert('Error - clicked bar has not been detected!')
				})
			let check = 'zero'
			for(i=1;i<26;i++){
					let usearray = gamee.scorearray[i-1]
					if(usearray!=gamee.user1&&usearray!=gamee.user2){ //non-collected alarms
						let one = gamee.clicklist.indexOf(usearray[0]) //array represents alarm 
						let two = gamee.clicklist.indexOf(usearray[1])
						let three = gamee.clicklist.indexOf(usearray[2])
						let four = gamee.clicklist.indexOf(usearray[3])
						if(one!=-1&&two!=-1&&three!=-1&&four!=-1){ //if all 4 alarms have been clicked 
							check = 'one'  //no change turn occurs when check = one
							document.getElementById("image"+i).style.display="none" //if all 4 bars have been clicked 
							document.getElementById('text'+i).innerHTML=username
							scoree = scoree + 1
							gamee[username]=scoree
							document.getElementById("showscore").innerHTML= username + "(me): " + "Score "+scoree
							fetch("/postscorearray",{  //update score on server
								method:'POST',
								headers:{'Content-Type': 'application/json'},
								body:JSON.stringify({id:i-1,gameid:gameidd,score:scoree,username:username})
									})
								.catch(err => {
									console.log(err);
									document.getElementById('showscore').innerHTML = 'Error: Failed to update score'
								})
						}
					}
			}
			//Define winner
			let winner
			if(gamee.clicklist.length==width*(height+1)+height*(width+1)){ //all alarms and gems collected 
				if(gamee[username]>gamee[opponentt]){ //if score is higher than opponent
					gameid=null //end game
					game=null
					opponent=null
					scoree = 0
					setTimeout(function(){
						alert("You win with a score of 1")  //alert result to player 
						fetch('/winner',{  //update winner on server
							method:'POST',
							headers:{'Content-Type':'application/json'},
							body:JSON.stringify({winner:username, loser:opponentt, gameid:gameidd})
							})
							.catch(err => {
								console.log(err);
								alert('Error: Failed to update winner')
							})
						displayRecord();
						document.getElementById('private').style.display = 'block';
						document.getElementById('game_interface').style.display = 'none';
					},1000)
				}else if(gamee[username]<gamee[opponentt]){ //if score is lower than opponent 
					gameid=null  //end game
					game=null
					opponent=null
					scoree = 0
					setTimeout(function(){
						alert("You lose with a score of 1") //alert result to player
						fetch('/winner',{ //update winner on server
							method:'POST',
							headers:{'Content-Type':'application/json'},
							body:JSON.stringify({winner:opponentt,loser:username, gameid:gameidd})
							})
							.catch(err => { //respond to error 
								console.log(err);
								alert('Error: Failed to update winner')
							})
						displayRecord();
						document.getElementById('private').style.display = 'block';
						document.getElementById('game_interface').style.display = 'none';
					},1000)
				}else{ //draw results
					gameid=null //end game
					game=null
					opponent=null
					scoree = 0
					setTimeout(function(){
						alert("You have a draw")
						fetch('/draw',{
							method:'POST',
							headers:{'Content-Type':'application/json'},
							body:JSON.stringify({gameid:gameidd})
							})
							.catch(err => { //respond to error
								console.log(err);
								alert('ERROR: Failed to update draw result')
							})
						displayRecord();
						document.getElementById('private').style.display = 'block';
						document.getElementById('game_interface').style.display = 'none';
					},1000)
				}
			}
			if(check=='zero'&&gamee.clicklist.length!=width*(height+1)+height*(width+1)){
				fetch('/changeturn',{  //change turn if no alarm disabled 
						method:'POST',
						headers:{'Content-Type': 'application/json'},
						body:JSON.stringify({turn:opponentt,gameid:gameidd})
					})
				    .catch(err => { //respond to errors 
						console.log(err);
						alert('ERROR: Failed update')
					})				
			}
		}else{ //alert player when false turn-taking 
			alert("It's not your turn")
		}
}



