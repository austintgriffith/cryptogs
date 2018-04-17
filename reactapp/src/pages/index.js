import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import BuyPacks from '../components/BuyPacks.js'
import Banner from '../components/Banner'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import CryptogDocScroll from '../components/CryptogDocScroll.js'
import Online from '../components/Online'
var QRCode = require('qrcode-react');

let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 10

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		web3: PropTypes.object,
		network: PropTypes.number,
		account: PropTypes.string,
		api: PropTypes.object,
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
											<p className="lead-2 mb-0">{"Cryptogs is a cryptographically backed version of the game of pogs (milk caps). It extends the ERC-721 token standard from just collecting and trading to risking tokens using on-chain random game mechanics. Play togs against people from around the decentralized world."}</p>
											<p className="lead-2 mb-0" style={{ marginTop: 20 }}>
												{"TL;DR: You can win or lose tokens depending on your luck and it's all on the blockchain!"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
					<section className="section background-primary pt-5 pb-5 text-center">
						<div className="container">
							<h1 className="h2 mb-4">How does random number generation work on Cryptogs?</h1>
							<p className="lead-2">
								In order to be fully decentralized, we should not rely on an off-chain oracle or a simple blockhash for randomness. The trick to pseudo randomness on the blockchain involves a commit/reveal mechanic. When you flip the slammer, you generate a random hash called the <i>reveal</i>. Then you generate a hash from the <i>reveal</i> called the <i>commit</i>. This commit is sent to the blockchain at block <i>N</i>. Finally, when you submit your <i>reveal</i> it is hashed with the <i>blockhash</i> of block <i>N+1</i> to produce a random number. This random number determines who goes first and what Cryptogs are flipped each round.
							</p>
						</div>
					</section>
					<section className="section pt-5 pb-5 text-center">
						<div className="container">
							<h1 className="h2 mb-5">Buy Cryptogs</h1>
							<BuyPacks compact={true} />
						</div>
					</section>

					<section className="section background-primary pt-5 pb-5">
						<div className="container">
							<h1 className="h2 mb-5 text-center">Playing Cryptogs</h1>

							<div className="jumbotron jumbotron--white p-5">
								<div className="row align-items-center">
									<div className="col-md-5">
										<p className="text-center">
											<img className="img-fluid" src={"/screens/screen1creategame.png"} />
										</p>
									</div>
									<div className="col-md-7">
										<h2 className="h4 mb-3">Create A Game</h2>
										<p>{"After you purchase some togs, you can start playing by creating a new game or joining an existing game. You'll select 5 togs you are willing to risk against your opponent's 5 togs."}</p>
									</div>
								</div>

								<hr className="my-5" />

								<div className="row align-items-center">
									<div className="col-md-5">
										<p className="text-center">
											<img className="img-fluid" src={"/screens/spinningslammer.gif"} />
										</p>
									</div>
									<div className="col-md-7">
										<h2 className="h4 mb-3">Slammer Flip</h2>
										<p>{"To determine who goes first, the slammer is flipped by the game creator using a commit/reveal."}</p>
									</div>
								</div>

								<hr className="my-5" />

								<div className="row align-items-center">
									<div className="col-md-5">
										<p className="text-center">
											<img className="img-fluid" src={"/screens/slam.gif"} />
										</p>
									</div>
									<div className="col-md-7">
										<h2 className="h4 mb-3">Game Play</h2>
										<p>{"Players take turns raising and throwing their slammer. Any Cryptogs the player flips over on their turn are transferred automatically to them. Play continues until all togs are flipped."}</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="section text-center" style={{ paddingTop: 140, paddingBottom: 130 }}>
						<div className="container text-center">
							<p>
								<a className="btn btn-primary btn-lg btn--alt" href="/stacks">
									Play Now
								</a>
							</p>
						</div>
					</section>

					<section className="section background-primary pt-5 pb-5">
						<div className="container">
							<h1 className="h2 mb-5 text-center">
								Meet the Team from{" "}
								<a href="https://ethdenver.com/" target="_blank">
									#ETHDenver
								</a>
							</h1>

							<div className="jumbotron jumbotron--white p-5">
								<div className="row align-items-center">
									<div className="col-md-6">
										<div className="d-flex justify-content-center mb-3">
											<div style={{ position: "relative", marginLeft: 25 }}>
												<Spinner
													key={"spinner1"}
													guts={spinning => {
														return <Cryptog key={"cryptogaustin"} id={0} scale={1.2} slowrolling={spinning} image={"austingriffith.jpg"} />;
													}}
												/>
											</div>
										</div>
										<p className="text-center" style={{ fontWeight: "bold" }}>
											Austin Thomas Griffith
										</p>
										<p className="text-center">Smart Contracts - Game Design - Front End</p>
										<p className="text-center">
											<a target="_blank" href="https://austingriffith.com">
												{" "}
												Website
											</a>{" "}
											-
											<a target="_blank" href="https://www.facebook.com/austin.griffith">
												{" "}
												Facebook
											</a>{" "}
											-
											<a target="_blank" href="https://twitter.com/austingriffith">
												{" "}
												Twitter
											</a>
										</p>
									</div>
									<div className="col-md-6">
										<div className="d-flex justify-content-center mb-3">
											<div style={{ position: "relative", marginLeft: 25 }}>
												<Spinner
													key={"spinner1"}
													guts={spinning => {
														return <Cryptog key={"cryptogjon"} id={0} scale={1.2} slowrolling={spinning} image={"jonathangorczyca.jpg"} />;
													}}
												/>
											</div>
										</div>
										<p className="text-center" style={{ fontWeight: "bold" }}>
											Jonathan Gorczyca
										</p>
										<p className="text-center">Mobile Prototype - Logo Design - Pog Design</p>
										<p className="text-center">
											<a target="_blank" href="https://twitter.com/watch84">
												{" "}
												Twitter
											</a>{" "}
											-
											<a target="_blank" href="https://www.linkedin.com/in/jonathangorczyca/">
												{" "}
												Linkedin
											</a>
										</p>
									</div>
								</div>

								<hr className="my-5" />

								<div className="row align-items-center">
									<div className="col-md-6">
										<div className="d-flex justify-content-center mb-3">
											<div style={{ position: "relative", marginLeft: 25 }}>
												<Spinner
													key={"spinner1"}
													guts={spinning => {
														return <Cryptog key={"cryptogKaren"} id={0} scale={1.2} slowrolling={spinning} image={"karenscarbrough.jpg"} />;
													}}
												/>
											</div>
										</div>
										<p className="text-center" style={{ fontWeight: "bold" }}>
											Karen Scarbrough
										</p>
										<p className="text-center">Smart Contract Support - Game Play QA</p>
										<p className="text-center">
											<a target="_blank" href="https://twitter.com/kds0718">
												{" "}
												Twitter
											</a>
										</p>
									</div>
									<div className="col-md-6">
										<div className="d-flex justify-content-center mb-3">
											<div style={{ position: "relative", marginLeft: 25 }}>
												<Spinner
													key={"spinner1"}
													guts={spinning => {
														return <Cryptog key={"cryptogKaren"} id={0} scale={1.2} slowrolling={spinning} image={"patrickmackay.jpg"} />;
													}}
												/>
											</div>
										</div>
										<p className="text-center" style={{ fontWeight: "bold" }}>
											Patrick Mackay
										</p>
										<p className="text-center">Game Play QA - All Around Cryptog</p>
										<p className="text-center">
											<a target="_blank" href="https://twitter.com/PatrickDMackay">
												{" "}
												Twitter
											</a>
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="section text-center" style={{ paddingTop: 140, paddingBottom: 130 }}>
						<div className="container text-center">
							<p>
								<a className="btn btn-blue btn-lg btn--alt" href="/contracts">
									View Contracts
								</a>
							</p>
						</div>
					</section>

					<section className="section background-primary pt-5 pb-5">
						<div className="container">
							<h1 className="h2 mb-5 text-center" />

							<div className="jumbotron jumbotron--white p-5">
								<div className="row align-items-center">
									<div className="col-md-5">
										<div className="d-flex justify-content-center mb-3">
											<div style={{ position: "relative" }}>
												<Spinner
													key={"spinner1"}
													guts={spinning => {
														return <Cryptog key={"cryptog"} id={0} scale={1} slowrolling={spinning} image={"buffalo.png"} />;
													}}
												/>
											</div>
											<div style={{ position: "relative" }}>
												<Spinner
													key={"spinner2"}
													guts={spinning => {
														return <Cryptog key={"cryptog2"} id={1} scale={1} slowrolling={spinning} image={"awblackwidow.jpg"} />;
													}}
												/>
											</div>
										</div>
									</div>

									<div className="col-md-7">
										<h2 className="h4 mb-3">Original Artwork</h2>
										<p>
											{"Calling all artists! We are looking for original artwork."}
										</p>
										<p>
											Artists can design and mint their own Togs <a href="/artists">here</a>!
										</p>
										<p>
											{"Players, traders, and gamers can see the artist of each pog. Jump in the #design channel of our "}
											<a target="_blank" href="https://join.slack.com/t/cryptopogs/shared_invite/enQtMzIyNTI4Njc5MDMwLTkyZTczMTgwYzU2YTZhNmFiMDg5YTFkOGQzYmNlMGZhYmRmNmQ4ZTM2MGRkMjEyYmRmYWZiNzIzMDVhNDA3NDk">Slack</a> or
											 <a target="_blank" href="https://discord.gg/RhqxSj7">Discord</a>.
										</p>
									</div>
								</div>

								<hr className="my-5" />

								<div className="row align-items-center">
									<div className="col-md-5">
										<p>
											<img className="img-fluid" src={"/screens/opensource.png"} />
										</p>
									</div>
									<div className="col-md-7">
										<h2 className="h4 mb-3">Open Source</h2>
										<p>
											{"All of our work is 100% open-source and free for anyone to take and extend! Check out our github repo "}
											<a href="https://github.com/austintgriffith/cryptogs">here</a>.
										</p>
									</div>
								</div>

								<hr className="my-5" />

								<div className="row align-items-center">
									<div className="col-md-12">

										<div className={"centercontainer"} style={{marginTop:10}}>
											<QRCode value={"https://cryptogs.io"} size={320}/>
										</div>


										<div style={{marginTop:30}} className="container text-center">
											<p>
												<a className="btn btn-primary btn-lg btn--alt" href="/stacks">
													Play Now
												</a>
											</p>
										</div>

										<Online {...this.context}/>

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
