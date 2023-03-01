///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////
import { SemesterMetadataModel } from '../models/SemesterMetadataModel.js'
import { ElectiveMetadataModel } from '../models/ElectiveMetadataModel.js'
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { CurriculumModel } from '../models/CurriculumModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
import { ValueAddedCourseModel } from '../models/ValueAddedCourseModel.js'
import { ExternalsModel } from '../models/ExternalsModel.js'

// check for enrolment status
export const checkforenrolment = async(req, res) => {
    try{
        const studentmail = "abir.1918101@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
       
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        
        if(enrollmentstatus.enrollment.status == 'Active'){
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
        const studentmail = "abir.1918101@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
        // console.log(studentinfo)
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
        // console.log(enrollmentstatus)
        if(enrollmentstatus.enrollment.status == 'Active'){
            
            const mandatorycourses = await CurriculumModel.find({semester:studentinfo.currentSemester,branch:studentinfo.branch})
            const allowedelectivecourses = await ElectiveMetadataModel.findOne({regulation:studentinfo.regulation,branch:studentinfo.branch,semester:studentinfo.currentSemester})
           console.log(allowedelectivecourses)
            const pecourses = await CurriculumModel.find({branch:studentinfo.branch,category:"PE"})
            // console.log(pecourses)
            const oecourses = await CurriculumModel.find({category:"OE"})
            let addonallowed
            // This might be changed, suggest => Get this value predefault in regulation/curriculum
            if(studentinfo.currentSemester>=5){
                addonallowed = true
            }
            
            res.status(200).json({success:true, msg:"Enrollment details are fetched",Semester:studentinfo.currentSemester,oecountallowed:allowedelectivecourses.oe,pecountallowed:allowedelectivecourses.pe,addonallowed,courses:{mandatorycourses,pecourses,oecourses}})
            
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled, Can't send courses"})
        }

    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}



// save the user enrolled course to the database
export const saveenrolmentdata = async(req, res) => {
    try{
   
        const coursesenrolled = {
            courseCode : req.body.courses
        }
        const enrollmentdata = {
            enrolled : false,
            approval : 0
        }
        
        // Fetch User details
        const usermail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:usermail})
       
        enrollmentdata.studentId = studentinfo._id
        enrollmentdata.semester = studentinfo.currentSemester
        enrollmentdata.branch = studentinfo.branch
        enrollmentdata.type = "normal"
        
        EnrollmentModel.deleteMany({studentId:studentinfo._id,approval:0,enrolled:false}).then(p=>console.log(p))
          
        coursesenrolled.courseCode.forEach(savetodb);
        async function savetodb(eachcourse) {
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
            enrollmentdata.courseCode = courseincurriculummodel._id
    
            if(courseincurriculummodel){
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                await newenrollmentdata.save()   
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

// check for Registration status
export const checkforregistration = async(req, res) => {
    try{
        const studentmail = "siva.1917145@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
       
        const registrationstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        
        if(registrationstatus.courseRegistration.status == 'Active'){
            res.status(200).json({success:true, msg:"Registration is enabled"})
        }else{
            res.status(200).json({success:false, msg:"Registration is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

//fetch data and feed to registartion
export const getregisterdata = async(req, res) => {

try{
    // fetch the data from user login
    const studentmail = "mano.1917130@gct.ac.in"
    const studentinfo = await StudentsModel.findOne({email:studentmail})

    // console.log(studentinfo)
    const registerstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
    let enrolledCourses = [], RACourses =[], SACourses = [], internship = [], activityPoints =[], DroppedCourses = [] , allowApplyForIntern = false, allowApplyForActPoints = false
    
    if(registerstatus.courseRegistration.status == 'Active'){
        
        const db_enrolledCourses = await EnrollmentModel.find({studentId:studentinfo._id, type:"normal", enrolled:true, approval:{ $in: [3,4,10] } }).populate("courseCode", {courseCode:1,title:1,_id:0})
       
        for(let eachdoc of db_enrolledCourses){
            let obj  = {
                courseCode:eachdoc.courseCode.courseCode,
                courseTitle:eachdoc.courseCode.title,
                approval:eachdoc.approval
            }
            enrolledCourses.push(obj)
        }

        // Re - Appear Courses
        const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:0})
        for(let eachdoc of db_RACourses){
            RACourses.push(eachdoc.courseId)
        }

        // Re - Registration courses
        const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:0})
        for(let eachdoc of db_SACourses){
            SACourses.push(eachdoc.courseId)
        }

        // Dropped Courses courses
        const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:0})
        for(let eachdoc of db_DroppedCourses){
            DroppedCourses.push(eachdoc.courseCode)
        }
        
        // fetch internship details
        const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
        
        // since no collection will be created for new users
        if(!db_internship){
            
            // check whether the coursecode for internship is available in curriculum
            const courseData = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
            if(courseData){
                const createEnrollmentModel = {
                    type:"internship",
                    studentId:studentinfo._id,
                    courseCode:courseData._id,
                    branch:studentinfo.branch,
                    semester:studentinfo.currentSemester,
                    enrolled:true,
                    approval:10
                }
                
                // check whether details are available in enrollment collection
                const checkindbforenrollmen = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseData._id})
                
                // update to new
                if(checkindbforenrollmen){
                    checkindbforenrollmen = createEnrollmentModel
                    await checkindbforenrollmen.save()
                }
                else{
                    // create a new row in enrollment collection
                    const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                    await newenrollmentModel.save()
                    console.log("new enrollment collection for internship is created")
                }

                // create a new value added collection
                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"internship",
                    value:0
                }
                const result = new ValueAddedCourseModel(studentData)
                const getvalue = await result.save()
                console.log("new value added collection for internship is created")
                internship.push(getvalue.value)
                allowApplyForIntern = true
            }else{
                console.log("The courseCode for internship is not available in curriculum")
            }
        
        // for an existing user send the available info
        }else{

            if(db_internship.value>6){
                internship.push(db_internship.value)
                allowApplyForIntern = false
            }else{
                internship.push(db_internship.value)
                allowApplyForIntern = true
            }
        }

        // fetch activity points details
        const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})

        // since no collection will be created for new users
        if(!db_activityPoints){

            // check whether the coursecode for activity points is available in curriculum
            const courseData = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
            
            if(courseData){
                const createEnrollmentModel = {
                    type:"activityPoints",
                    studentId:studentinfo._id,
                    courseCode:courseData._id,
                    branch:studentinfo.branch,
                    semester:studentinfo.currentSemester,
                    enrolled:true,
                    approval:10
                }

                // check whether details are available in enrollment collection
                const checkindb = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseData._id})
                
                if(checkindb){
                    checkindb = createEnrollmentModel
                    await checkindb.save()
                }else{
                    const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                    await newenrollmentModel.save()
                    console.log("New enrollment collection for Activity points has been added to db")
                }

                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"activityPoints",
                    value:0
                }
                const result = new ValueAddedCourseModel(studentData)
                const getpoints = await result.save()
                
                console.log("New Value added for Activity points has been added to db")
                
                activityPoints.push(getpoints.value)
                allowApplyForActPoints = true

            }else{
                console.log("The course code for activty points is not available for this students regulation")
            }
            
        }else{
            activityPoints.push(db_activityPoints.value)
            
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                allowApplyForActPoints = true
            }
            if(studentinfo.type == "lateral" && db_internship.value<75){
                allowApplyForActPoints = true
            }

        }
        
        res.status(200).json({success:true, msg:"Registration details are fetched",enrolledCourses, RACourses, SACourses, DroppedCourses, allowApplyForIntern, internship, allowApplyForActPoints ,activityPoints})
        
    }else{
        res.status(200).json({success:false, msg:"Registration is not enabled, Can't send courses"})
    }

    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}


