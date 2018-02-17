# cryptogs

Cryptogs is an extension of the ERC721 token standard.

At this point the owner can mint tokens with an image (bytes32).

This image will be represented on the face of the Cryptog (crypto pog).

Slamma Time!

-------------------------------------------------

compile:
```
mocha tests/compile
```

deploy:
```
mocha tests/deploy
```

mint a genisis Cryptog from account 0 to account 1:
```
mocha tests/mint
```

run full test suite:
```
clevis test full
```

run just a redeploy without recompiling:
```
clevis test redeploy
```

-------------------------------------------------

TODO:

make sure only the owner can mint the token
