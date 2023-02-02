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

// export const savedata = async (req,res) => {
//     const Studentdata = {
//         email:"mano.1917130@gct.ac.in",
//         firstName:"Manoj",
//         currentSemester:8,
//         branch:"CSE"
//     }
//     const studata = new StudentsModel(Studentdata)
//     await studata.save()
// }


// check for enrolment status
export const getenrollmentstatus = async(req, res) => {
    try{
        // fetch data based on usertype
        // const studentmail = "mano.1917130@gct.ac.in"
        // const studentinfo = await StudentsModel.findOne({studentmail})
        // const currentsemester = studentinfo.currentSemester
        // const enrollmentstatus = await SemesterMetadataModel.find({semester:{sem:currentsemester}})
        const enrollmentstatus = await SemesterMetadataModel.find({})
        console.log(enrollmentstatus);
        // console.log(enrollmentdata[0].enrollment.status);
        if(enrollmentstatus[0].enrollment.status == 'Active'){
            res.status(200).json({success:true, message:"Enrollment is enabled"})
        }else{
            res.status(200).json({success:false, message:"Enrollment is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const modifyenrollmentstatus = async(req, res) => {
    try{
        // const studentmail = "mano.1917130@gct.ac.in"
        // const studentinfo = await StudentsModel.findOne({studentmail})
        // const currentsemester = studentinfo.currentSemester
        // const enrollmentstatus = await SemesterMetadataModel.find({semester:{sem:currentsemester}})
        
        const enrollmentstatus = await SemesterMetadataModel.find({})
        // Should define an streams to close enrollment based on date
        
        enrollmentstatus[0].enrollment.status = req.body.status
        enrollmentstatus[0].enrollment.start = req.body.start
        enrollmentstatus[0].enrollment.end = req.body.end

        await enrollmentstatus[0].save()
        res.status(200).json({success:true, message:"Enrollment data is modidified"})
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// fetch data to feed the enrollment page 
export const getenrolledstudentslist = async(req, res) => {
    try{
        const requested = {
            semester : req.body.Sem,
            branch : req.body.Branch
        }
        const enrollmentdata = await EnrollmentModel.find({enrolled:false,branch:requested.branch,semester:requested.semester}).populate("courseCode").populate("studentId")
       console.log(enrollmentdata)
        let courses = []
        enrollmentdata.forEach(groupdata)
    //    finaldetails
        function groupdata(eachcourse){
            const course = {
               courseCode : eachcourse.courseCode.courseCode,
               courseTitle: eachcourse.courseCode.title,
            //    studentsEnrolled:
                studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
            }
            courses.push(course)
            // return courses
        }
        console.log(courses)
        res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
    
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



// fetch data to feed the enrollment page 
export const saveenrolmentdata = async(req, res) => {
    try{
        // Fetch User details

        const enrollmentdata = {
            courseCode : req.body.courseCode
        }
        enrollmentdata.enrolled=true
        enrollmentdata.approval=0
        // console.log(enrollmentdata)
        
        const courseincurriculummodel = await CurriculumModel.findOne({courseCode:enrollmentdata.courseCode})
        const courseidincurriculum = courseincurriculummodel._id
        enrollmentdata.courseCode = courseidincurriculum
        if(courseincurriculummodel){
            enrollmentdata.courseCategory = courseincurriculummodel.category
            const newenrollmentdata = new EnrollmentModel(enrollmentdata)
            const existsingcourse = await EnrollmentModel.findOne({courseCode:enrollmentdata.courseCode})
            // console.log(existsingcourse)
            if(!existsingcourse){
                await (await newenrollmentdata.save())
                await EnrollmentModel.find().populate("courseCode").then(p=>console.log(p)).catch(error=>console.log(error));
                res.status(200).json({success:true, message:"Enrollment details were saved to database"})
            }
            else{
                await existsingcourse.save();
                await EnrollmentModel.find().populate("courseCode").then(p=>console.log(p)).catch(error=>console.log(error));
                res.status(200).json({success:true, message:"Enrollment details were updated"})
            }
        }
        else{
            res.status(200).json({success:false, message:"No such Course Code is found in the database"})
        }
        // console.log(existsingcourseincurriculummodel)
     
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