//save registration data to database
export const saveCourseRegisteration = async(req, res) => {
    try{
        let invalidCourse = [], invalidracourse=[], invalidsacourse=[],invalidDroppedcourse=[]
        let message,success=false, registeredForInternship, registeredForActivityPoints
        
        const coursesenrolled = {
            courseCode : req.body.enrolledCourses
        }

        const RACourses = {
            reappearCourse : req.body.RACourses
        }

        const SACourses = {
            reRegistrationCourse : req.body.SACourses
        }

        const DroppedCourses = {
            droppedCourse : req.body.droppedCourses
        }
       
        
        const intern = req.body.internship
        const actPoints = req.body.ActivityPoints
        
        // Fetch User details
        const usermail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:usermail})

        for(let eachcourse of coursesenrolled.courseCode){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
        
            if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(enrollmentdata.enrolled==false){
                    success = false
                    // console.log(eachcourse)
                    invalidCourse.push(eachcourse)
                    message = "You have not enrolled for these courses or these courses may not be approved"
                    console.log(message)
                    // console.log(invalidCourse)
                }
                else{
                    success = true
                    // console.log(enrollmentdata)
                    message = "Registration details were saved to database"
                    console.log(message)
                    enrollmentdata.approval = 10
                    await enrollmentdata.save()
                }
            }
            else{
                invalidCourse.push(eachcourse)
                success = false
                message = "These Course Codes were not found in the database(Curriculum)"
                console.log(message)
            }
        }

        for(let eachracourse of RACourses.reappearCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachracourse})
        
            if(courseincurriculummodel){
                const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_RACourses){
                    success=false,
                    message="This course code was not present in arrear collection for this student"
                    console.log(message)
                    invalidracourse.push(eachracourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        message="It looks like you have not enrolled for this course"
                        console.log(message)
                        invalidracourse.push(eachracourse)
                    }else{
                        success = true
                        message = "Registration details were saved to database"
                        // enrollmentdata.type="RA"
                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                    }
                }
               
            }
            else{
                invalidCourse.push(eachracourse)
                success = false
                message = "These Course Codes were not found in the database(Curriculum)"
                console.log(message)
            }

        }

        for(let eachdroppedcourse of DroppedCourses.droppedCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachdroppedcourse})
        
            if(courseincurriculummodel){
                const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_DroppedCourses){
                    success=false,
                    message="This course code was not present in arrear collection for this student"
                    invalidDroppedcourse.push(eachdroppedcourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        message="It looks like you have not enrolled for this course"
                        invalidDroppedcourse.push(eachdroppedcourse)
                    }else{
                        success = true
                        message = "Registration details were saved to database"
                        enrollmentdata.type="dropped"
                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalidDroppedcourse.push(eachdroppedcourse)
                success = false
                message = "These Course Codes were not found in the database(Curriculum)"
            }

        }


        for(let eachsacourse of SACourses.reRegistrationCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachsacourse})
        
            if(courseincurriculummodel){
                const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_SACourses){
                    success=false,
                    message="This course code was not present in arrear collection for this student"
                    invalidracourse=[].push(eachsacourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        message="It looks like you have not enrolled for this course"
                        invalidracourse.push(eachsacourse)
                    }else{
                        success = true
                        message = "Registration details were saved to database"

                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalid.push(eachsacourse)
                success = false
                message = "These Course Codes were not found in the database(Curriculum)"
            }
        }

        if(actPoints){
            const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})
            let flag=false
            console.log(db_activityPoints.value)
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                // allowApplyForActPoints = true
                flag = true
                // message = "student registered for internship"
            }else if(studentinfo.type == "lateral" && db_internship.value<75){
                // allowApplyForActPoints = true
                flag = true
            }
            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(enrollmentdata.enrolled==false || enrollmentdata.approval!=10){
                    success = false
                    registeredForInternship = false
                    console.log("The internship for this student is not found in the enollment collections")

                }else{
                    success = true
                    registeredForInternship = true
                    message = "Registration details were saved to database"
                    enrollmentdata.approval = 10
                    await enrollmentdata.save()
                }
                }else{
                    registeredForInternship = false
                    message = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
                    console.log(message)
                }
            }else{
                registeredForInternship = false
                console.log("Student unable to register for Internships because the student may already met his requirements(i.e -> intern credits > 6)")
            
            }
        }

        if(intern){
            const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
            let flag=false
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_internship.value<6){
                // allowApplyForActPoints = true
                flag = true
                // message = "student registered for internship"
            }
            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(enrollmentdata.enrolled==false || enrollmentdata.approval!=10){
                    success = false
                    registeredForActivityPoints = false
                    // console.log(eachcourse)
                    
                    // message = "You have not enrolled for these courses or these courses may not be approved"
                    console.log("The activity Points for this student is not found in the enollment collections")
                    // console.log(message)
                    // console.log(invalidCourse)
                }else{
                    success = true
                    // console.log(enrollmentdata)
                    message = "Registration details were saved to database"
                    enrollmentdata.approval = 50
                    const result = await enrollmentdata.save()
                    if(result){
                        registeredForActivityPoints = true
                    }else{
                        registeredForActivityPoints = false
                    }
                }
                }else{
                    registeredForInternship = false
                    message = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
                    console.log(message)
                }
            }else{
                // message="Student unable to register for Activity Points"
                registeredForActivityPoints = false
                console.log("Student unable to register for Activity Points because the student may already met his requirements(i.e -> activityPoints> 100||75)")
            }
        }

        res.status(200).json({success:success, message:message,invalidCourse,invalidracourse, invalidsacourse,registeredForActivityPoints,registeredForInternship})
        
     
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


// export const savedata = async (req,res) => {
//     try{   
//         const gettingdata = await StudentsModel.findOne({email:"mano.1917130@gct.ac.in"});
//         console.log(gettingdata);
//     const Studentdata = {
//            studentId: gettingdata._id,
//             semester:gettingdata.currentSemester,
//             branch:gettingdata.branch,
//             type:"Acitivity Points",
//             value:75
//          }
//          const studata = new ValueAddedCourseModel(Studentdata)
//          const result = await studata.save()
//         //  console.log(result);
//         res.status(200).json({success:true, message:"value added course details were saved to database"})
     
//      }
    
//     catch(error){
//         console.log(error);
//         res.status(400).json({success:false,message:"Something wrong happened",Error:error});
//     }
// }


/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


