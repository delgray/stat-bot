/*
  Author: Del Gray
  Version: 2.0
  Last Date Updated: 12/11/17
  
  Stats bot for Model Hogwarts
*/

const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require("sqlite");
var schedule = require('node-schedule');
const talkedRecently = new Set();

sql.open("./stats.sqlite");

var res = '';
var train_limit= 2;
var maxCap = 90;
var dice = 0;
var rollResult = '';
var dodgeRes = 0;
var willRes = 0;
//variables to calculate special roles outputs
var vitSpec = 0;
var wisSpec = 0;
var finSpec = 0;
var socSpec = 0;
var sum = 0;


client.on('ready', () => {
  console.log('Stat Bot is ready!');
    
});

var j = schedule.scheduleJob('00 00 05 * * 05', function(){
	console.log("Database training reset at " + new Date())
	sql.run("UPDATE train SET trained = " + 0);
});

var w = schedule.scheduleJob('00 00 05 * * *', function(){
	console.log("Database luck modifier reset at " + new Date())
	sql.run("UPDATE stats SET luck = " + 0);
});
	
	
client.on("message", message => {
  if (message.author.bot)
	  return;
  if (message.channel.type !== "text") 
	  return;
  if(talkedRecently.has(message.author.id))
  {
	 // message.reply("Nice try. Stop spamming.");
	  return;
  }
 

 /**
 A - Assisted: Increase hitdie +2
 B - Burdened: -1 to total roll
 **/
//if(message.channel.id === '327510267137097728')
//{
  if(message.content.toUpperCase() === "S!HELP")
  {
	  message.reply("These are the commands you can use with the stat bot:\n**s!help:** Displays commands that can be used with this bot."
	  +"\n**s!roll** <stat> <A|B|L>: Allows user to roll for a certain stat. *Ex: s!roll wisdom L*."
	  +"\n**s!train** <stat>: Allows user to train a certain stat. Can only be used once a day."
	  +"\n**s!dodge** <A|B|L>: Roll to dodge, which is vitality + finesse. *Ex: s!dodge BA*."
	  +"\n**s!willpower** <A|B|L>: Roll for willpower, which is wisdom + social. *Ex: s!willpower ABL*."
	  +"\n**s!stats:** Shows you all of your stats."
	  +"\n**s!verify:** Lets you know if you have already trained today or not."
	  +"\n**s!modify** <userID> <stat> <value>: Used to modify an user's stat value. **Admin only!**"
	  +"\n**s!restore** <userID>: Used to restore an user's training. **Admin only!**"
	  +"\n**s!restoreall:** Restore every user's training. **Admin only!**"	  
	  +"\n**s!restoreluck** <userID>: Restore a user's luck modifier. Leave out userID to restore every user's luck. **Admin only!**"
	  +"\n**s!stats** <userID>: See another user's stats. **Admin only!**"
	  +"\n**s!verify** <userID>: See if user has trained today. **Admin only!**");
  } 
 else if(message.content.toUpperCase() === "!BOTCHECK")
{
	message.channel.send("I'm heeeere, leave me aloooooooone...");
} 

  
  var contents = message.content.trim().split(" ");
   //This is to display user's stats
  if(contents[0].toUpperCase() === "S!STATS")
  {
	  var userID = contents[1];
	  
	  if(userID != undefined)
	 {
	  if(message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Grimoire"))
	  {
		  
			  //user USER ID to receive user's stats.
			  sql.get('SELECT * FROM stats WHERE userId = ' + userID).then(row => {
			  if(!row)
			  {
				  message.reply("Sorry, that user does not exist");
			  }
			  else
			  {
			    message.reply("Information has been DM'd to you.");
				message.author.send("Selected user's stats are the following:\n**Vitality:** Current modifier is **+" + row.vitality + "** with a **" + row.vit_train +"/2** toward the next bonus.\n"
				+"**Finesse:** Current modifier is **+" + row.finesse + "** with a **" + row.fin_train+"/2** toward the next bonus.\n"
				+"**Wisdom:** Current modifier is **+" + row.wisdom + "** with a **" + row.wis_train +"/2** toward the next bonus.\n"
				+"**Social:** Current modifier is **+" +row.social+ "** with a **" + row.soc_train +"/2** toward the next bonus.\n");
			  }
				  
			  });
			  
		  }
	  }
	  //verify users have necessary roles before proceeding
	  else
	  {
	  if(checkRoles())
	  {
		  sql.get('SELECT * FROM stats WHERE userId = ' + message.author.id).then(row => {
		 if(!row)
		 {
			 sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.author.id, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
			 sql.run("INSERT INTO train (userId, timestamp, trained) VALUES (?, ?, ?)", [message.author.id, 0, 0]);	
			 sql.get("SELECT * FROM stats WHERE userId =" + message.author.id).then(row2 => {  
				
				    message.reply("Information has been DM'd to you.");
					message.author.send("Your stats are the following:\n**Vitality:** Current modifier is **+" + row2.vitality + "** with a **" + row2.vit_train +"/2** toward the next bonus.\n"
					+"**Finesse:** Current modifier is **+" + row2.finesse + "** with a **" + row2.fin_train+"/2** toward the next bonus.\n"
					+"**Wisdom:** Current modifier is **+" + row2.wisdom + "** with a **" + row2.wis_train +"/2** toward the next bonus.\n"
				    +"**Social:** Current modifier is **+" +row2.social+ "** with a **" + row2.soc_train +"/2** toward the next bonus.\n");
				  
				});
				
		 }
		 else
		 {		
			message.reply("Information has been DM'd to you.");
		    message.author.send("Your stats are the following:\n**Vitality:** Current modifier is **+" + row.vitality + "** with a **" + row.vit_train +"/2** toward the next bonus.\n"
			+"**Finesse:** Current modifier is **+" + row.finesse + "** with a **" + row.fin_train+"/2** toward the next bonus.\n"
			+"**Wisdom:** Current modifier is **+" + row.wisdom + "** with a **" + row.wis_train +"/2** toward the next bonus.\n"
			+"**Social:** Current modifier is **+" +row.social+ "** with a **" + row.soc_train +"/2** toward the next bonus.\n");
		 }
	  
		 }).catch(() => {
			console.error;
			sql.run("CREATE TABLE IF NOT EXISTS stats (userId TEXT, vitality INTEGER, vit_train INTEGER, finesse INTEGER, fin_train INTEGER, wisdom INTEGER, wis_train INTEGER, social INTEGER, soc_train INTEGER, luck INTEGER)").then(() => {
			  sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.author.id, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
			});
		 });	
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  }
	  }
  }
  else if(contents[0].toUpperCase() === "S!DODGE")
  {
	  if(checkRoles())
	  {
		  var mod = contents[1];
		  var base = 0;
		  var result = 0;
		  var modRes = 0;
		  var modDice = 0;
		  var modLuck = false;
		  var luckMod = 0;
		  
		  diceSize(returnRole());
		  checkPos() //verify if user has any Positive Effects due to Potions. These don't stack.
		  checkNeg() //verify if user has any Negative Effects due to Potions. These stack.
		  
			  //verify if modifier A B or L is being used.
			  if(mod != undefined)
			  {
				  mod = mod.toUpperCase();
				  if(mod.includes('A'))
				  {
					  modDice = 2;
				  }
				  if(mod.includes('B'))
				  {
					  modRes = 1;
				  }
				  if(mod.includes('L'))
				  {
					  modLuck = true;
				  }
		      }	
			
				   sql.get('SELECT * FROM stats WHERE userId =' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							dodgeRes = row.vitality + row.finesse;
							
							if(dodgeRes >= returnRole())
								dodgeRes = returnRole();
							
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(dodgeRes === 0)
									luckMod = 1;
								else
									luckMod = dodgeRes;
								
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + dodgeRes - modRes + luckMod;	
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(vitSpec != 0 || finSpec != 0)
										{
											sum = vitSpec + finSpec;
											result+= sum;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " + " + sum + " - " +modRes  +" + " + luckMod +"**";
										}
										else
										{
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " - " +modRes +" + " + luckMod +"**"; 
										}
										
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(vitSpec != 0 || finSpec != 0)
									{
										sum = vitSpec + finSpec;
										result += sum;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " + " + sum + " - " +modRes +"**";
									}
									else
									{
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " - " +modRes +"**"; 
									}
										
								}
								else
								{
									if(luckMod != 0)
									{
										if(vitSpec != 0 || finSpec != 0)
										{
											sum = vitSpec + finSpec;
											result+= sum;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " + " + sum  + " + " + luckMod + "**";
										}
										else
										{
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " + " + luckMod + "**"; 
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(vitSpec != 0 || finSpec != 0)
									{
										sum = vitSpec + finSpec;
										result+= sum;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + " + " + sum + "**";
									}
									else
									{
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + dodgeRes + "**";
									}
								}
								setTimeout(delayTime, 200);
							}
						}).catch(() => {
							console.error;
							message.reply("There was an error processing your modifiers for the s!dodge command.");
						});
						
						
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  } 
	  setTimeout(setSpecsToZero, 200);
	  //setSpecsToZero(); //reset specs
  }
  else if(contents[0].toUpperCase() === "S!WILLPOWER")
  {
	   if(checkRoles())
	  {
		  var mod = contents[1];
		  var base = 0;
		  var result = 0;
		  var modRes = 0;
		  var modDice = 0;
		  var modLuck = false;
		  var luckMod = 0;
		  
		  diceSize(returnRole());
		  checkPos() //verify if user has any Positive Effects due to Potions. These don't stack.
		  checkNeg() //verify if user has any Negative Effects due to Potions. These stack.
			  if(mod != undefined)
			  {
				  mod = mod.toUpperCase();
				  if(mod.includes('A'))
				  {
					  modDice = 2;
				  }
				  if(mod.includes('B'))
				  {
					  modRes = 1;
				  }
				  if(mod.includes('L'))
				  {
					  modLuck = true;
				  }
		      }
				   sql.get('SELECT * FROM stats WHERE userId =' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							willRes = row.wisdom + row.social;
							if(willRes >= returnRole())
								willRes = returnRole();
							
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(willRes === 0)
									luckMod =1;
								else
									luckMod = willRes;
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + willRes - modRes + luckMod;
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(socSpec != 0 || wisSpec != 0)
										{
											sum = socSpec + wisSpec;
											result+= sum;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " + " + sum + " - " +modRes +" + " + luckMod+ "**";
										}
										else
										{
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " - " +modRes +" + " + luckMod+ "**";
										}
										
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(socSpec != 0 || wisSpec != 0)
									{
										sum = socSpec + wisSpec;
										result+= sum;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " + " + sum + " - " +modRes +"**";
									}
									else
									{
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " - " +modRes +"**";
									}									
								}
								else
								{
									if(luckMod != 0)
									{
										if(socSpec != 0 || wisSpec != 0)
										{
											sum = socSpec + wisSpec;
											result+= sum;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " + " + sum + " + " + luckMod +"**";
										}
										else
										{
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " + " + luckMod + "**";
										}										
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(socSpec != 0 || wisSpec != 0)
									{
										sum = socSpec + wisSpec;
										result+= sum;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + " + " + sum + "**";
									}
									else
									{
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + willRes + "**"; 
									}
								}
								setTimeout(delayTime, 200);
							}
						});
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  }
	  
	  setTimeout(setSpecsToZero, 200);
  }
  else if(contents[0].toUpperCase() === "S!ROLL")
  {
	  if(checkRoles())
	  {
		  var stat = contents[1];
		  var mod = contents[2];
		  var base = 0;
		  var result = 0;
		  var modRes = 0;
		  var modDice = 0;
		  var modLuck = false;
		  var luckMod = 0;
		  
		  diceSize(returnRole());
		  checkPos() //verify if user has any Positive Effects due to Potions. These don't stack.
		  checkNeg() //verify if user has any Negative Effects due to Potions. These stack.
		  
		  if(stat === undefined)
		  {
			  message.reply("You must specify a stat to roll.")
		  }
		  else
		  {
			  if(mod != undefined)
			  {
				  mod = mod.toUpperCase();
				  if(mod.includes('A'))
				  {
					  modDice = 2;
				  }
				  if(mod.includes('B'))
				  {
					  modRes = 1;
				  }
				  if(mod.includes('L'))
				  {
					  modLuck = true;
				  }
		      }
			  if(stat.toUpperCase() === "VITALITY")
			  {
				   sql.get('SELECT * FROM stats WHERE userId = ' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							
							//message.reply("You rolled: **" + result + "**\n"
							//+"1d" +dice+ " → **["+base+"] + " +row.vitality +"**");
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(row.vitality === 0)
									luckMod = 1;
								else
									luckMod = row.vitality;
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + row.vitality - modRes + luckMod;
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(vitSpec != 0 )
										{
											result+= vitSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.vitality) + " + " + vitSpec  +" - " + modRes + " + " + luckMod +"**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.vitality) +" - " + modRes + " + " + luckMod +"**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(vitSpec != 0 )
									{
										result+= vitSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.vitality) + " + " + vitSpec  +" - " + modRes + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.vitality) +" - " + modRes + "**";
									}
								}
								else
								{
									if(luckMod != 0)
									{
										if(vitSpec != 0 )
										{
											result+= vitSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.vitality) + " + " + vitSpec +" + " + luckMod +"**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.vitality) +" + " + luckMod + "**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(vitSpec != 0 )
									{
										result+= vitSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.vitality) + " + " + vitSpec + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.vitality) +"**";
									}
								}
								setTimeout(delayTime,200);						  
							}
						});
				 	
			  }
			  else if(stat.toUpperCase() === "FINESSE")
			  {
				   sql.get('SELECT * FROM stats WHERE userId = ' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							
							//message.reply("You rolled: **" + result + "**\n"
							//+"1d" +dice+ " → **["+base+"] + " +row.finesse +"**");
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(row.finesse === 0)
									luckMod = 1;
								else
									luckMod = row.finesse;
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + row.finesse - modRes + luckMod;
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(finSpec != 0 )
										{
											result+= finSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.finesse) + " + " + finSpec  +" - " + modRes + " + " + luckMod + "**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.finesse) +" - " + modRes + " + " + luckMod +"**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(finSpec != 0 )
									{
										result+= finSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.finesse) + " + " + finSpec  +" - " + modRes + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.finesse) +" - " + modRes + "**";
									}
								}
								else
								{
									if(luckMod != 0)
									{
										 if(finSpec != 0 )
										{
											result+= finSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.finesse) + " + " + finSpec +" + " + luckMod + "**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.finesse) +" + " + luckMod + "**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
										
									}
									else if(finSpec != 0 )
									{
										result+= finSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.finesse) + " + " + finSpec + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.finesse) +"**";
									}
								}
								setTimeout(delayTime,200);	
							}
						});
			  }
			  else if(stat.toUpperCase() === "WISDOM")
			  {
				   sql.get('SELECT * FROM stats WHERE userId = ' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							
							//message.reply("You rolled: **" + result + "**\n"
							//+"1d" +dice+ " → **["+base+"] + " +row.wisdom +"**");
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(row.wisdom === 0)
									luckMod = 1;
								else
									luckMod = row.wisdom;
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + row.wisdom - modRes + luckMod;
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(wisSpec != 0 )
										{
											result+= wisSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.wisdom) + " + " + wisSpec  +" - " + modRes + " + " + luckMod +"**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.wisdom) +" - " + modRes + " + " + luckMod +"**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(wisSpec != 0 )
									{
										result+= wisSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.wisdom) + " + " + wisSpec  +" - " + modRes + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.wisdom) +" - " + modRes + "**";
									}
								}
								else
								{
									if(luckMod != 0)
									{
										if(wisSpec != 0 )
										{
											result+= wisSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.wisdom) + " + " + wisSpec + " + " + luckMod +"**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.wisdom) +" + " + luckMod + "**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(wisSpec != 0 )
									{
										result+= wisSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.wisdom) + " + " + wisSpec + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.wisdom) +"**";
									}
								}
								setTimeout(delayTime,200);
							}
						 
						});
			  }
			  else if(stat.toUpperCase() === "SOCIAL")
			  {
				   sql.get('SELECT * FROM stats WHERE userId = ' + message.author.id).then(row => {
							base =  Math.floor(Math.random()*dice+modDice)+1;
							
							//message.reply("You rolled: **" + result + "**\n"
							//+"1d" +dice+ " → **["+base+"] + " +row.social +"**");
							if(modLuck && (row.luck === 0 || checkLuck()))
							{
								if(row.social === 0)
									luckMod = 1;
								else
									luckMod = row.social;
							}
							if(modLuck && (row.luck != 0 && !checkLuck()))
							{
								message.reply("You've ran out of luck for today!");
							}
							else
							{
								result = base + row.social - modRes + luckMod;
								if(mod != undefined && mod.includes("B"))
								{
									if(luckMod != 0)
									{
										if(socSpec != 0 )
										{
											result+= socSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.social) + " + " + socSpec  +" - " + modRes + " + " + luckMod +"**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.social) +" - " + modRes + " + " + luckMod +"**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(socSpec != 0 )
									{
										result+= socSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.social) + " + " + socSpec  +" - " + modRes + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.social) +" - " + modRes + "**";
									}
								}
								else
								{
									if(luckMod != 0)
									{
										if(socSpec != 0 )
										{
											result+= socSpec;
											rollResult ="You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.social) + " + " + socSpec + " + " + luckMod + "**";
										}
										else
										{
											rollResult = "You rolled: **" + result + "**\n"
											+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.social) +" + " + luckMod + "**";
										}
										sql.run("UPDATE stats SET luck =" + 1 + " WHERE userId = " +message.author.id);
									}
									else if(socSpec != 0 )
									{
										result+= socSpec;
										rollResult ="You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " + (row.social) + " + " + socSpec + "**";
									}
									else
									{
										rollResult = "You rolled: **" + result + "**\n"
										+"1d" +(dice+modDice)+ " → **["+base+"] + " +(row.social) +"**";
									}
								}
								setTimeout(delayTime,200);
							}
						 
						});
			  }
		  }
		  
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  }
	  
	  setTimeout(setSpecsToZero, 200);
  }
  
  else if(contents[0].toUpperCase() === "S!TRAIN")
  {
	  if(checkRoles())
	  {
		  var stat = contents[1];
		  var max = returnRole(); //obtain the max for role stat.
		  var da = Date.now()
		   
		  if(stat === undefined)
		  {
			  message.reply("You must specify a stat to train.")
		  }
		  else
		  {
			 
			     sql.get('SELECT * FROM train WHERE userId =' + message.author.id).then(row => {
				 if(!row)
				 {
					 sql.run("INSERT INTO train (userId, timestamp, trained) VALUES (?, ?, ?)", [message.author.id, 0, 0]);	
					
				 }			  
				 }).catch(() => {
					console.error;
					sql.run("CREATE TABLE IF NOT EXISTS train (userId TEXT, timestamp INTEGER, trained INTEGER) VALUES (?, ?, ?)", [message.author.id, 0, 0]).then(() => {
					sql.run("INSERT INTO train (userId, timestamp, trained) VALUES (?, ?, ?)", [message.author.id, 0, 0]);
					
					});
					});
					
				 sql.get("SELECT * FROM stats WHERE userId =" + message.author.id).then(row => {
				 if(!row)
				 {
					 sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train, social, soc_train) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.author.id, 0, 0, 0, 0, 0, 0, 0, 0]);
					 	
				 }			  
				 }).catch(() => {
					console.error;
					sql.run("CREATE TABLE IF NOT EXISTS stats (userId TEXT, vitality INTEGER, vit_train INTEGER, finesse INTEGER, fin_train INTEGER, wisdom INTEGER, wis_train INTEGER, social INTEGER, soc_train INTEGER, luck INTEGER)").then(() => {
					sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.author.id, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
					});
				 });
			
			  if(stat.toUpperCase() === "VITALITY")
			  {
				  talkedRecently.add(message.author.id);
				 //  sql.get("SELECT * FROM stats, train, maxStat WHERE train.userId =" + message.author.id + " AND maxStat.Year ='" + returnRole()+ "'").then(row => {
					 sql.get("SELECT * FROM stats, train WHERE train.userId =" + message.author.id + " AND stats.userId =" +message.author.id).then(row => {  
					 if(row)
					 {
							if(row.trained === 0)//row.timestamp - da < 15
							{
								if(row.vitality >= max)
								{
									message.reply("You can't train that stat any further! Try again next year.")
								}
								else if((row.vitality + row.social + row.wisdom + row.finesse) >= maxCap)
								{
									message.reply("You have reached the max total of stat points.");
								}
								else
								{
									if(row.vit_train < (train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET vit_train = " + (row.vit_train+1) + " WHERE userId =" +message.author.id);
									}
									else if(row.vit_train >=(train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET vit_train = " + 0 + ", vitality = " + (row.vitality+1) + " WHERE userId =" + message.author.id);
									}
									
									rollResult = "Great training! Your current vitality stat is **" + row.vitality + "** with **" + (row.vit_train+1) +"/2** toward your next bonus.";
									setTimeout(delayTime,200);
								}
							}
							else
							{
								message.reply("You're too tired to be training!");
							}
					 }
					 else
					 {
						 message.reply("Error processing request. Try s!train <stat> again.");
					 }
						});
				 	
			  }
			  else if(stat.toUpperCase() === "FINESSE")
			  {
				   talkedRecently.add(message.author.id);
				   //sql.get("SELECT * FROM stats, train, maxStat WHERE train.userId =" + message.author.id + " AND maxStat.Year ='" + returnRole()+ "'").then(row => {
				     sql.get("SELECT * FROM stats, train WHERE train.userId =" + message.author.id + " AND stats.userId =" +message.author.id).then(row => {  
					 if(row)
					 {
							if(row.trained === 0)//only allows to train if you haven't trained today
							{
								if(row.finesse >= max)//verify the max stat
								{
									message.reply("You can't train that stat any further! Try again next year.")
								}
								else if((row.vitality + row.social + row.wisdom + row.finesse) >= maxCap)
								{
									message.reply("You have reached the max total of stat points.");
								}
								else
								{
									if(row.fin_train< (train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET fin_train = " + (row.fin_train+1) + " WHERE userId =" + message.author.id);
										
									}
									else if(row.fin_train >=(train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET fin_train = " + 0 + ", finesse = " + (row.finesse+1) + " WHERE userId =" + message.author.id);
										
									}
									rollResult="Great training! Your current finesse stat is **" + row.finesse + "** with **" + (row.fin_train+1) +"/2** toward your next bonus.";
									setTimeout(delayTime,200);
								}
							}
							else
							{
								message.reply("You're too tired to be training!");
							}
					 }
					 else
					 {
						 message.reply("Error processing request. Try s!train <stat> again.");
					 }
						});
			  }
			  else if(stat.toUpperCase() === "WISDOM")
			  {
				   talkedRecently.add(message.author.id);
				  //sql.get("SELECT * FROM stats, train, maxStat WHERE train.userId =" + message.author.id + " AND maxStat.Year ='" + returnRole()+ "'").then(row => {
					 sql.get("SELECT * FROM stats, train WHERE train.userId =" + message.author.id + " AND stats.userId =" +message.author.id).then(row => { 
					 if(row)
					 {
							if(row.trained === 0)
							{
								if(row.wisdom >= max)
								{
									message.reply("You can't train that stat any further! Try again next year.")
								}
								else if((row.vitality + row.social + row.wisdom + row.finesse) >= maxCap)
								{
									message.reply("You have reached the max total of stat points.");
								}
								else
								{
									if(row.wis_train < (train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET wis_train = " + (row.wis_train+1) + " WHERE userId =" +message.author.id);
									}
									else if(row.wis_train >=(train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 +" WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET wis_train = " + 0 + ", wisdom = " + (row.wisdom+1) + " WHERE userId =" + message.author.id);
									}
									rollResult = "Great training! Your current wisdom stat is **" + row.wisdom + "** with **" + (row.wis_train+1) +"/2** toward your next bonus.";
									setTimeout(delayTime,200);
								}
							}
							else
							{
								message.reply("You're too tired to be training!");
							}
					 }
					 else
					 {
						 message.reply("Error processing request. Try s!train <stat> again.");
					 }
						});
			  }
			  else if(stat.toUpperCase() === "SOCIAL")
			  {
				   talkedRecently.add(message.author.id);
				  //sql.get("SELECT * FROM stats, train, maxStat WHERE train.userId =" + message.author.id + " AND maxStat.Year ='" + returnRole()+ "'").then(row => {
					 sql.get("SELECT * FROM stats, train WHERE train.userId =" + message.author.id + " AND stats.userId =" +message.author.id).then(row => {
						if(row)
						{
							if(row.trained === 0)
							{
								if(row.social >= max)
								{
									message.reply("You can't train that stat any further! Try again next year.")
								}
								else if((row.vitality + row.social + row.wisdom + row.finesse) >= maxCap)
								{
									message.reply("You have reached the max total of stat points.");
								}
								else
								{
									if(row.soc_train < (train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 + " WHERE userId =" + message.author.id);
										sql.run("UPDATE stats SET soc_train = " + (row.soc_train+1) + " WHERE userId =" +message.author.id);
									}
									else if(row.soc_train >=(train_limit-1))
									{
										sql.run("UPDATE train SET timestamp = " + da + ", trained = " + 1 + " WHERE userId =" +message.author.id);
										sql.run("UPDATE stats SET soc_train = " + 0 + ", social = " + (row.social+1) + " WHERE userId =" + message.author.id);
									}
									rollResult = "Great training! Your current social stat is **" + row.social + "** with **" + (row.soc_train+1) +"/2** toward your next bonus.";
									setTimeout(delayTime,200);
								}
							}
							else
							{
								message.reply("You're too tired to be training!");
							}
						}
					else
					 {
						 message.reply("Error processing request. Try s!train <stat> again.");
					 }
						});
			  }
			  
			  setTimeout(() => {
				// Removes the user from the set after 3 seconds
				talkedRecently.delete(message.author.id);
				}, 3000);
		  }
		  
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  }
  }
  else if(contents[0].toUpperCase() === "S!MODIFY")
  {
	  if(message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Grimoire"))
	  {
		  var userID = contents[1];
		  var stat = contents[2];
		  var value = contents[3];
		 
		  if(stat === undefined || value === undefined || userID === undefined)
		  {
			  message.reply("You must enter a valid user ID, a stat and a value to modify that user's stat.")
		  }
		  else if(value/1 === undefined)
		  {
			  message.reply("Please enter a number for value.");
		  }
		  else if(value > 30 || (value % 1 != 0))
		  {
			  message.reply("The numeric value has to be less or equal to 30 and cannot be a decimal.");
		  }
		  else
		  {
			  sql.get('SELECT * FROM stats WHERE userId =' + userID).then(row => {
				 if(!row)
				 {
					sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userID, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
					sql.run("UPDATE stats SET "+ stat.toLowerCase() + " = " + value +" WHERE userId =" + userID);
					message.reply("User's stat updated!");
				 }
				 else
				 {
					sql.run("UPDATE stats SET "+ stat.toLowerCase() + " = " + value +" WHERE userId =" + userID);
					message.reply("User's stat updated!");
				 }
			  
				 }).catch(() => {
					console.error;
					sql.run("CREATE TABLE IF NOT EXISTS stats (userId TEXT, vitality INTEGER, vit_train INTEGER, finesse INTEGER, fin_train INTEGER, wisdom INTEGER, wis_train INTEGER, social INTEGER, soc_train INTEGER, luck INTEGER)").then(() => {
					  sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userID, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
					  
					});
				 });
		  }
		  
	  }
	  else
	  {
		  message.reply("You are not allowed to do that!");
	  }
  }
  //restore a user's training
  else if(contents[0].toUpperCase() === "S!RESTORE")
  {
	  if(message.member.roles.find("name", "Admin"))
	  {
		  var userID = contents[1];
		 
		  if(userID === undefined)
		  {
			  message.reply("You must enter a valid user ID.")
		  }
		  else
		  {
			  sql.get('SELECT * FROM train WHERE userId =' + userID).then(row => {
				 if(!row)
				 {
					 message.reply("That user does not exist.");
						
				 }
				 else
				 {
					sql.run("UPDATE train SET trained =" + 0 +" WHERE userId =" + userID);
					message.reply("Training restored!");
				 }
			  
				 }).catch(() => {
					console.error;
					sql.run("CREATE TABLE IF NOT EXISTS train (userId TEXT, timestamp INTEGER, trained INTEGER)").then(() => {
					sql.run("INSERT INTO train (userId, timestamp, trained) VALUES (?, ?, ?)", [userID, 0, 0]);
					
					});
					});
		  }
		  
	  }
	  else
	  {
		  message.reply("You are not an Admin!");
	  }
  }
  else if(contents[0].toUpperCase() === "S!VERIFY")
  {
	var userID = contents[1];
	
	 if(userID != undefined)
	{
	  if(message.guild.roles.find("name", "Admin"))
	  {
		 
			  //user USER ID to receive user's stats.
			  sql.get('SELECT * FROM train WHERE userId = ' + userID).then(row => {
			  if(!row)
			  {
				  message.reply("Sorry, that user does not exist");
			  }
			  else
			  {
			     if(row.trained === 0)
				 {
					message.reply("User hasn't trained today!");
				 }
				 else if(row.trained === 1)
				 {
					message.reply("User has already trained today!");
				 }
			  }
				  
			  });
			  
		  }
	  }
	  else
	  {
	  if(checkRoles())
	  {
	
			  sql.get('SELECT * FROM train WHERE userId = ' + message.author.id).then(row => {
			  if(!row)
			  {
				  message.reply("Sorry, that user does not exist");
			  }
			  else
			  {
				
			     if(row.trained === 0)
				 {
					message.reply("You haven't trained today!");
				 }
				 else if(row.trained === 1)
				 {
					message.reply("You have already trained today!");
				 }
			  }
				  
			  })
	  }
	  else
	  {
		  message.reply("You are not powerful enough to do that!");
	  }
	  }
  }
  //restore every users' training
   else if(contents[0].toUpperCase() === "S!RESTOREALL")
  {
	  if(message.member.roles.find("name", "Admin"))
	  {
		  sql.run("UPDATE train SET trained =" + 0);
		  message.reply("Training restored for all users!");
	  }
	  else
	  {
		  message.reply("You are not an Admin!");
	  }
  }
  //restore a user's luck modifier
  else if(contents[0].toUpperCase() === "S!RESTORELUCK")
  {
	   if(message.member.roles.find("name", "Admin"))
	  {
		  var userID = contents[1];
		 
		  if(userID === undefined)
		  {
			  sql.run("UPDATE stats SET luck =" +0);
			  message.reply("Luck restored for all users!")
		  }
		  else
		  {
			  sql.get('SELECT * FROM stats WHERE userId =' + userID).then(row => {
				 if(!row)
				 {
					 message.reply("That user does not exist.");
						
				 }
				 else
				 {
					sql.run("UPDATE stats SET luck =" + 0 +" WHERE userId =" + userID);
					message.reply("Luck restored!");
				 }
			  
				 }).catch(() => {
					console.error;
					sql.run("CREATE TABLE IF NOT EXISTS stats (userId TEXT, vitality INTEGER, vit_train INTEGER, finesse INTEGER, fin_train INTEGER, wisdom INTEGER, wis_train INTEGER, social INTEGER, soc_train INTEGER, luck INTEGER)").then(() => {
					  sql.run("INSERT INTO stats (userId, vitality, vit_train, finesse, fin_train, wisdom, wis_train,  social, soc_train, luck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userID, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
					  
					});
				 });
		  }
		  
	  }
  }
 function diceSize(yearDice)
 {
	 if(yearDice === 2)
		 dice = 2;
	 else if(yearDice === 4)
		 dice = 4;
	 else if(yearDice === 7)
		 dice = 6;
	 else if(yearDice === 10)
		 dice = 8;
	  else if(yearDice === 13)
		 dice = 10;
	  else if(yearDice === 16)
		 dice = 12;
	  else if(yearDice === 19)
		 dice = 14;
	  else if(yearDice === 22)
		 dice = 16;
	  else if(yearDice === 25 || yearDice === 26 || yearDice === 27)
		 dice = 18;
	 else if(yearDice === 30)
		 dice = 20;
	 else if(yearDice === 1)
		 dice = 1;
 }
 
 function checkRoles()
 {
	if(message.member.roles.find("name","First Years") || message.member.roles.find("name","Second Years") 
		|| message.member.roles.find("name","Third Years") || message.member.roles.find("name","Fourth Years") ||message.member.roles.find("name","Fifth Years")
		|| message.member.roles.find("name","Sixth Years") || message.member.roles.find("name","Seventh Years") || message.member.roles.find("name","GradA")
		|| message.member.roles.find("name","GradB") || message.member.roles.find("name","GradC") || message.member.roles.find("name","Professor") 
		|| message.member.roles.find("name","Summer Camp") || message.member.roles.find("name","I Got My Letter!") )
		return true; 
	else
		return false;
 }
 function checkLuck()
 {
	 if(message.member.roles.find("name","Felix Felicis"))
		 return true;
	 else
		 return false;
 }
 function checkPos()
 {
	 if(message.member.roles.find("name", "Rano Potion"))
	 {
		 wisSpec = 1;
		 finSpec = 1;
	 }
	 else if(message.member.roles.find("name", "Insight Potion"))
	 {
		 wisSpec = 4;
		 socSpec = 4;
	 }
	 else if(message.member.roles.find("name", "Invigoration Draught"))
	 {
		 finSpec = 3;
		 vitSpec = 3;
	 }
	 else if(message.member.roles.find("name", "Draught of Wrath"))
	 {
		 vitSpec = 4;
	 }
	 else if(message.member.roles.find("name", "Essence of Insanity"))
	 {
		 vitSpec = 5;
		 finSpec = 2;
	 }
	 else if(message.member.roles.find("name", "Euphoria Elixir"))
	 {
		 finSpec = 5;
		 vitSpec = 4;
	 }
 }
 function checkNeg()
 {
	 if(message.member.roles.find("name", "Weakness Potion"))
	 {
		 vitSpec -= 2;
	 }
	 if(message.member.roles.find("name", "Blinding Poison"))
	 {
		 finSpec -= 3;
	 }
	 if(message.member.roles.find("name", "Sadness Draught"))
	 {
		 finSpec -= 2;
		 vitSpec -= 2;
		 socSpec -= 2;
		 wisSpec -= 2;
	 }
	 if(message.member.roles.find("name", "Draught of Wrath"))
	 {
		 wisSpec -= 4;
	 }
	 if(message.member.roles.find("name", "Essence of Insanity"))
	 {
		 wisSpec -= 4;
		 socSpec -= 4;
	 }
	 if(message.member.roles.find("name", "Drink of Despair"))
	 {
		 finSpec -= 4;
		 vitSpec -= 4;
		 socSpec -= 4;
		 wisSpec -= 4;
	 }
 }
 function setSpecsToZero()
 {
	 vitSpec = 0;
	 finSpec = 0;
	 wisSpec = 0;
	 socSpec = 0;
 }
 function returnRole()
 {
	 if( message.member.roles.find("name","First Years"))
	 {
		return 4;
	 }
     else if(message.member.roles.find("name","Second Years"))
	 {
		 return 7;
	 }
	 else if(message.member.roles.find("name","Third Years"))
	 {
		return 10;
	 }
	 else if(message.member.roles.find("name","Fourth Years"))
	 {
		 return 13;
	 }
	 else if(message.member.roles.find("name","Fifth Years"))
	 {
		 return 16;
	 }
	 else if(message.member.roles.find("name","Sixth Years"))
	 {
		return 19;
	 }
	 else if(message.member.roles.find("name","Seventh Years"))
	 {
		return 22;
	 }
	 else if(message.member.roles.find("name","GradA"))
	 {
		 return 25;
	 }
	 else if(message.member.roles.find("name","GradB"))
	 {
		return 26;
	 }
	 else if(message.member.roles.find("name","GradC"))
	 {
		 return 27;
	 }
	 else if(message.member.roles.find("name","Professor"))
	 {
		 return 30;
	 }
	 else if(message.member.roles.find("name","Summer Camp"))
	 {
		return 2;
	 }
	 else if(message.member.roles.find("name","I Got My Letter!"))
	 {
		 return 1;
	 }
 }
 
 function delayTime()
 {
	 message.reply(rollResult);
 }
 function delayConsole()
 {
	 console.log("Building database entry for user");
 }
 
 //}
 //help message
 client.user.setActivity("Type s!help for help!");
 
});
client.on('error', err => console.error('Uncaught Promise Rejection: \n${err.stack}'));
//Test Bot
client.login('token_here');
