const Joi = require("joi");

const analyzeSchema = Joi.object({
  domain: Joi.string().hostname().required(),
  url: Joi.string().uri().required(),
  hasHttps: Joi.boolean().required(),
  pageSnippet: Joi.string().max(500).optional().allow(""),
});

function validateAnalyzeRequest(req, res, next) {
  const { error } = analyzeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = { validateAnalyzeRequest };
