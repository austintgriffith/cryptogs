import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import Intro from '../components/Intro.js'
import BuyPacks from '../components/BuyPacks.js'
import Banner from '../components/Banner'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import CryptogDocScroll from '../components/CryptogDocScroll.js'

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
                                  <CryptogDocScroll />
                              </div>
                              <div className="col-md-9">
                                  <div className="pt-2 pb-2">
                                      <p className="lead-2 mb-0">{"Cryptogs is a cryptographically backed version of the game of pogs (milk caps). It extends the ERC-721 token standard from just collecting and trading to risking tokens using on-chain random game mechanics. Play pogs against people from around the decentralized world."}</p>
																			<p className="lead-2 mb-0" style={{marginTop:20}}>{"TL;DR: You can win or lose tokens depending on your luck and it's all on the blockchain!"}</p>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              </section>
              <section className="section bg-primary pt-5 pb-5 text-center">
                  <div className="container">
                      <h1 className="h2 mb-4">How does random number generation work on Cryptogs?</h1>
                      <p className="lead-2">In order to be fully decentralized, we should not rely on an off-chain oracle for randomness. The trick to pseudo randomness on the blockchain involves a commit/reveal mechanic. When you flip the slammer, you generate a random hash called the <i>reveal</i>. Then you generate a hash from the <i>reveal</i> called the <i>commit</i>. This commit is sent to the blockchain at block <i>N</i>. Finally, when you submit your <i>reveal</i> it is hashed with the <i>blockhash</i> of block <i>N+1</i> to produce a random number. This random number determines who goes first and what Cryptogs are flipped each round.</p>
                  </div>
              </section>
              <section className="section pt-5 pb-5 text-center">
                  <div className="container">
                      <h1 className="h2 mb-5">Buy Cryptogs</h1>
                      <BuyPacks compact={true} />
                  </div>
              </section>

							<section className="section bg-primary pt-5 pb-5">
									<div className="container">
											<h1 className="h2 mb-5 text-center">Playing Cryptogs</h1>

											<div className="jumbotron jumbotron--white p-5">

													<div className="row align-items-center">
															<div className="col-md-5">
																	<img src={"/screens/screen1creategame.png"} />
															</div>
															<div className="col-md-7">
																	<h2 className="h4 mb-3">Create A Game</h2>
																	<p>{"After you purchase some pogs, you can start playing by creating a new game or joining an existing game. You'll select 5 pogs you are willing to risk against your opponent's 5 pogs."}</p>
															</div>
													</div>

													<hr className="my-5" />

													<div className="row align-items-center">
															<div className="col-md-5">
																	<img style={{maxWidth:300}} src={"/screens/spinningslammer.gif"} />
															</div>
															<div className="col-md-7">
																	<h2 className="h4 mb-3">Slammer Flip</h2>
																	<p>{"To determine who goes first, the slammer is flipped by the game creator. It takes two transaction, one for the commit, and another for the reveal."}</p>
															</div>
													</div>

													<hr className="my-5" />

													<div className="row align-items-center">
															<div className="col-md-5">
																	<img src={"/screens/slam.gif"} />
															</div>
															<div className="col-md-7">
																	<h2 className="h4 mb-3">Game Play</h2>
																	<p>{"Players take turns raising and throwing their slammer. Any Cryptogs the player flips over on their turn are transferred automatically to them. Play continues until all pogs are flipped."}</p>
															</div>
													</div>
											</div>

									</div>
							</section>

							<section className="section pt-5 pb-5 text-center">
								<div className="container text-center" style={{padding:100}}>
										<p><a className="btn btn-primary btn-lg btn--alt" href="/stacks">Play Now</a></p>
								</div>
							</section>

							<section className="section bg-primary pt-5 pb-5">
									<div className="container">
											<h1 className="h2 mb-5 text-center"></h1>

											<div className="jumbotron jumbotron--white p-5">

													<div className="row align-items-center">
															<div className="col-md-5">
																	<img src={"/screens/opensource.png"} />
															</div>
															<div className="col-md-7">
																	<h2 className="h4 mb-3">Open Source</h2>
																	<p>{"All of our work is 100% open-source and free for anyone to take and extend! Check out our github repo "}<a href="https://github.com/austintgriffith/cryptogs">here</a>.</p>
															</div>
													</div>

													<hr className="my-5" />

													<div className="row align-items-center">
															<div className="col-md-5">
															 <div style={{position:'absolute',left:50,top:-85}}>
																	<Spinner key={"spinner1"} guts={
																		(spinning)=>{
																			return (
																				<Cryptog key={"cryptog"} id={0} scale={1} slowrolling={spinning} image={"buffalo.png"}/>
																			)
																		}
																	}/>
																</div>
																<div style={{position:'absolute',left:170,top:-85}}>
																	 <Spinner key={"spinner2"} guts={
																		 (spinning)=>{
																			 return (
																				 <Cryptog key={"cryptog2"} id={1} scale={1} slowrolling={spinning} image={"awblackwidow.jpg"}/>
																			 )
																		 }
																	 }/>
																 </div>
															</div>



															<div className="col-md-7">
																	<h2 className="h4 mb-3">Original Artwork</h2>
																	<p>{"Calling all artists! We are looking for original artwork. Players, traders, and gamers can see the artist of each pog. Jump in the #design channel of our "}<a href="https://join.slack.com/t/cryptopogs/shared_invite/enQtMzIyNTI4Njc5MDMwLTkyZTczMTgwYzU2YTZhNmFiMDg5YTFkOGQzYmNlMGZhYmRmNmQ4ZTM2MGRkMjEyYmRmYWZiNzIzMDVhNDA3NDk">Slack</a>.</p>
															</div>
													</div>


											</div>

									</div>
							</section>

							<section className="section pt-5 pb-5 text-center">
								<div className="container text-center" style={{padding:100}}>
										<a href="">Privacy Policy</a> -  <a href="">Terms of Use</a> -  <a href="">Smart Contracts</a>  - <a href="">Git Repo</a> -  <a href="">Slack</a>
								</div>
							</section>

          </main>
			</div>
		)
	}
});


/*
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
<Intro web3={web3} network={network}/>
<BuyPacks compact={true} />
 */
