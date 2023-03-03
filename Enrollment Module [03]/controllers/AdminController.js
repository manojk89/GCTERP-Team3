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
export const CE_Admin_getenrollmentstatus = async(req, res) => {
    try{
        const { sem, batch } = req.body
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:sem,batch:batch}})
        // console.log(enrollmentstatus);
        if(enrollmentstatus.enrollment.status == 'Active'){
            res.status(200).json({success:true, message:"Enrollment is enabled"})
        }else{
            res.status(200).json({success:false, message:"Enrollment is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



export const CE_Admin_modifyenrollmentstatus = async(req, res) => {
    try{
        const { sem, batch } = req.body
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:sem,batch:batch}})
        if(!enrollmentstatus){
            console.log("Semester metadata model not found!!")
        }else{

            console.log(enrollmentstatus)
            // const enrollmentstatus = await SemesterMetadataModel.find({})
        // Should define an streams to close enrollment based on date
        
        enrollmentstatus.enrollment.status = req.body.status
        enrollmentstatus.enrollment.start = req.body.start
        enrollmentstatus.enrollment.end = req.body.end
        
        await enrollmentstatus.save()
    }
        res.status(200).json({success:true, message:"Enrollment data is modidified"})
         
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


// fetch data to feed the enrollment page 
export const CE_Admin_getenrolledstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             

        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
               
               
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
            //    studentsEnrolled:
                studentsList:nstudents
                
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
        //     enrollmentdata.forEach(groupdata)
        // //    finaldetails
        
        //     function groupdata(eachcourse){
            
            //         const course = {
                //            courseCode : eachcourse.courseCode.courseCode,
                //            courseTitle: eachcourse.courseCode.title,
                //         //    studentsEnrolled:
    //             studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
    //         }
    //         courses.push(course)

    //         // return courses
    //     }
        // console.log(courses)
        //     res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


export const CE_Admin_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    message = "These Students have not enrolled for given courses"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval == 10 && enrollmentdata.enrolled){
                    message = "These students are already enrolled/approved"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(student.approval == -4){
                    enrollmentdata.enrolled = false
                    enrollmentdata.approval = -4
                }
                
                if(student.approval == 4){
                    enrollmentdata.approval = student.approval
                    enrollmentdata.enrolled = true
                }else{
                    enrollmentdata.enrolled = false
                }

                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


export const CE_Admin_addstudents = async(req, res) => {
    try{
        const {courses} = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(foundenrollmentdata){
                    message = "These Students have already enrolled for given courses"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled : true,
                    approval : 4
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.regulation = studentinfo.regulation
                if(courseinfo.category =="PE" || courseinfo.category=="OE"){
                    // console.log(course.electiveType)
                    enrollmentdata.courseCategory = course.electiveType
                }else{
                    enrollmentdata.courseCategory = courseinfo.category
                }
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch

                if(studentinfo.currentSemester%2==0){
                    enrollmentdata.semType="even"
                }else{
                    enrollmentdata.semType="odd"
                }
                
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                 
                const result = await newenrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


export const CE_Admin_removestudents = async(req, res) => {
    try{

        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOneAndDelete({courseCode:courseinfo._id,studentId:studentinfo._id})
                console.log(foundenrollmentdata)
               
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////
export const CR_Admin_getCourseRegistrationtatus = async(req, res) => {
    try{
        const { sem, batch } = req.body
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:sem,batch:batch}})
        // console.log(enrollmentstatus);
        if(enrollmentstatus){
            if(enrollmentstatus.courseRegistration.status == 'Active'){
                res.status(200).json({success:true, message:"course Registration is enabled"})
            }else{
                res.status(200).json({success:false, message:"course Registration is not enabled"})
            }
        }else{
            res.status(200).json({success:false, message:"Unable to find the status in semester metadata collection"})
            console.log("Unable to find the status in semester metadata collection")
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_Admin_modifyCourseRegistrationStatus = async(req, res) => {
    try{
        const { sem, batch } = req.body
        const crstatus = await SemesterMetadataModel.findOne({semester:{sem:sem,batch:batch}})
        // console.log(enrollmentstatus)
        // const enrollmentstatus = await SemesterMetadataModel.find({})
        // Should define an streams to close enrollment based on date
        
        crstatus.courseRegistration.status = req.body.status
        crstatus.courseRegistration.start = req.body.start
        crstatus.courseRegistration.end = req.body.end

        await crstatus.save()
        res.status(200).json({success:true, message:"course Registration data is modidified"})
         
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_Admin_getRegisteredstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},enrolled:true,approval:{$in:[-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             
        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
                studentsList:nstudents
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
        //     enrollmentdata.forEach(groupdata)
        // //    finaldetails
        
        //     function groupdata(eachcourse){
            
            //         const course = {
                //            courseCode : eachcourse.courseCode.courseCode,
                //            courseTitle: eachcourse.courseCode.title,
                //         //    studentsEnrolled:
    //             studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
    //         }
    //         courses.push(course)

    //         // return courses
    //     }
        // console.log(courses)
        //     res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_Admin_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    message = "These Students have not enrolled for given courses"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(enrollmentdata.approval == 14 && enrollmentdata.enrolled){
                    message = "These students are already enrolled && approved"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(student.approval == -14){
                    enrollmentdata.approval = -14
                }
                
                if(student.approval == 14){
                    enrollmentdata.approval = student.approval
                }

                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_Admin_addstudents = async(req, res) => {
    try{
        const {courses} = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(foundenrollmentdata){
                    message = student.register + "This Student have already registeredfor given course " + course.courseCode
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled : true,
                    approval : 14
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.regulation = studentinfo.regulation
                enrollmentdata.courseCategory = courseinfo.category
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch

                if(studentinfo.currentSemester%2==0){
                    enrollmentdata.semType="even"
                }else{
                    enrollmentdata.semType="odd"
                }

                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                 
                const result = await newenrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_Admin_removestudents = async(req, res) => {
    try{

        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
                if(foundenrollmentdata){
                    foundenrollmentdata.approval = 4
                    await foundenrollmentdata.save().then(p=>console.log(p))
                }else{
                    console.log("The enrollment Collection was not found for student" + studentinfo.register + " for coursecode: "+ courseinfo.courseCode)
                }
                // console.log(foundenrollmentdata)
               
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


