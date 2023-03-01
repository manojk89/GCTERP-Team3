import express from "express"

import { getenrollmentstatus,modifyenrollmentstatus, getenrolledstudentslist ,approvestudents, addstudents, removestudents, getCourseRegistrationtatus, modifyCourseRegistrationStatus, getRegisteredstudentslist, cr_approvestudents, cr_addstudents, cr_removestudents} from "../controllers/AdminController.js"

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
router.route("/enrolment").get(getenrollmentstatus)
router.route("/enrolment/modifystatus").post(modifyenrollmentstatus)
router.route("/enrolment/getdata").get(getenrolledstudentslist)
router.route("/enrolment/approve").post(approvestudents)
router.route("/enrolment/addstudents").post(addstudents)
router.route("/enrolment/removestudents").post(removestudents)



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////
router.route("/courseregistration").get(getCourseRegistrationtatus)
router.route("/courseregistration/modifystatus").post(modifyCourseRegistrationStatus)
router.route("/courseregistration/getdata").get(getRegisteredstudentslist)
router.route("/courseregistration/approve").post(cr_approvestudents)
router.route("/courseregistration/addstudents").post(cr_addstudents)
router.route("/courseregistration/removestudents").post(cr_removestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router