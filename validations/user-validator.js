const { check, validationResult } = require("express-validator");

const validationRules = () => {
  return [
    check("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    check("name")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Name must be between 1 and 20 characters"),
    check("password")
      .trim()
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6 and 16 characters"),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const resultErrors = [];
  errors.array().map((err) => {
    resultErrors.push({ [err.param]: err.msg });
    console.log(`Validation error on ${err.param}: ${err.msg}`); // Log the validation error
  });

  resultErrors.push({ message: "Action unsuccessful" });
  resultErrors.push({ errors });
  resultErrors.push({ success: false });

  const errorObject = Object.assign({}, ...resultErrors);

  // Log the final error object for debugging
  console.log("Validation failed with errors:", errorObject);

  return res.status(422).json(errorObject);
};

module.exports = {
  validationRules,
  validate,
};
