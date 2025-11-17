const errorController = {}

errorController.throwError = (req, res, next) => {
  const err = new Error("Intentional server error for testing.")
  err.status = 500
  next(err)
}

module.exports = errorController
