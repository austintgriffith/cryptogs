const cryptogs = require("./cryptogs.js")
/*
animals
aw90s
ad90s
adgeo
cryptoLogos
ethDen
awTwo
awCrypto
awAnimals
default
*/

// cryptogs.dropBatch(0,"awCrypto","0x982572547720705cA05B130D9301E4863bBf843E")
// cryptogs.dropBatch(0,"ethDen","0xDe3b95B47f1F488E26F838E62497EFF4e3F42fD5")

// cryptogs.dropBatch(0,"ad90s","0x0f4bf39b99F4831Dc1ba51a3e79266e29633f054")
// cryptogs.dropBatch(0,"aw90s","")

// cryptogs.dropBatch(0,[
//   "peepeth.png",
//   "peepeth.png",
//   "peepeth.png",
//   "peepeth.png",
//   "peepeth.png"
// ],"0x2aeb4bcdbd41cb64447b75a9550b9bdf9e9a824d")


//
// cryptogs.dropBatch(0,[
//   "darkclogo.png",
//   "lightclogo.png",
//   "ethereumlogo.png",
//   "darkclogo.png",
//   "lightclogo.png",
// ],"0x4E21563f675aBff094872697d3b8A7f2143C6186")

//
//
// cryptogs.dropBatch(0,[
//   "trust.png",
//   "trust.png",
//   "trust.png",
//   "trust.png",
//   "trust.png",
// ],"0xe47494379c1d48ee73454c251a6395fdd4f9eb43")

/*

awbwskull.jpg
awcrypto1.jpg
awcrypto2.jpg
awcrypto3.jpg
awcrypto4.jpg
awcrypto5.jpg
awcrypto6.jpg
awcryptogs.jpg
awelephant.jpg
awgiraffe.jpg
awredblackskull.jpg
awrhino.jpg
awtog.jpg
awweb.jpg
bufficorn.jpg
metamask.png
cipher.jpg
darkclogo.png
lightclogo.png
trust.png
toshi.jpg
80shades.png
antelope.jpg
buffalo.jpg
buffalo.png
bull.jpg
bull.png
dragon.png
elephant.jpg
elephant.png
ethereumlogo.png
fish.jpg
fish.png
genesiscryptog.png
hippo.jpg
hippo.png
killerwhale.jpg
lobster.jpg
lobster.png
moose.jpg
mountaingoat.jpg
mountaingoat.png
mushrooms.png
octopus.jpg
octopus.png
penguin.jpg
penguin.png
rhino.jpg
rhino.png
skullblack.png
unicorn.png
walrus.jpg
walrus.png
zebra.jpg
zebra.png
jbdoge.png
opensea.jpg
ethdenver.png
ethden.png
adbluegeo.png
adbluetree.png
addarkmountain.png
adgreengeo.png
adgreentree.png
adlightmountain.png
adorangegeo.png
adyinyang.png
jonathangorczyca.jpg
austingriffith.jpg
karenscarbrough.jpg
patrickmackay.jpg
awstussy.jpg
awblackwidow.jpg
awsmile1.jpg
ad8ball.png
adbiohaz.png
adsmile.png
adyinyanggroovy.png
awripsaw.jpg
awrainbowyinyang.jpg
awpoison.jpg
awpurepoison.jpg
awyinandyang.jpg
awskullsstars.jpg
agfish.jpg
agantelope.jpg
agmoose.jpg
agkillerwhale.jpg
agoctopus.jpg
agmountaingoat.jpg
aglobster.jpg
aghippo.jpg
agelephant.jpg
agbuffalo.jpg
agbull.jpg
agpenguin.jpg
agrhino.jpg
agwalrus.jpg
agzebra.jpg
agoctopus.png
ethslammer.png
agethereumlogo.png
aggenesiscryptog.png
agdragon.png
agunicorn.png

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
 */


/*
 cryptogs.mint(0,"aggenesiscryptog.png",1)
 cryptogs.mint(0,"agethereumlogo.png",1)
 cryptogs.mint(0,"agethereumlogo.png",1)
 cryptogs.mint(0,"agethereumlogo.png",1)
 cryptogs.mint(0,"agethereumlogo.png",1)

 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)

 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
 cryptogs.mint(0,"agethereumlogo.png",2)
*/
/*
 cryptogs.airdrop(0,"aggenesiscryptog.png","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
 cryptogs.airdrop(0,"agdragon.png","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
 cryptogs.airdrop(0,"agunicorn.png","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
 cryptogs.airdrop(0,"agfish.png","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
 cryptogs.airdrop(0,"agethereumlogo.png","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
 cryptogs.airdrop(0,"aggenesiscryptog.png","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
 cryptogs.airdrop(0,"agunicorn.png","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
 cryptogs.airdrop(0,"agethereumlogo.png","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
 cryptogs.airdrop(0,"agfish.png","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
 cryptogs.airdrop(0,"agdragon.png","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
*/

//
//me
//cryptogs.airdrop(0,"dragon.png","0x34aA3F359A9D614239015126635CE7732c18fDF3")
//gerk
//cryptogs.airdrop(0,"dragon.png","0x707912a400af1cb2d00ffad766d8a675b8dce504")
//grehg
//cryptogs.airdrop(0,"dragon.png","0x535c1a27cc5eed222e4c8af6a911a5d181a2f44c")



//Patrick
//0x0FA23C532B040f8E93aF72D91fb03aD78Eb367eD
//
//Hunter
//0x55fFbCD5F80a7e22660A3B564447a0c1D5396A5C
