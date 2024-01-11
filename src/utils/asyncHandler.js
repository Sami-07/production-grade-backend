// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (err) {
//         res.status(err.code || 500).json({ success: false, message: err.message });
//     }
// }

// asyncHandler is a utility function that wraps an async route handler so that we don't need to write try/catch blocks in our route handlers.

const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next).catch((err) => {
        next(err);
    })
}


export { asyncHandler };