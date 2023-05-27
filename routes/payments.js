const express = require('express');
const router = express.Router();
const {DefaultSignatureValidator} = require("chargily-epay-gateway/lib/Webhook");


const dotenv = require('dotenv');
dotenv.config();
const Paiement = require('../Models/Paiement');
const Student = require('../Models/Student');


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


router.post("/webhook", async (req,res) => {
    //console.log(req.body);

    try{
        let secret = process.env.CHARGILY_APP_SECRET
        console.log(process.env.CHARGILY_APP_SECRET);


        let signature = req.header('Signature');
        console.log(signature);

        rs = DefaultSignatureValidator.isValid(
            signature, 
            secret,
            req.body.replace(/^'|'$/g, ''));
        
        if (rs){
            const jsonData = JSON.parse(req.body.replace(/^'|'$/g, ''));
            const invoice = jsonData.invoice;
            console.log(jsonData.invoice);
            console.log(invoice.invoice_number);

            let paiement = await Paiement.findById(invoice.invoice_number);

            paiement.status = invoice.status;

            if (paiement.status === 'paid'){
                console.log("in paid");
                let student = await Student.findById(paiement.client);
                console.log(student);
                student.balance += parseInt(paiement.amount);
                paiement.etat = "closed";
                await student.save();
                console.log(student.balance);
                await paiement.save();
            }
        }

        res.send({message : rs});

    }catch (err){
        console.log(err);
        res.status(400).json(err)
    }
    
});



module.exports = router;