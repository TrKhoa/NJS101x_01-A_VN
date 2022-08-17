const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

const MongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://root:root@cluster0.b8yrsmo.mongodb.net/?retryWrites=true&w=majority')
    .then(clientt=>{
        console.log("Connected");
    })
    .catch(err=>console.log(err));
}

module.exports = MongoConnect;
