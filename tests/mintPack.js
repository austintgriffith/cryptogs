const cryptogs = require("./cryptogs.js")

let animals = [
  "antelope.jpg",
  "buffalo.jpg",
  "bull.jpg",
  "elephant.jpg",
  "fish.jpg",
  "hippo.jpg",
  "killerwhale.jpg",
  "lobster.jpg",
  "mountaingoat.jpg",
  "octopus.jpg",
  "penguin.jpg",
  "rhino.jpg",
  "walrus.jpg",
  "zebra.jpg"
]

let aw90s = [
  "awripsaw.jpg",
  "awrainbowyinyang.jpg",
  "awpoison.jpg",
  "awpurepoison.jpg",
  "awyinandyang.jpg",
  "awskullsstars.jpg",
  "awstussy.jpg",
  "awblackwidow.jpg",
  "awsmile1.jpg",
  "awripsaw.jpg",
  "awrainbowyinyang.jpg",
  "awpoison.jpg",
  "awpurepoison.jpg",
  "awyinandyang.jpg",
  "awskullsstars.jpg",
  "awstussy.jpg",
  "awblackwidow.jpg",
  "awsmile1.jpg",
]

let ad90s = [
  "ad8ball.png",
  "adbiohaz.png",
  "adsmile.png",
  "adyinyang.png",
  "adyinyanggroovy.png",
  "ad8ball.png",
  "adbiohaz.png",
  "adsmile.png",
  "adyinyang.png",
  "adyinyanggroovy.png",
  "ad8ball.png",
  "adbiohaz.png",
  "adsmile.png",
  "adyinyang.png",
  "adyinyanggroovy.png",
]

let space = [
  "space1.png",
  "space2.png",
  "space3.png",
  "space4.png",
  "space5.png",
  "space6.png",
  "space7.png",
  "space8.png",
  "space1.png",
  "space2.png",
  "space3.png",
  "space4.png",
  "space5.png",
  "space6.png",
  "space7.png",
  "space8.png",
]

let retro = [
  "retro1.png",
  "retro2.png",
  "retro3.png",
  "retro4.png",
  "retro5.png",
  "retro6.png",
  "retro7.png",
  "retro1.png",
  "retro2.png",
  "retro3.png",
  "retro4.png",
  "retro5.png",
  "retro6.png",
  "retro7.png",
]


function grabRandomTen(arr){
  let newArr = []
  var tempArray = arr.slice();
  while(newArr.length<10){
    let piece = tempArray.splice(Math.floor(Math.random()*tempArray.length), 1)
    newArr.push(piece[0]);
  }
  return newArr;
}

//cryptogs.mintPack(0,grabRandomTen(retro),0.005)

//cryptogs.mintPack(0,grabRandomTen(space),0.005)

//cryptogs.mintPack(0,grabRandomTen(animals),0.025)


cryptogs.mintPack(0,grabRandomTen(aw90s),0.003)
cryptogs.mintPack(0,grabRandomTen(aw90s),0.004)
cryptogs.mintPack(0,grabRandomTen(aw90s),0.004)

/*
cryptogs.mintPack(0,[
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "ethereumlogo.png",
  "unicorn.png",
  "dragon.png",
],0.025)
*/
