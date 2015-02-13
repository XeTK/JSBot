# JS Bot

## TODO

- [ ] User configurable (Everything is hard coded right now.).
- [ ] Easy configuration of the SSL certificates.
- [ ] Better error handling for missing configuration.
- [ ] Unit tests.
- [ ] Code reviews and refactor.
- [ ] Comment current code base. 
- [ ] Tidy up directory structure.
- [ ] Sandbox channels from each other.

## Install

1. Make sure you have the latest version of [Node JS](http://nodejs.org) installed on your system.

2. Navigate to the root directory of JSBot.

3. Execute `npm install`.

4. Next copy or rename the `keys.json.example` file to `keys.json`.

5. Edit the keys.json file to contain the API authentication keys.

6. Finally execute `npm start` and this will load the bot up to join the channel.


## Example extension

Please add extensions into the `./extensions/` folder under a appropriate directory name.

```

function handler(collective) {

    // This is the direct interface to the IRC socket.
    var irc = collective.irc;

    // This allows you to interact with other plugins within the same space.
    var plugins = collective.plugins;

}

module.exports = function(module_holder) {
    // Change the name within the brackets below to give the plugin a name.
    module_holder['ChangeMe'] = handler;
};

```

## Creating SSL Certificates.

This set of commands generates the SSL certificates needed for joining IRC servers with SSL.

`$ openssl genrsa -out private-key.pem 1024`

`$ openssl req -new -key private-key.pem -out csr.pem`

`$ openssl x509 -req -in csr.pem -signkey private-key.pem -out public-cert.pem`