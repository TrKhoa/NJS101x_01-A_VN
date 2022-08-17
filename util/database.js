const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const MongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://khoa:khoa@cluster0.b8yrsmo.mongodb.net/shop?retryWrites=true&w=majority')
    .then(clientt=>{
        console.log("Connected");
        _db = client.db();
        callback();
    })
    .catch(err=>{
        console.log(err);
        throw err;
    });
}

const getDb = () =>{
    if(_db){
        return _db;
    } else {
        throw err;
    }

}
exports.MongoConnect = MongoConnect;
exports.getDb = getDb;
