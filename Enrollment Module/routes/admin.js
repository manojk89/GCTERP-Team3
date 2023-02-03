import express from "express"

import { getenrollmentstatus,modifyenrollmentstatus, getenrolledstudentslist ,approvestudents, addstudents, removestudents} from "../controllers/AdminController.js"

const router = express.Router()

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////
router.route("/enrolment").get(getenrollmentstatus);
router.route("/enrolment/modifystatus").post(modifyenrollmentstatus);
router.route("/enrolment/getdata").get(getenrolledstudentslist);
router.route("/enrolment/approve").post(approvestudents);
router.route("/enrolment/addstudents").post(addstudents);
router.route("/enrolment/removestudents").post(removestudents);



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router