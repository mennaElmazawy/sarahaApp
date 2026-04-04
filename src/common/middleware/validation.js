
export const validation = (schema) => {
    return (req, res, next) => {

        let errorResult = []
        for (const key of Object.keys(schema)) {
            const { error } = schema[key].validate(req[key], { abortEarly: false })
            if (error) {
              error.details.forEach((element) => {  errorResult.push({
                key,
                path: element.path[0],
                message: element.message
              })
              })
            }
        }

        if (errorResult.length > 0) {
            return res.status(400).json({ message: "validation error", error: errorResult })
        }
        next()
    }
};
