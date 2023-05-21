const express = require('express');
const router = express.Router();
const axios = require('axios');
const JwtVerifier = require("../functions/JwtVerifier");
const Group = require("../Models/Group");
const Course = require("../Models/Course");
const Student = require("../Models/Student");
const Enrollement = require("../Models/Enrollement");
const Teacher = require('../Models/Teacher');

const stripe = require("stripe")("sk_test_51N8J4xFjSH2kRPsEUuAoEVTJQCaLUGDyH0luGxdQBKP0RDLCxauwrkcOwQ3wmDmh1Sdm7GK24xbsibpygbmyOrCX00KsWNkB9k"); 
const {Invoice, Mode} = require("chargily-epay-gateway/lib/configuration");

const apiKey = "api_qCIJq19juHSIXa3t3v8YsvqOeqKOXsLJv0luyAFYxekj4mvL3iNbDsm2tlXd2sd2";
const secretKey = "secret_eec1a65564e43e4ffa340a1d2db115bb7a695842e3877e3ea35e7cd07f6bee24";


router.post("/balance/add" , async(req,res)=>{
    console.log(req);
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 0
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }
        const order = new Invoice()
        order.invoiceNumber = "100" // must be integer or string
        order.mode = Mode.EDAHABIA // or Mode.CIB
        order.backUrl = "https://www.exemple.org/" // must be a valid and active URL
        order.amount = 75 // must be integer , and more or equal 75
        order.webhookUrl = "https://www.exemple.org/webhook-validator" // this URL where receive the response 
        order.client = "chawki mahdi" 
        order.discount = 0 // by percentage between [0, 100]
        order.clientEmail = "client@example.com" // email of customer where he will receive the Bill
        order.appKey = process.env.CHARGILY_APP_KEY 

        const checkoutUrl = chargily.createPayment(order).then( res => {
            return res.checkout_url // redirect to this url to proccess the checkout 
        });
        
        
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error.message);
    }
});

router.get("/balance" , async (req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 0
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }
        const updatedStudent = await Student.findOne({_id : user.id}).populate('enrollements');
        if (!updatedStudent.premium) {
            throw new Error("Student doesn't have premium access");
        }
        return res.json(updatedStudent);
        
        
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error.message);
    }
});


router.post("/enroll" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 0
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }

        // Find the student again to make sure we have the latest version
        const updatedStudent = await Student.findOne({_id : user.id}).populate('enrollements');
        if (!updatedStudent.premium) {
            throw new Error("Student doesn't have premium access");
        }
        const groupId = req.body.groupid;

        console.log(updatedStudent);
        const group = await Group.findOne({_id : groupId});
        const enrollmentExists = updatedStudent.enrollements.some(
            (enrollment) => enrollment.group == groupId
        );
        console.log(enrollmentExists);
        if (enrollmentExists) {
            return res.status(400).json({
              message: 'already enrolled in this group',
            });
        }

        const teacher = await Teacher.findOne({_id : group.teacher });

        let enrollement = new Enrollement({
            group: group._id,
            student: updatedStudent._id,
            teacher: group.teacher,
            status : "enrolled"
        }); 

        await enrollement.save();
        teacher.enrollements.push(enrollement._id);
        updatedStudent.enrollements.push(enrollement._id);
        await updatedStudent.save();
        await teacher.save();
        res.status(201).json(enrollement);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error.message);
    }
});


router.post("/enter" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        const courseid = req.body.courseid;
        let course = await Course.findById(courseid);
        let enrollement = await Enrollement.findOne({studentId : student._id , courseId : course._id });
        if (!enrollement) {
            throw new Error("you are not enrolled in this course");
        }else{
            enrollement.status = "entered";
        }
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

router.get("/cours" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        console.log(user.id);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 0
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }

        // Find the student again to make sure we have the latest version
        const updatedStudent = await Student.findOne({_id : user.id}).populate({
            path: 'groups'
          });
        let courses = [];
        updatedStudent.groups.forEach((group) => {
            courses.push(...group.courses);
        });
        console.log(courses);
        const specialVariable = [];

        for (let i = 0; i < courses.length; i++) {
            const course = await Course.findById(courses[i]);
            specialVariable.push(course);
        }
          // Do something with the courses array
        
        //console.log(updatedStudent);
        if (!updatedStudent.premium) {
            throw new Error("Student doesn't have premium access");
        }
        res.json(specialVariable);

        

        // Send the list of groups in the response
        //res.status(200).json(cours);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.get("/groups" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        console.log(user.id);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 0
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }

        // Find the student again to make sure we have the latest version
        const updatedStudent = await Student.findOne({_id : user.id}).populate({
            path: 'groups'
        });
        
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
    
        // The student groups can be accessed with `student.groups`
    
        res.json(updatedStudent.groups);

        

        // Send the list of groups in the response
        //res.status(200).json(cours);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});


module.exports = router;