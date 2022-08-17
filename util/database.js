const mongoDb = require('mongodb');

const MongoClient = mongoDb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://khoa:khoa@cluster1.fixlpkx.mongodb.net/?retryWrites=true&w=majority')
    .then(client=>{
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
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
