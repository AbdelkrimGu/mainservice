const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const checkSchema = Schema({
    content : {type : String , required : true}
});

const Check = model("Check" , checkSchema);

module.exports = Check;