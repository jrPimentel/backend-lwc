const mongoose = require('mongoose');

var mongoDB = 'mongodb+srv://test:test@lanworkcustomers-gs23e.gcp.mongodb.net/lanworkcustomers?retryWrites=true&w=majority';

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.connection.on('error', (err)=>{
    console.log('>> Failed to connect to MongoDB, retrying...');

    setTimeout( () => {
            mongoose.connect(mongoDB, {useNewUrlParser: true});
    }, 30);
});
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

module.exports = mongoose;