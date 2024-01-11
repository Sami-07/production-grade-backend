import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId })
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //Steps in Creating a user
    //1. Get user data from req.body
    //2. Check if the fields are empty
    //3. Check if the email is valid
    //4. Check if the email is already taken (exists in the database)
    //5. Check if the password is strong enough
    //6. create a new user in the database
    //7. Return Response excluding password and refresh token 
    const { fullName, email, userName, password } = req.body;
    // console.log(req.body);
    if ([fullName, email, userName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existedEmail = await User.findOne({ email: email });
    if (existedEmail) {
        throw new ApiError(409, "Email is already taken. Please try another one")
    }
    const existedUserName = await User.findOne({ userName: userName });
    if (existedUserName) {
        throw new ApiError(409, "userName is already taken. Please try another one")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required to save locally");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar is required for uploading on cloudinary");
    }

    const user = await User.create({
        email,
        userName,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    //.select is used to exclude fields from the returned document.
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    //1. Get email and password from req.body
    //2. Check if the fields are empty
    //3. Check if the email is valid
    //4. Check if the email exists in the database
    //5. Check if the password is correct
    //6. Generate access token and refresh token
    //7. Return Response with access token and refresh token
    const { email, password } = req.body;
    if ([email, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new ApiError(401, "Email does not exists");
    }
    const isMatched = await user.isPasswordCorrect(password);
    if (!isMatched) {
        throw new ApiError(401, "Email or password is incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully"));

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findOneAndUpdate({ _id: req.user._id }, { refreshToken: "" });

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is required");
        }
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ _id: decodedToken._id });
        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "refresh token does not match");
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, error.message);
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken}

