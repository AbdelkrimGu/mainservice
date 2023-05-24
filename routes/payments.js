const express = require('express');
const router = express.Router();
const {DefaultSignatureValidator} = require("chargily-epay-gateway/lib/Webhook");


const dotenv = require('dotenv');
dotenv.config();
const Paiement = require('../Models/Paiement');


router.get("/front", async (req,res) => {
    console.log(req);
    console.log(req.body);
    const myObjectString = JSON.stringify(req.body);
    let paiement = new Paiement({
        contenu : myObjectString,
        from : "front"
    });
    console.log(paiement);
    await paiement.save();
    res.json({message : "accepted from front"});
});


router.get("/webhook", async (req,res) => {
    console.log(req);
    console.log(req.body);
    const myObjectString = JSON.stringify(req.body);
    let paiement = new Paiement({
        contenu : myObjectString,
        from : "webhook"
    });
    console.log(paiement);
    await paiement.save();


    let secret = process.env.CHARGILY_APP_SECRET
    console.log(process.env.CHARGILY_APP_SECRET);


    let signature = req.header('Signature');

    let rs = false;


    try{
        rs = DefaultSignatureValidator.isValid(
            signature, 
            secret,
            req.body);
    }
    catch (error) {
        console.log(error);
        return res.status(401).json(error.message);
    };
     // return boolean
    res.json({message : rs});
});



module.exports = router;