 require('dotenv').config();
const express=require('express');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const app=express();

app.use(express.json());

const port=process.env.PORT||3000;
const JWT_SECRET=process.env.JWT_SECRET;

  // Auth middleware
  const verifyToken=(req,res,next)=>{
     const authHeader=req.headers['authorization'];
      
      const token =authHeader && authHeader.split(' ')[1];

       if(!token){
          return res.status(401).json({message:"Unathorized"});
       }

       jwt.verify(token,JWT_SECRET,(err,user)=>{
          if(err){
             return res.status(401).json({message:"Unathorized"});
          }
          req.user=user;
          next();
       })
  }

 const UserSchema=new mongoose.Schema({
       name:{type:String,required:true},
       email:{type:String,required:true,unique:true},
       password:{type:String,required:true},
 },{timestamps:true});

 const todoSchema=new mongoose.Schema({
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'User',
       required:true
    },
    title:{
        type:String,
        required:true
    },
     description:{
         type:String
     },
     completed:{
       type:Boolean,
       default:false,
     }
 },{timestamps:true});

 const Todo=mongoose.model('Todo',todoSchema);
 
 const User=mongoose.model('User',UserSchema);

// User registation 
app.post('/register',async (req,res)=>{

     try{
     const {name,email,password}=req.body;
      if(!name || !email || !password){
         return res.status(401).json({error:"All fields are required."})
      }

      const alreadyExisted=await User.findOne({email});
      if(alreadyExisted){
         return res.status(400).json({error:"User already exist with this email"});
         
      }

       //Password hashing
        const salt=await bcrypt.genSalt(10);
         const hashedPassword=await bcrypt.hash(password,salt);

      const newUser= new User({name,email,password:hashedPassword});
      const saved=await newUser.save();

      const userResponse={
          _id:saved._id,
          name:saved.name,
          email:saved.email,
          createdAt:saved.createdAt
      }

       return res.status(201).json({message:"User registered Successfully",user:userResponse});

   }catch(err){
       console.error(err);
        return res.send(500).json({message:"Internal Server error"});
   }





});


//2. Login user

app.post('/login',async (req,res)=>{
      try{
           const {email,password}=req.body;
            if(!email || !password){
                return res.send(400).json({message:"All fields are required"});
            }

            const user=await User.findOne({email});
             if(!user){
                return res.status(400).json({error:"Invalid email or password"});
             }

             const isMatch=await bcrypt.compare(password,user.password);
              if(!isMatch){
                 return res.status(400).json({error:"Invalid email or password"});
              }

              //Jwt token Generate karege valid for 1 day
               const token=jwt.sign(
                   {id:user._id,email:user.email},
                   JWT_SECRET,
                   {expiresIn:'1d'}
               );

               return res.status(200).json({
                   message:"Login Successfully",
                   token:token
               })

      }catch(err){
          console.error(err);
           return res.status(500).json({message:"Internal server error"});
      }
});

//Post todos

app.post('/todos',verifyToken,async (req,res)=>{
     try{
       const {title,description}=req.body;

        if(!title){
            return res.status(400).json({error:"Title is required for a todo item"});
        }

        // make new todo
         const newTodo=new Todo({
             userId:req.user.id,
             title,
             description
         });
         const savedTodo=await newTodo.save();
          
         return res.status(201).json(savedTodo);
     }catch(err){
       console.error(err);
        return res.status(500).json({message:"Internal Server error"});
     }
});

app.put('/todos/:id',async(req,res)=>{
      try{
    const {id}=req.params;
     const {title,description,completed}=req.body;
     
      if(!id){
           return res.status(400).json({error:"Please provide the id"})
      }

      const td=await Todo.findById(id);
       if(!td)
       {
         return res.status(404).json({error:"Todo not found"});
       }

       //eske baad ownership check (403 forbidden)
         if(td.userId.toString()!==req.user.id){
            return res.status(403).json({message:"Forbidden"}); //means agar koi or user kisi doosre ki todo list ko agar update krne ki kosis kare to usme forbidden error diya jata hai smjhe
         }
       
         if(title!==undefined) td.title=title;
          if(description!==undefined)td.description=description;
          if(completed!==undefined)td.completed=completed;

          const updatedTodo=await td.save();
           return res.status(200).json(updatedTodo);

    

     

      }catch(err){
          console.error(err);
           return res.status(500).json({error:"Internal server error"});
      }

      
});

//delete todo item
app.delete('/todos/:id',async (req,res)=>{
     
      try{
         const {id}=req.params;
         if(!id){
             return res.status(400).json({error:"id required"});
         }

         const item=await Todo.findById(id);
          if(!item){
             return res.status(404).json({error:"No item found with this id"});
          }
          
           if(item.userId.toString()!==req.user.id){
              return res.status(403).json({message:"Forbidden"});
           }

           await item.findByIdAndDelete(id);

            return res.status(204).send(); // 204 means no content sir
          
      }catch(err){
         console.error(err);
          return res.status(500).json({error:"Internal Server error"});
      }
})

app.listen(port,()=>{
     console.log(`Server is running on port : ${port}`);
});