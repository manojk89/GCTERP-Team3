import express from "express"

import { CE_Student_checkforenrolment, CE_Student_getenrolmentdata, CE_Student_saveenrolmentdata, CR_Student_checkforregistration, CR_Student_getregisterdata, CR_Student_saveCourseRegisteration, savedata   } from "../controllers/StudentController.js"

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
router.route("/enrolment").get(CE_Student_checkforenrolment);
router.route("/enrolment/getdata").get(CE_Student_getenrolmentdata);
router.route("/enrolment/savedata").post(CE_Student_saveenrolmentdata);




/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////
router.route("/courseregistration").get(CR_Student_checkforregistration)
router.route("/courseregistration/getdata").get(CR_Student_getregisterdata)
router.route("/courseregistration/savedata").post(CR_Student_saveCourseRegisteration)

// router.route("/dummy").post(savedata)

/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router