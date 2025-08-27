# freeCodeCamp Information Security Certificate

These are the projects I did in the completion of this certificate.

## Projects

### Stock Price Checker

Returns information about Nasdaq stocks. You can enter one or two stock names to check, and optionally like the stocks. When viewing one stock, the like counter is shown. When viewing two stocks, a relative like counter between the two is shown. I used Express to handle routes, a MongoDB database to store stock information, and wrote functional tests using the Chai library. Likes are based on IP addresses which are hashed using Bcrypt before being stored. In addition, Helmet.js is used for setting HTTP headers to improve security.

![Image of Project](images/stock-price-checker.png)

### Anonymous Message Board

Message board with threads and replies, as well as deletion and reporting capabilities. When making a thread or reply, you set a deletion password which is hashed using Bcrypt before being stored. Routes are handled with Express, MongoDB is used for the database, and functional tests use the Chai library. In addition, Helmet.js is used for setting HTTP headers to improve security.

![Image of Project](images/anon-msg-board.png)

## Skills

- Node.js
- Express
- Chai
- MongoDB
- Mongoose
- Bcrypt
- Helmet.js

## Development Tools

- [VS Code](https://code.visualstudio.com/) - Development environment
- [Node.js](https://nodejs.org/en/) - JavaScript runtime environment
- [Git](https://git-scm.com/)/[GitHub](https://github.com/) - Version control
- [MongoDB Atlas](https://www.mongodb.com/) - Provides the database used

## Running the Projects
You will need node.js installed. To run a project, navigate to the project folder, open a terminal window, then type ```npm install```, then ```npm start```. This will start a local server that can be viewed in a web browser.

The Stock Price Checker and Anonymous Message Board projects require a database on MongoDB Atlas. [Here](https://www.freecodecamp.org/news/get-started-with-mongodb-atlas/) is a guide to create an account and set up a database. Once you have your URI string, create a file called .env in the project folder, then assign the URI string to MONGO_URI.
