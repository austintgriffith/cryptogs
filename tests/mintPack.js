const cryptogs = require("./cryptogs.js")

let animals = [
  "agantelope.jpg",
  "agbuffalo.jpg",
  "agbull.jpg",
  "agelephant.jpg",
  "agfish.jpg",
  "aghippo.jpg",
  "agkillerwhale.jpg",
  "aglobster.jpg",
  "agmountaingoat.jpg",
  "agoctopus.jpg",
  "agpenguin.jpg",
  "agrhino.jpg",
  "agwalrus.jpg",
  "agzebra.jpg"
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

let adgeo = [
  "adbluegeo.png",
  "adbluetree.png",
  "addarkmountain.png",
  "adgreengeo.png",
  "adgreentree.png",
  "adlightmountain.png",
  "adorangegeo.png",
  "adbluegeo.png",
  "adbluetree.png",
  "addarkmountain.png",
  "adgreengeo.png",
  "adgreentree.png",
  "adlightmountain.png",
  "adorangegeo.png",
]

let cryptoLogos = [
  "metamask.png",
  "darkclogo.png",
  "lightclogo.png",
  "darkclogo.png",
  "lightclogo.png",
  "cipher.jpg",
  "trust.png",
  "toshi.jpg",
  "opensea.jpg",
  "darkclogo.png",
  "metamask.png",
  "darkclogo.png",
  "lightclogo.png",
  "darkclogo.png",
  "lightclogo.png",
  "cipher.jpg",
  "trust.png",
  "toshi.jpg",
  "opensea.jpg",
  "darkclogo.png",
]

let ethDen = [
  "ethdenver.png",
  "ethden.png",
  "bufficorn.jpg",
  "ethden.png",
  "ethdenver.png",
  "ethdenver.png",
  "ethden.png",
  "bufficorn.jpg",
  "ethden.png",
  "ethdenver.png",
  "ethdenver.png",
  "ethden.png",
  "bufficorn.jpg",
  "ethden.png",
  "ethdenver.png",
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


 // cryptogs.mintPack(0,grabRandomTen(ad90s),0.001)
 //cryptogs.mintPack(0,grabRandomTen(ad90s),0.001)
 // cryptogs.mintPack(0,grabRandomTen(ad90s),0.001)


cryptogs.mintPack(0,grabRandomTen(ad90s),0.005)
// cryptogs.mintPack(0,grabRandomTen(adgeo),0.01)

 cryptogs.mintPack(0,grabRandomTen(aw90s),0.006)
 // cryptogs.mintPack(0,grabRandomTen(aw90s),0.006)
//
 // cryptogs.mintPack(0,grabRandomTen(animals),0.025)
 //cryptogs.mintPack(0,grabRandomTen(animals),0.1)

// cryptogs.mintPack(0,grabRandomTen(cryptoLogos),0.025)


// cryptogs.mintPack(0,grabRandomTen(ethDen),0.010)

// cryptogs.mintPack(0,[
//   "metamask.png",
//   "darkclogo.png",
//   "lightclogo.png",
//   "darkclogo.png",
//   "lightclogo.png",
//   "cipher.jpg",
//   "trust.png",
//   "toshi.jpg",
//   "opensea.jpg",
//   "darkclogo.png",
// ],0.001)
