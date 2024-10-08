import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend (postman)
    // velidation (empty username, empty email, empty password, wrong password, wrong email)
    // check if user is already exist(check using username and email)
    // check for images and check for avatar
    // upload them to cloudinary
    // create user object - creation call for create entry in db
    // remove password and refresh token fields from response
    // check for usercreation
    // response return

    const {fullName, email, username, password } = req.body
    console.log("email: ", email);

    if(
        [fullName, email, username, password].some( (field) => field?.trim() === "")
    )
    {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [
            { username },
            { email }
        ]
    })


    if(existedUser)
    {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
        throw new apiError(400, "Please upload an avatar")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar)
    {
        throw new apiError(400, "avatar file is required")
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password, 
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser)
    {
        throw new ApiError(500, "something went wrong while creating a new user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


export { registerUser };