import React from 'react'






const Banner = (props) => (
    <section className="banner bg-primary">
        <div className="container text-center">
            <h2 className="mb-4"><strong>Whip out your slammer and get rad on the blockchain!</strong></h2>
            <p className="lead mb-1">Born at ETHDenver, Cryptogs is the game of pogs on Ethereum.</p>
            <p className="lead mb-5">{"Play 'Togs live with your friends on-chain!"}</p>
            <p><a className="btn btn-primary btn-lg btn--alt" href="/stacks">Play Now</a></p>
            <p><a className="btn btn-blue btn-lg btn--alt" href="/contracts" style={{marginTop:40}}>Smart Contracts</a></p>
        </div>
        <img
            className="pog pog--large"
            src="https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/adsmile.png"
            alt=""
            style={{
                transform: 'rotate(-20deg)',
                left: '-30px',
                bottom: '60px',
                zIndex: '3'
            }}
        />
        <img
            className="pog pog--large"
            src="https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/awpoison.jpg"
            alt=""
            style={{
                transform: 'rotate(30deg)',
                left: '60px',
                bottom: '-90px',
                zIndex: '2'
            }}
        />
        <img
            className="pog pog--large"
            src="https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/ad8ball.png"
            alt=""
            style={{
                transform: 'rotate(20deg)',
                left: '160px',
                bottom: '-40px'
            }}
        />

        <img
            className="pog pog--large"
            src="https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/awstussy.jpg"
            alt=""
            style={{
                transform: 'rotate(20deg)',
                right: '-40px',
                bottom: '-45px',
                zIndex: '2'
            }}
        />
        <img
            className="pog pog--large"
            src="https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/awripsaw.jpg"
            alt=""
            style={{
                transform: 'rotate(-40deg)',
                right: '140px',
                bottom: '10px'
            }}
        />
    </section>
)

export default Banner
