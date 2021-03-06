<h1>
<a href="http://codeswarm.com"><img src="http://codeswarm.com/wp-content/uploads/2014/03/codeswarm-logo.png" title="CodeSwarm"/>
</h1>

### [Website](http://codeswarm.com/)  &nbsp; [Getting Started](http://github.com/codeswarm/codeswarm/#!get-started) &nbsp; [Plugins](https://github.com/codeswarm/codeswarm/#plugins) &nbsp; [Submit Issue](https://github.com/codeswarm/codeswarm/search?q=&type=Issues)

## Overview
CodeSwarm is an Open Source [Continuous Integration](http://en.wikipedia.org/wiki/Continuous_integration) and [Continuous Deployment](http://en.wikipedia.org/wiki/Continuous_deployment)
system built with [Node.js](http://nodejs.org), [CouchDB](http://couchdb.apache.org/) and [Docker](http://docker.io/).  CodeSwarm is built with plugins, providing tremendous flexibility.

---

* [Quick Install with Vagrant](#setup-with-vagrant)
* [System Requirements](#system)
* [Dependencies](#dependencies)
* [Installation](#setup)
* [Configuration](#environment-variables)
* [Plugins](#plugins)

### System

CodeSwarm has been tested on the following systems:

* Ubuntu Precise 12.04 (LTS) (64-bit)
* Mac OSX 10.8.5

CodeSwarm was built to work on POSIX systems, including most Unix and Linux variants that support Node.js.

CodeSwarm has not been tested on Windows with Node.js.

### Dependencies

CodeSwarm consists of a single Node.JS Web Application process, which spawns test jobs in response to source code commits and manual test runs.

* **Required**
	* Node.JS
	* A CouchDB database backend
* **Optional**
	* Docker
	* Vagrant

### Setup with Vagrant

If you don't want to go through the difficulty of installing CouchDB, CodeSwarm comes with a Vagrantfile to automate the installation and setup of the CodeSwarm server.  This is the recommended approach to working with CodeSwarm.

To use CodeSwarm with Vagrant, follow these steps:

1. Install [VirtualBox](http://virtualbox.org/wiki/Downloads)
2. Install [Vagrant](http://docs.vagrantup.com/v2/installation/)
3. Download CodeSwarm

```sh
$ git clone git@github.com:codeswarm/codeswarm.git
```

4. Engage Vagrant (this will take a while)

```sh
$ vagrant up
```
5. Log into Vagrant and start CodeSwarm
```sh
$ vagrant ssh
$ npm install
$ bower install
$ npm run mon
```

If all goes well, you should be able to log into CodeSwarm at the following URL:
http://localhost:1337

CouchDB's Futon will be available at:
http://localhost:5984/_utils/index.html

### Manual Setup

CodeSwarm can be cloned from Github and installed then its dependencies can be installed via `npm`.

1. Install [Node.js](http://nodejs.org/)  (We recommend using the excellent [NVM script](http://github.com/creationix/nvm(
2. Install [CouchDB](http://docs.couchdb.org/en/latest/install/index.html)
3. Download and Install CodeSwarm:

You can download and install using the following commands:

```sh
$ git clone git@github.com:codeswarm/codeswarm.git
$ npm install
$ npm start
```

CodeSwarm runs on port 1337 by default.  After starting the CodeSwarm process you can navigate to http://localhost:1337 to create an account and get started.

**Github Authentication**
You will also need a GitHub Client ID and Secret:

* Register a new application https://github.com/settings/applications
* Set the homepage URL to http://$YOUR_IP_ADDRESS/
* Set the callback URL to http://$YOUR_IP_ADDRESS/auth/github/callback
* Save the ClientID and Secret for assigning to Environment Variables, defined below

**CouchDB Setup**

* Assuming you have CouchDB [installed](http://wiki.apache.org/couchdb/Installing_on_OSX) and configured ...
* Copy your CouchDB URL and username and password for setup below

### Environment Variables

CodeSwarm utilizes Environment variables for configuration.  

* PORT - Public port CodeSwarm runs on, defaults to 1337
* COUCHDB_URL - CouchDB URL, defaults to 'http://localhost:5984'
* COUCHDB_USERNAME - CouchDB Username, defaults to 'admin'
* COUCHDB_PASSWORD - CouchDB Password, defaults to 'admin'
* GITHUB_CLIENT_ID - Github Client ID, defaults to an application set up for local development
* GITHUB_CLIENT_SECRET - Github Client Secret, defaults to an application set up for local development
* GITHUB_CALLBACK_URL - Github Client Callback Url, defaults to http://localhost:1337/auth/github/callback

You can set these variables on the command line prior to calling NPM start.  Here's a quick example:

```sh
$ PORT=1337 COUCHDB_URL=http://localhost:5984 COUCHDB_USERNAME=admin COUCHDB_PASSWORD=admin npm run start
```

## License Information

This project has been released under the [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html), the text of which is included below. This license applies ONLY to the source of this repository and does not extend to any other CodeSwarm distribution or variant, or any other 3rd party libraries used in a repository. 

> Copyright © 2014 [appendTo, Inc.](http://appendto.com)

> Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

> [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

>  Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.