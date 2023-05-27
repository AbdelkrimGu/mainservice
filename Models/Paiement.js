const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const paiementSchema = Schema({
    mode : {type : String , required : true},
    amount : {type : Number , required : true}, 
    client : {type : Number , ref : "Student", required : true} ,
    clientEmail : {type : String , required : true},
    status : {type : String , required : true},
    etat : {type : String , required : true}
});

const Paiement = model("Paiement" , paiementSchema);

module.exports = Paiement;