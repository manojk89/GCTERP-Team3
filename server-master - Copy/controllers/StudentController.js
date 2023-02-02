///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////
import { SemesterMetadataModel } from '../models/SemesterMetadataModel.js';
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { CurriculumModel } from '../models/CurriculumModel.js'
import { StudentsModel } from '../models/StudentsModel.js'

// check for enrolment status
export const checkforenrolment = async(req, res) => {
    try{
        // const studentmail = "mano.1917130@gct.ac.in"
        // const studentinfo = await StudentsModel.findOne({studentmail})
        // const currentsemester = studentinfo.currentSemester
        const enrollmentstatus = await SemesterMetadataModel.find({})
        // console.log(enrollmentdata);
        // console.log(enrollmentdata[0].enrollment.status);
        if(enrollmentstatus[0].enrollment.status == 'active'){
            res.status(200).json({success:true, msg:"Enrollment is enabled"})
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// fetch data to feed the enrollment page 
export const getenrolmentdata = async(req, res) => {
    try{

        const studentmail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({studentmail})
        const currentsem = studentinfo.currentSemester

        const mandatorycourses = await CurriculumModel.find({semester:currentsem})
        const pecourses = await CurriculumModel.find({category:"PE"})
        
        res.status(200).json({success:true, msg:"Enrollment details are fetched",courses:{mandatorycourses,pecourses}})
    
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}



// fetch data to feed the enrollment page 
export const saveenrolmentdata = async(req, res) => {
    try{
   
        const coursesenrolled = {
            courseCode : req.body.courses
        }
        const enrollmentdata = {
            enrolled : false,
            approval : 0
        }
        
        console.log(coursesenrolled.courseCode)
        
        // Fetch User details
        const usermail = 'mano.1917130@gct.ac.in'
        const studentinfo = await StudentsModel.findOne({usermail})
      
        enrollmentdata.studentId = studentinfo._id
        enrollmentdata.semester = studentinfo.currentSemester
        enrollmentdata.branch = studentinfo.branch

        coursesenrolled.courseCode.forEach(savetodb);
        async function savetodb(eachcourse) {
            const existsingcourse = await EnrollmentModel.find({$and:[{studentId:studentinfo._id},{approval:0}]})
            console.log(existsingcourse)
            if(existsingcourse){
                EnrollmentModel.deleteOne({$and:[{studentId:studentinfo._id},{approval:0}]}).then(p=>console.log(p))
            }
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
            const courseidincurriculum = courseincurriculummodel._id
            enrollmentdata.courseCode = courseidincurriculum
    
            if(courseincurriculummodel){
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                await newenrollmentdata.save()
                // await EnrollmentModel.find().populate("courseCode").populate("studentId")
                // console.log(result)     
            }
            else{
                res.status(200).json({success:false, message:"No such Course Code is found in the database"})
            }
        }
        res.status(200).json({success:true, message:"Enrollment details were saved to database"})
     
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


