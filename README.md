# PassportJS-Authentication

## Setup

### Installation

```
npm install -g coffee-script
npm install -g mocha
npm install
git submodule sync
git submodule update --init --recursive
bower install
```

## Tests

launch unit tests:
```
NODE_ENV=test mocha --compilers coffee:coffee-script --reporter spec --recursive test
```
