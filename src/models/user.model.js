import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudinary URL 
        required: true,
    },
    coverImage: {
        type: String
    },
    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"

    },
    password: {
        type: String,
        required: [true, "Password is required"], //when password is not provided, this message will be shown as error
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

//pre save hook will run just before saving the user
//we used if else because we don't want to hash the password again and again when we update the user details like avatar
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    else {
        next();
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    //"this.password" is the hashed password in the database
    //"password" is the password that user entered
}
userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign({
        _id: this._id     
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User = mongoose.model("User", userSchema);