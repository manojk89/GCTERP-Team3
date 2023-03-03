import express from "express"

import {  CE_Admin_getenrollmentstatus, CE_Admin_modifyenrollmentstatus, CE_Admin_getenrolledstudentslist, CE_Admin_approvestudents, CE_Admin_addstudents, CE_Admin_removestudents, CR_Admin_getCourseRegistrationtatus, CR_Admin_modifyCourseRegistrationStatus, CR_Admin_getRegisteredstudentslist, CR_Admin_approvestudents, CR_Admin_addstudents, CR_Admin_removestudents} from "../controllers/AdminController.js"

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
router.route("/enrolment").get(CE_Admin_getenrollmentstatus)
router.route("/enrolment/modifystatus").post(CE_Admin_modifyenrollmentstatus)
router.route("/enrolment/getdata").get(CE_Admin_getenrolledstudentslist)
router.route("/enrolment/approve").post(CE_Admin_approvestudents)
router.route("/enrolment/addstudents").post(CE_Admin_addstudents)
router.route("/enrolment/removestudents").post(CE_Admin_removestudents)



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////
router.route("/courseregistration").get(CR_Admin_getCourseRegistrationtatus)
router.route("/courseregistration/modifystatus").post(CR_Admin_modifyCourseRegistrationStatus)
router.route("/courseregistration/getdata").get(CR_Admin_getRegisteredstudentslist)
router.route("/courseregistration/approve").post(CR_Admin_approvestudents)
router.route("/courseregistration/addstudents").post(CR_Admin_addstudents)
router.route("/courseregistration/removestudents").post(CR_Admin_removestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router