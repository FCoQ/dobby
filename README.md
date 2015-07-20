# Dobby, the assistant

Dobby is a TeamSpeak 3 bot written in Javascript for Node.js.

Features:

* Available in every (occupied) channel
* Speaks with a single nickname
* Many built-in plugins, [easy to make your own](https://github.com/FCoQ/dobby/wiki/Plugins)

## Installing

Get node.js and npm if you don't have them already.

Then clone our git repository and use npm to install dependencies:

```
~$ git clone https://github.com/FCoQ/dobby.git
~$ cd dobby
~/dobby$ npm install
~/dobby$ cp config.toml.example config.toml
```

Now edit the `config.toml` you just created with your server's information.

To start it:

```
~/dobby$ npm start
```

## Plugins

Dobby comes with a number of plugins available in the `plugins/` directory. Most of them are enabled by default in the
`config.toml`. You can create your own by adding it to the `plugins/` or `plugins/contrib/` directories. [Follow these
instructions.](https://github.com/FCoQ/dobby/wiki/Plugins)