const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 100 },
  familyName: { type: String, required: true, maxLength: 100 },
  dateOfBirth: { type: Date },
  dateOfDeath: { type: Date },
});

// Arrow functions are not used there because of need of using this
// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  let fullname = "";
  if (this.firstName && this.familyName) {
    fullname = `${this.firstName} ${this.familyName}`;
  }
  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});

// Virtuals for better dates
AuthorSchema.virtual("formattedDateOfBirth").get(function () {
  return this.dateOfBirth
    ? "*" +
        DateTime.fromJSDate(this.dateOfBirth).toLocaleString(DateTime.DATE_MED)
    : "Date of birth not specified";
});

AuthorSchema.virtual("formattedDateOfDeath").get(function () {
  return this.dateOfDeath
    ? " - †" +
        DateTime.fromJSDate(this.dateOfDeath).toLocaleString(DateTime.DATE_MED)
    : "";
});

// Virtuals for formatted YYYY-MM-DD date
AuthorSchema.virtual("dateOfBirthFormattedYYYYMMDD").get(function () {
  return DateTime.fromJSDate(this.dateOfBirth).toISODate();
});

AuthorSchema.virtual("dateOfDeathFormattedYYYYMMDD").get(function () {
  return DateTime.fromJSDate(this.dateOfDeath).toISODate();
});

module.exports = mongoose.model("Author", AuthorSchema);
