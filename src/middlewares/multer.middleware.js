// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "/public/temp")
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now()
//         cb(null, file.fieldname )
//     }
// })

// export const upload = multer({ storage: storage })


import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const originalName = file.originalname;
 const newFileName = uniqueSuffix + " - " + originalName;
    cb(null, newFileName);
  },
});

export const upload = multer({
  storage,
})