import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import Intro from '../components/Intro.js'
import BuyPacks from '../components/BuyPacks.js'
import Banner from '../components/Banner'
import PogAnimation from '../components/PogAnimation'

let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 10

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		web3: PropTypes.object,
		network: PropTypes.number,
	},

	render(){
		let {web3,network} = this.context
		return (
			<div>
					<main className="site-main">
              {<Banner />}
              <section className="section pt-6 pb-6">
                  <div className="container">
                      <div className="jumbotron p-5">
                          <div className="row align-items-center">
                              <div className="col-md-3">
                                  <PogAnimation image={'awyinandyang.jpg'} />
                              </div>
                              <div className="col-md-9">
                                  <div className="pt-2 pb-2">
                                      <h1 className="h2 mb-4">What is CryptoPogs?</h1>
                                      <p className="lead-2 mb-0">CryptoPogs is the digital version of the game known as Pogs. It's about collecting various pogs and using them to play against people from all around the world. You can win or lose pogs depending on your luck, and it's all on the blockchain!</p>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              </section>
              <section className="section bg-primary pt-5 pb-5 text-center">
                  <div className="container">
                      <h1 className="h2 mb-4">How do CryptoPogs work?</h1>
                      <p className="lead-2">Maybe some brief text here on how the commit/reveal stuff works. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nulla odio, dapibus sed ante ac, rutrum lobortis lectus. Ut dolor lectus, dictum id dolor at, euismod luctus mauris.</p>
                      <p className="lead-2">Maybe some brief text here on how the commit/reveal stuff works. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nulla odio, dapibus sed ante ac, rutrum lobortis lectus. Ut dolor lectus, dictum id dolor at, euismod luctus mauris.</p>
                  </div>
              </section>
              <section className="section pt-5 pb-5 text-center">
                  <div className="container">
                      <h1 className="h2 mb-5">Buy CryptoPogs</h1>

                      <div className="row">

                          <div className="col-md-6">
                              <div className="pack">
                                  <div className="pack__contents">
                                      <div className="pack__sale">
                                          <span>For sale <small>Ξ</small> 0.003</span>
                                      </div>

                                      <img src="https://content.screencast.com/users/hunter1291/folders/Jing/media/c439c7e7-5e08-45b4-b450-4a2c37dbef1a/00000361.png" alt="" width="334" height="120" className="mb-0" />

                                      <div className="pack__buy">
                                          <button className="btn btn-primary">Purchase</button>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="col-md-6">
                              <div className="pack">
                                  <div className="pack__contents">
                                      <div className="pack__sale">
                                          <span>For sale <small>Ξ</small> 0.003</span>
                                      </div>

                                      <img src="https://content.screencast.com/users/hunter1291/folders/Jing/media/c439c7e7-5e08-45b4-b450-4a2c37dbef1a/00000361.png" alt="" width="334" height="120" className="mb-0" />

                                      <div className="pack__buy">
                                          <button className="btn btn-primary">Purchase</button>
                                      </div>
                                  </div>
                              </div>
                          </div>

                      </div>

                      <p><a className="btn btn-secondary btn-lg btn--alt" href="#">View All Packs</a></p>
                  </div>
              </section>

              <section className="section bg-primary pt-5 pb-5">
                  <div className="container">
                      <h1 className="h2 mb-5 text-center">Playing CryptoPogs</h1>

                      <div className="jumbotron jumbotron--white p-5">

                          <div className="row align-items-center">
                              <div className="col-md-5">
                                  <p>screenshot</p>
                              </div>
                              <div className="col-md-7">
                                  <h2 className="h4 mb-3">Starting a game</h2>
                                  <p>{"After you purchase some pogs, you can start playing by creating a new game or joining an existing game. After entering a game, you'll need to select 5 pogs you want to play with. Your opponent will also select 5 pogs, which will be combined with your pogs to create a stack of 10 pogs."}</p>
                              </div>
                          </div>

                          <hr className="my-5" />

                          <div className="row align-items-center">
                              <div className="col-md-5">
                                  <p>screenshot</p>
                              </div>
                              <div className="col-md-7">
                                  <h2 className="h4 mb-3">Next steps</h2>
                                  <p>Asdf</p>
                              </div>
                          </div>

                      </div>

                  </div>
              </section>
          </main>
			</div>
		)
	}
});
/*

<Intro web3={web3} network={network}/>
<BuyPacks compact={true} />
 */
